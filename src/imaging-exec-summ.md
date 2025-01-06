---
toc: false
theme: [air, wide]
title: Imaging - Executive Summary
---

```js
// Import the CampaignAnalyzer class
import { CampaignAnalyzer } from "./components/CampaignAnalyzer.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "d3-require";

import { createSplitPanelSummaryLayout } from "./components/createSplitPanelSummaryLayout.js";
```

```js
import { DataFrame } from "./components/DataFrame.js";
import {
  formatTwoLevel,
  formatStatus,
  sparkbar,
  formatTextBold,
} from "./components/TableFormatters.js";

import { pwcStyle } from "./components/pwcStyle.js";
const styleElement = html`<style>
  ${pwcStyle}
</style>`;
document.head.appendChild(styleElement);
```

<div class="page-title-header ">
<div class="page-title">
Shifting Imaging to Preferred Facility
</div>

<div class="horizontal-line"></div>

Version 3: direct mail + email + microsite for predicted savers

</div>

```js
const config = {
  title: "",
  subtitle: "Current Campaign",
  description: {
    initialText: "This campaign targets members at ",
    highlightedText:
      "elevated likelihood to receive imaging procedures at Non-Preferred facilities",
    finalText:
      " and 'nudges' them to drive them to Preferred locations instead.",
  },
  tabs: [
    {
      name: "Tactics",
      title: "Marketing Tactics",
      subtitle: "Key Strategies",
      description:
        "Key strategies and approaches to reach target audience effectively.",
      isActive: true,
    },
    {
      name: "Channels",
      title: "Distribution Channels",
      subtitle: "Key Strategies",
      description: "Multi-channel approach...",
      isActive: false,
    },
    {
      name: "Measurement",
      title: "Measurement Approach",
      subtitle: "Key Strategies",
      description: "",
      isActive: false,
    },
  ],
  cards: [
    {
      title: "TOTAL VALUE AT STAKE",
      value: "$72M",
      subtitle: "Commercial Fully Insured",
      description:
        "40,000 members with Non-Preferred imaging $1,800 per shift to Preferred",
    },
    {
      title: "RUN-RATE SAVINGS",
      value: "$1.1M",
      subtitle: "Current Campaign (v3)",
    },
  ],
};

const element = createSplitPanelSummaryLayout(config);
view(element);
```

<div style="height: 16px;"></div>

```js
const version = [
  {
    version: {
      header: "Version 1",
      description: "Email w/generic savings,\n no predictive model",
    },
    timeInMarket: {
      header: "5 Months",
      description: "2/1/23 to 7/1/23",
    },
    outreach: 15000,
    costPerChangeBehavior: 1700,
    behaviorChangeLift: "Not Significant",
    value: 0,
    status: "Deprecated",
  },
  {
    version: {
      header: "Version 2",
      description: "Email w/generic savings, no predictive model",
    },
    timeInMarket: {
      header: "5 Months",
      description: "2/1/23 to 7/1/23",
    },
    outreach: 15000,
    costPerChangeBehavior: 1700,
    behaviorChangeLift: "Not Significant",
    value: 0,
    status: "Deprecated",
  },
];

const df_versions = new DataFrame(version);
```

<div class="text-subheader">
Version History
</div>

```js
const table = Inputs.table(version, {
  format: {
    version: formatTwoLevel(),
    timeInMarket: formatTwoLevel(),
    outreach: sparkbar(d3.max(version, (d) => d.outreach)),
    costPerChangeBehavior: (x) => `$${x.toLocaleString("en-US")}`,
    status: formatStatus,
  },
  align: {
    version: "left",
    timeInMarket: "left",
    outreach: "left",
    costPerChangeBehavior: "left",
    behaviorChangeLift: "left",
    value: "left",
    status: "left",
  },
  header: {
    version: "Version",
    timeInMarket: "Time in Market",
    outreach: "Outreach",
    costPerChangeBehavior: "$/Change",
    behaviorChangeLift: "Lift",
    value: "Value",
    status: "Status",
  },
  width: "auto",
  // width: {
  //   version: 200,
  //   timeInMarket: 150,
  //   outreach: 120,
  //   costPerChangeBehavior: 120,
  //   behaviorChangeLift: 150,
  //   value: 100,
  //   status: 100,
  // },
});

view(table);
```

<!--
```js
// Initialize the analyzer with sample data
const analyzer = new CampaignAnalyzer(sampleData);

// Get formatted table data
const tableData = analyzer.formatCampaignData();

````

```js
// Transform data using the analyzer
const selectedTimeSeriesData = analyzer.transformTimeSeriesData(selection);
const selectedMetrics = analyzer.transformMetrics(selection);
const metricTables = analyzer.createMetricTables(selectedMetrics);
const funData = analyzer.getFunnelData(selection);
const steps = [
  "totalBooked",
  "targeted",
  "connected",
  "enrolled",
  "engaged",
  "changedBehavior",
];
const processedData = analyzer.processFunnelData(funData, steps);
const barData = analyzer.createBarChartData(selection);
````

<div class="card">

```js
const selection = view(
  Inputs.table(tableData, {
    columns: [
      "intervention",
      "populationDesc",
      "version",
      "timeInMarket",
      "populationSize",
      "costPerChange",
      "totalImpact",
      "financialImpact",
    ],
    header: {
      intervention: "Intervention",
      populationDesc: "Description",
      version: "Vs",
      timeInMarket: "Runtime ",
      populationSize: "Population",
      costPerChange: "$/BC",
      totalImpact: "Impact @ Scale",
      financialImpact: "Impact @ Pilot",
    },
    layout: "auto",
  })
);
```

</div>

asdfdsasfd
asdf

<table class="table-card-campaign-table">
  <thead>
    <tr>
      <th>Campaign</th>
      <th>Levers</th>
      <th>Version</th>
      <th>Outreach</th>
      <th>$ per Change Behavior</th>
      <th>Behavior Change Lift</th>
      <th>Value</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Shift Imaging to Preferred Facility</td>
      <td>Site of Care & Provider Selection</td>
      <td>v3 <span class="icon">📄</span></td>
      <td>20,000</td>
      <td>$1,800</td>
      <td>3pp</td>
      <td>$1.1M</td>
      <td><span class="status-pill status-booked">Booked <span class="icon">📄</span></span></td>
    </tr>
    <tr>
      <td>Increased Adherence for High Risk of CHF Readmission</td>
      <td>Site of Care & Provider Selection</td>
      <td>v3 <span class="icon">📄</span></td>
      <td>20,000</td>
      <td>$1,800</td>
      <td>3pp</td>
      <td>$1.1M</td>
      <td><span class="status-pill status-booked">Booked <span class="icon">📄</span></span></td>
    </tr>
    <tr>
      <td>Avoid Low Value Procedures</td>
      <td>RX Management</td>
      <td>v3 <span class="icon">📄</span></td>
      <td>20,000</td>
      <td>$1,800</td>
      <td>3pp</td>
      <td>$1.1M</td>
      <td><span class="status-pill status-booked">Booked <span class="icon">📄</span></span></td>
    </tr>
    <tr>
      <td>ASC for Cataracts</td>
      <td>RX Management</td>
      <td>v3 <span class="icon">📄</span></td>
      <td>20,000</td>
      <td>$1,800</td>
      <td>3pp</td>
      <td>$1.1M</td>
      <td><span class="status-pill status-booked">Booked <span class="icon">📄</span></span></td>
    </tr>
    <tr>
      <td>Switch to On-Formulary RX</td>
      <td>RX Management</td>
      <td>v3 <span class="icon">📄</span></td>
      <td>20,000</td>
      <td>$1,800</td>
      <td>3pp</td>
      <td>$1.1M</td>
      <td><span class="status-pill status-pilot">Pilot <span class="icon">📄</span></span></td>
    </tr>
  </tbody>
</table>

## Funnel Analysis

<div class="grid grid-cols-2">
<div class="card">

```js
view(
  Plot.plot({
    height: 200,
    grid: true,
    x: { label: "Stage", domain: steps },
    y: { label: "Population" },
    color: { legend: true },
    marks: [
      Plot.line(
        processedData.flatMap((d) => d.absoluteData),
        { x: "step", y: "value", stroke: "intervention", strokeWidth: 0.5 }
      ),
      Plot.dot(
        processedData.flatMap((d) => d.absoluteData),
        {
          x: "step",
          y: "value",
          fill: "intervention",
          r: 1,
          channels: {
            Intervention: "intervention",
            Step: "step",
            Population: "value",
          },
          tip: {
            format: {
              Intervention: true,
              Step: true,
              Population: true,
              x: false,
              y: false,
              fill: false,
            },
          },
        }
      ),
    ],
  })
);
```

</div>
<div class="card">

```js
view(
  Plot.plot({
    height: 200,
    grid: true,
    x: { label: "Stage", domain: steps },
    y: { label: "Percentage", domain: [0, 100] },
    color: { legend: true },
    marks: [
      Plot.line(
        processedData.flatMap((d) => d.percentageData),
        { x: "step", y: "value", stroke: "intervention", strokeWidth: 0.5 }
      ),
      Plot.dot(
        processedData.flatMap((d) => d.percentageData),
        { x: "step", y: "value", fill: "intervention", r: 1 }
      ),
    ],
  })
);
```

</div>
</div>

## Performance Metrics

<div class="grid grid-cols-2">
<div class="card">

<figure>
<figcaption>Observed Behavior Change Rate Over Time</figcaption>

```js
view(
  Plot.plot({
    marginRight: 60,
    height: 200,
    grid: true,
    x: {
      type: "time",
      label: "Month",
    },
    y: {
      label: "Change Rate (%)",
      grid: true,
    },
    marks: [
      Plot.line(selectedTimeSeriesData, {
        x: "month",
        y: "changeRate",
        stroke: "intervention",
        strokeWidth: 0.5,
      }),
      Plot.dot(selectedTimeSeriesData, {
        x: "month",
        y: "changeRate",
        fill: "intervention",
        r: 1,
        channels: {
          intervention: "intervention",
          Month: (d) => d.month.toLocaleDateString(),
          "Change Rate": (d) => `${d.changeRate.toFixed(2)}%`,
        },
        tip: {
          format: {
            x: false,
            y: false,
            fill: false,
          },
        },
      }),
    ],
  })
);
```

</figure>
</div>

<div class="card">

<figure>
<figcaption>Value per Behavior Change by Campaign</figcaption>

```js
view(
  Plot.plot({
    marginRight: 0,
    marginLeft: 150,
    grid: true,
    inset: 10,
    x: {
      label: "Value per Behavior Change ($)",
    },
    y: {
      label: "",
    },
    marks: [
      Plot.ruleX([0]),
      Plot.barX(barData, {
        x: "costPerChange",
        y: "intervention",
        sort: { y: "x", reverse: true },
      }),
    ],
  })
);
```

</figure>
</div>
</div>

## Engagement Stats

<div class="card">
<figcaption>Engagement Rate Stats </figcaption>

```js
const engageratetable = view(
  Inputs.table(
    metricTables.filter((d) => d.metricName === "Engagement Rate")[0]
      .metricData,
    {
      columns: [
        "intervention",
        "value",
        "lift",
        "pValue",
        "ci_lower",
        "ci_upper",
        "stdDev",
      ],
      header: {
        intervention: "Intervention",
        value: "Rate",
        lift: "Lift",
        pValue: "P",
        ci_lower: "CI (l)",
        ci_upper: "CI (u)",
        stdDev: tex`\sigma`,
      },
      layout: "auto",
    }
  )
);
```

</div>

<div class="card">

  <figcaption>Engaged Population Stats</figcaption>

```js
view(
  Inputs.table(
    metricTables.filter((d) => d.metricName === "Conversion Rate")[0]
      .metricData,
    {
      columns: [
        "intervention",
        "value",
        "lift",
        "pValue",
        "ci_lower",
        "ci_upper",
        "stdDev",
      ],
      header: {
        intervention: "Intervention",
        value: "Rate",
        lift: "Lift",
        pValue: "P",
        ci_lower: "CI (l)",
        ci_upper: "CI (u)",
        stdDev: tex`\sigma`,
      },
      layout: "auto",
    }
  )
);
```

</div>

</div> -->
