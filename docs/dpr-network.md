---
toc: true
title: Personalization
---

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { defaultStyles } from "./components/styles.js";
const styleElement = html`<style>
  ${defaultStyles}
</style>`;

import { Microsite } from "./components/MicroSiteBuilder.js";
document.head.appendChild(styleElement);
```

# Practical method for testing for adverse selection within a provider network

In short, your procedure (control distribution vs. randomized dropout distributions with KS tests) provides a statistical framework for detecting whether the network's construction systematically correlates with certain risk/MLR profiles. If you observe a pattern of significant differences, it's evidence that the network itself could be driving adverse selection.

Steps:
**1. Base Network (Control)**  
 Start with the original provider-patient network. Use claims data to create the bipartite graph of patients and providers. Use a characteristic that's somehow self-normalizing (e.g., individual MLR). The MLR distribution for all patients in this control network represents your baseline.

- Key Assumptions:
  - The claims data accurately reflects the underlying cost and risk characteristics of patients and providers.
  - MLR is an appropriate, stable metric for comparing patient-level risk.
  - Patients are properly attributed to a single provider, and the bipartite network captures the true relationships.

**2. Random Dropout (DPR)**  
 Randomly remove a fraction of providers (and their connected patients) to create a sub-network. By doing this many times (bootstrapping), we generate a distribution of MLR outcomes under random removal conditions. Since we are not reconnecting or reshuffling edges, the remaining network should preserve key structural characteristics except for the randomly removed section. This could get tricky in certain regions (e.g., rural areas), and should only be done for large geographic extents.

- Key Assumptions:
  - Provider dropout is random and not influenced by unobserved characteristics of the providers or patients.
  - The fraction of providers dropped is small enough that the remaining network still roughly represents the original structure and variability.
  - The scale of the network is large enough that random removals do not result in pathologically small or disconnected fragments that bias the MLR distribution.

**3. Comparison via KS Test**  
 For each random dropout iteration, use the KS test to compare the MLR distribution in the reduced (sub) network to the original. If these distributions differ significantly on average (e.g., consistently low p-values), it suggests that removing certain subsets of providers (even at random) leads to systematically different MLR distributions.

- Key Assumptions:
  - The KS test is appropriate for detecting differences in the distribution of MLR between the original and reduced networks.
  - Sufficient sample size in both the original and reduced networks ensures reliable statistical inference.
  - The significance level (e.g., p < 0.05) is appropriate and balanced to detect meaningful differences without generating excessive false positives.

**4. Interpretation Regarding Adverse Selection**  
 If the random subsets frequently produce distributions statistically different from the control, it indicates the network structure influences which members remain and their MLR distribution. In other words, some configurations of the network may be more prone to having patients with different risk profiles. This would hint at adverse selection: the network design itself, even when randomly truncated, yields distributions that deviate from what you'd expect if there were no selection biases baked into the network.

- Key Assumptions:
  - Observed differences in MLR distributions are primarily attributed to the underlying network structure rather than unmeasured external factors.
  - Consistent patterns of significant differences across multiple randomizations strongly suggest structural influences on patient risk distribution.
  - Other potential confounders (e.g., regional differences, provider practice patterns, or patient demographics) do not fully explain the observed differences.

```js

```

```js
function ForceGraph(
  data,
  {
    width = 928,
    height = 600,
    nodeRadius = (d) => (d.type === "provider" ? 15 : 5),
  } = {}
) {
  const links = data.links.map((d) => ({ ...d }));
  const nodes = data.nodes.map((d) => ({ ...d }));

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => (d.type === "provider-provider" ? 100 : 50))
    )
    .force(
      "charge",
      d3.forceManyBody().strength((d) => (d.type === "provider" ? -300 : -30))
    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collide",
      d3.forceCollide((d) => nodeRadius(d) * 2)
    );

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  const link = svg
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", (d) => (d.type === "provider-provider" ? "#666" : "#999"))
    .attr("stroke-opacity", (d) => (d.type === "provider-provider" ? 0.8 : 0.6))
    .attr("stroke-width", (d) => (d.type === "provider-provider" ? 2 : 0.5));

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", nodeRadius)
    .attr("fill", (d) => (d.type === "provider" ? color(d.group) : "#ff4444"))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .call(drag(simulation));

  node.append("title").text((d) => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return svg.node();
}

// P-value plot function
function plotPValues(p_values) {
  return Plot.plot({
    width: 600,
    height: 400,
    margin: 50,
    grid: true,
    x: {
      label: "P-Value",
      domain: [0, 1],
    },
    y: {
      label: "Frequency",
    },
    marks: [
      Plot.rectY(p_values, Plot.binX({ y: "count" })),
      Plot.ruleX([0.05], {
        stroke: "red",
        strokeDasharray: "4",
      }),
    ],
    style: {
      background: "white",
      fontSize: 12,
    },
  });
}

// Helper function to generate random data
function generateData(num_patients = 100, num_providers = 10) {
  const patients = Array.from(
    { length: num_patients },
    (_, i) => `Patient_${i}`
  );
  const providers = Array.from(
    { length: num_providers },
    (_, i) => `Provider_${i}`
  );
  const providerGroups = providers.map((_, i) => `Group_${i % 1}`);

  // Ensure we only use available providers
  const patient_provider_map = patients.map(
    () => providers[Math.floor(Math.random() * providers.length)]
  );

  function randomNormal(mean = 0.8, sd = 0.1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * sd + mean;
  }

  function randomExponential(scale) {
    return -Math.log(1 - Math.random()) * scale;
  }

  const claims_data = patients.map((pat, i) => ({
    Patient: pat,
    Provider: patient_provider_map[i],
    AllowedAmount: randomExponential(100),
    TotalAmount: randomExponential(120),
    MLR: randomNormal(),
    ProviderGroup: providerGroups[providers.indexOf(patient_provider_map[i])],
  }));

  return { patients, providers, providerGroups, claims_data };
}

// Network building function
function buildNetwork(claims_data, providers, providerGroups) {
  const nodes = [];
  const links = [];
  const nodeSet = new Set();

  // Add provider nodes
  providers.forEach((provider, i) => {
    nodes.push({
      id: provider,
      group: providerGroups[i],
      type: "provider",
    });
    nodeSet.add(provider);
  });

  // Add provider-to-provider links
  for (let i = 0; i < providers.length; i++) {
    for (let j = i + 1; j < providers.length; j++) {
      links.push({
        source: providers[i],
        target: providers[j],
        type: "provider-provider",
      });
    }
  }

  // Add patient nodes and provider-patient links
  claims_data.forEach((row) => {
    if (!nodeSet.has(row.Patient)) {
      nodes.push({
        id: row.Patient,
        type: "patient",
        group: null,
      });
      nodeSet.add(row.Patient);
    }

    links.push({
      source: row.Provider,
      target: row.Patient,
      type: "provider-patient",
    });
  });

  return { nodes, links };
}

function removeProvidersAndPatients(network, dropout_fraction) {
  // Deep copy the network to avoid modifying original
  const nodes = JSON.parse(JSON.stringify(network.nodes));
  const links = JSON.parse(JSON.stringify(network.links));

  // Get provider nodes
  const providers = nodes.filter((n) => n.type === "provider");
  const num_to_drop = Math.floor(dropout_fraction * providers.length);

  if (num_to_drop === 0 || num_to_drop >= providers.length) {
    throw new Error("Invalid dropout fraction");
  }

  // Randomly select providers to remove
  const drop_providers = d3
    .shuffle(providers.map((p) => p.id))
    .slice(0, num_to_drop);

  // Find patients connected only to dropped providers
  const provider_patient_map = new Map();
  links.forEach((link) => {
    if (link.type === "provider-patient") {
      if (!provider_patient_map.has(link.target)) {
        provider_patient_map.set(link.target, new Set());
      }
      provider_patient_map.get(link.target).add(link.source);
    }
  });

  // Patients to drop are those whose only providers were dropped
  const drop_patients = Array.from(provider_patient_map.entries())
    .filter(([_, providers]) =>
      Array.from(providers).every((p) => drop_providers.includes(p))
    )
    .map(([patient, _]) => patient);

  // Remove specified nodes and their links
  const remaining_nodes = nodes.filter(
    (n) => !drop_providers.includes(n.id) && !drop_patients.includes(n.id)
  );

  const remaining_links = links.filter(
    (l) =>
      !drop_providers.includes(l.source) &&
      !drop_providers.includes(l.target) &&
      !drop_patients.includes(l.source) &&
      !drop_patients.includes(l.target)
  );

  return {
    nodes: remaining_nodes,
    links: remaining_links,
  };
}

// Example usage:
function visualizeNetworkReduction(originalNetwork, dropout_fraction = 0.3) {
  // Create the reduced network
  const reducedNetwork = removeProvidersAndPatients(
    originalNetwork,
    dropout_fraction
  );

  // Log network statistics
  console.log("Original Network:", {
    providers: originalNetwork.nodes.filter((n) => n.type === "provider")
      .length,
    patients: originalNetwork.nodes.filter((n) => n.type === "patient").length,
    providerLinks: originalNetwork.links.filter(
      (l) => l.type === "provider-provider"
    ).length,
    patientLinks: originalNetwork.links.filter(
      (l) => l.type === "provider-patient"
    ).length,
  });

  console.log("Reduced Network:", {
    providers: reducedNetwork.nodes.filter((n) => n.type === "provider").length,
    patients: reducedNetwork.nodes.filter((n) => n.type === "patient").length,
    providerLinks: reducedNetwork.links.filter(
      (l) => l.type === "provider-provider"
    ).length,
    patientLinks: reducedNetwork.links.filter(
      (l) => l.type === "provider-patient"
    ).length,
  });

  // Return both visualizations
  return {
    original: ForceGraph(originalNetwork),
    reduced: ForceGraph(reducedNetwork),
  };
}

// KS test function
function ksTest(data1, data2) {
  const n1 = data1.length;
  const n2 = data2.length;

  const sorted1 = [...data1].sort((a, b) => a - b);
  const sorted2 = [...data2].sort((a, b) => a - b);

  let i = 0,
    j = 0;
  let d = 0;

  while (i < n1 && j < n2) {
    const x1 = sorted1[i];
    const x2 = sorted2[j];
    const f1 = (i + 1) / n1;
    const f2 = (j + 1) / n2;

    if (x1 <= x2) {
      d = Math.max(d, Math.abs(f1 - f2));
      i++;
    } else {
      j++;
    }
  }

  const ne = Math.sqrt((n1 * n2) / (n1 + n2));
  const lambda = Math.max(d * ne, 0);
  const p = Math.exp(-2 * lambda * lambda);

  return { statistic: d, pValue: p };
}
```

</figure>

---

<figure>
<figcaption> Dropout Network</figcaption>

</figure>

```js
function createDistributionPlots(
  originalNetwork,
  reducedNetwork,
  claims_data,
  {
    visualization_type = "density", // "density", "kde", or "box"
  } = {}
) {
  // Get patient lists for both networks
  const originalPatients = new Set(
    originalNetwork.nodes.filter((n) => n.type === "patient").map((n) => n.id)
  );
  const reducedPatients = new Set(
    reducedNetwork.nodes.filter((n) => n.type === "patient").map((n) => n.id)
  );

  // Filter claims data
  const originalClaims = claims_data.filter((d) =>
    originalPatients.has(d.Patient)
  );
  const reducedClaims = claims_data.filter((d) =>
    reducedPatients.has(d.Patient)
  );

  // Prepare data for box plots
  const prepareBoxData = (metric) => {
    return [
      ...originalClaims.map((d) => ({ value: d[metric], type: "Original" })),
      ...reducedClaims.map((d) => ({ value: d[metric], type: "Reduced" })),
    ];
  };

  // Create plot marks based on visualization type
  const createMarks = (data, metric) => {
    switch (visualization_type) {
      case "density":
        return [
          Plot.density(originalClaims, {
            x: (d) => d[metric],
            fill: "steelblue",
            fillOpacity: 0.5,
            stroke: "steelblue",
            strokeWidth: 2,
          }),
          Plot.density(reducedClaims, {
            x: (d) => d[metric],
            fill: "red",
            fillOpacity: 0.5,
            stroke: "red",
            strokeWidth: 2,
          }),
        ];

      case "kde":
        return [
          // Areas
          Plot.areaY(
            originalClaims,
            Plot.binX(
              { y2: "proportion" },
              {
                x: (d) => d[metric],
                fill: "steelblue",
                fillOpacity: 0.1,
                thresholds: 30,
                curve: "natural",
              }
            )
          ),
          Plot.areaY(
            reducedClaims,
            Plot.binX(
              { y2: "proportion" },
              {
                x: (d) => d[metric],
                fill: "red",
                fillOpacity: 0.1,
                thresholds: 30,
                curve: "natural",
              }
            )
          ),
          Plot.ruleY([0]),
          // Lines
          Plot.lineY(
            originalClaims,
            Plot.binX(
              { y: "proportion" },
              {
                x: (d) => d[metric],
                stroke: "steelblue",
                strokeWidth: 2,
                thresholds: 30,
                curve: "natural",
              }
            )
          ),
          Plot.lineY(
            reducedClaims,
            Plot.binX(
              { y: "proportion" },
              {
                x: (d) => d[metric],
                stroke: "red",
                strokeWidth: 2,
                thresholds: 30,
                curve: "natural",
              }
            )
          ),
        ];

      case "box":
        return [
          Plot.boxY(prepareBoxData(metric), {
            x: "type",
            y: "value",
            fill: (d) => (d.type === "Original" ? "steelblue" : "red"),
            fillOpacity: 0.5,
            stroke: "black",
            strokeWidth: 1,
          }),
          // Add individual points for outliers
          Plot.dot(prepareBoxData(metric), {
            x: "type",
            y: "value",
            stroke: (d) => (d.type === "Original" ? "steelblue" : "red"),
            strokeOpacity: 0.2,
          }),
        ];
    }
  };

  const metrics = [
    { name: "MLR", field: "MLR" },
    { name: "Allowed Amount", field: "AllowedAmount" },
    { name: "Total Amount", field: "TotalAmount" },
  ];

  const plots = metrics.map((metric) => {
    return Plot.plot({
      marginLeft: 60,
      width: 600,
      height: visualization_type === "box" ? 400 : 300,
      y: {
        label:
          visualization_type === "density"
            ? "Density"
            : visualization_type === "kde"
            ? "Proportion"
            : metric.name,
        grid: true,
      },
      x: {
        label: visualization_type === "box" ? "Network Type" : metric.name,
        grid: true,
      },
      marks: createMarks(originalClaims, metric.field),
      title: `${metric.name} Distribution Comparison`,
    });
  });

  return {
    mlrPlot: plots[0],
    allowedPlot: plots[1],
    totalPlot: plots[2],
  };
}

// Example usage with options
function visualizeDistributions(data, dropout_fraction = 0.3, options = {}) {
  const network = buildNetwork(
    data.claims_data,
    data.providers,
    data.providerGroups
  );
  const reducedNetwork = removeProvidersAndPatients(network, dropout_fraction);

  const distributions = createDistributionPlots(
    network,
    reducedNetwork,
    data.claims_data,
    options
  );

  console.log("Network Summary Statistics:", distributions.summary);

  return html`
    <div style="display: grid; gap: 20px; padding: 20px;">
      ${distributions.mlrPlot} ${distributions.allowedPlot} ${distributions.totalPlot}
    </div>
  `;
}
```

```js
const data = generateData(100, 10);
const network = buildNetwork(
  data.claims_data,
  data.providers,
  data.providerGroups
);
const reducedNetwork = removeProvidersAndPatients(network, 0.3);
view(reducedNetwork);
```

<figure>
<figcaption> Original Network</figcaption>

```js
view(visualizations.original);
```

````

```js
view(
  visualizeDistributions(data, 0.3, {
    visualization_type: "kde",
    scale_type: "linear",
  })
);
````

```js
// Example usage
const network = buildNetwork(
  data.claims_data,
  data.providers,
  data.providerGroups
);
const reducedNetwork = removeProvidersAndPatients(network, 0.3);

// Create plots with different visualization types
const densityPlots = createDistributionPlots(
  network,
  reducedNetwork,
  data.claims_data,
  {
    visualization_type: "density",
  }
);

const kdePlots = createDistributionPlots(
  network,
  reducedNetwork,
  data.claims_data,
  {
    visualization_type: "kde",
  }
);

const boxPlots = createDistributionPlots(
  network,
  reducedNetwork,
  data.claims_data,
  {
    visualization_type: "box",
  }
);
```

```js
view(boxPlots.mlrPlot);
view(boxPlots.allowedPlot);
view(boxPlots.totalPlot);
```
