---
theme: light
title: Cluster Randomized Designs
toc: true
---

```js
import {
  calculateSampleSizeForMeans,
  calculateSampleSizeForProportions,
  calculateVarianceFormulaIndividualRandomized,
  calculateVarianceFormulaClusterRandomized,
  generateVarianceData,
  generateUnifiedVarianceData,
} from "./components/parallelmethods.js"
```

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import * as numeric from "https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js"
import { require } from "d3-require"
const jStat = await require("jstat@1.9.4")
```

<style>
      body {
      font: 13.5px/1.5 var(--serif);
      margin: 0;
      max-width: 90%;
      }

      table {
          border-collapse: collapse;
          table-layout:fixed;
          width: 100%;
          height: 20%;
          font: 13.5px/1.5 var(--serif);

      }
      th {
          font: 13.5px/1.5 var(--serif);
          font-weight: bold;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
    }
    tr:last-child td {
        /* font-weight: bold; */
        border-bottom: 1px solid black;
        /* background-color: lightyellow; */
    }
    /* tr:nth-last-child(2) {
        border-bottom: 1px dashed black;
    } */
    td, th {
        text-align: left;
        border-collapse: collapse;
        padding:2px;
        font-size:0.8em;
    }

    .horizontal-line {
    border-top: 0.5px solid #d3d3d3; /* Creates a thin gray line */
    width: 100%; /* Spans the width of the container/page */
    margin-top:10px;
    margin-bottom:10px
    }

    .katex { font-size: 1em; }

      p { max-width: 90% }


</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.2/math.min.js"> </script>

# Cluster Random Designs

Derived from this video [S4b Sample size and power for cluster randomised trial](https://www.youtube.com/watch?v=JOtwZyaJZpk)

<iframe width="560" height="315" src="https://www.youtube.com/embed/JOtwZyaJZpk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

I _love_ the way that Dr. Karla Hemming goes through these, so I thought I would follow-along and codify here work for fun!

<div class = "horizontal-line"></div>

# Cluster Randomized

**Question:** why do the formula's change when using a cluster randomized trial (CRT) design from this:

```js
const equation_3 = tex.block`\begin{equation} \text{Var}(\overline{Y}) = \frac{\sigma^2}{n} \end{equation}`
const equation_4 = tex.block`\begin{equation} \text{Var}(\overline{Y}) = \frac{\sigma^2}{k \cdot m} \left[ 1 + (m - 1) \cdot \rho \right] \end{equation}`
```

```js
view(equation_3)
```

Where ${tex`\sigma^2`}is the variance of the outcome variable, and ${tex`n`}: is the total number of individuals.

To this?

```js
view(equation_4)
```

Where ${tex`\sigma^2`} is the variance of the outcome variable, ${tex`m`} is the average cluster size (number of individuals per cluster), ${tex`\rho`} is the intracluster correlation coefficient (ICC), and ${tex`K`} is the total number of clusters per arm.

**Answer:** Subjects within the same cluster may be more similar to each other than to subjects in other clusters. This correlation leads to an increase in the variance compared to simple random sampling.

This: ${tex`\left[ 1 + (m - 1) \rho \right]`} is known as the **inflation effect** or **design effect**

What is the difference? Does this matter?

```js
const sigma_var = Inputs.range([0, 10], {
  value: 0.1,
  step: 0.1,
  label: tex`\text{standard dev.}:~\sigma`,
})
view(sigma_var)

const n_var = Inputs.range([0, 1000], {
  value: 30,
  step: 0.1,
  label: tex`\text{num subjects}:~n`,
})
view(n_var)

const k_var = Inputs.range([0, 10], {
  value: 3,
  step: 1,
  label: tex`\text{num of clusters}:~k`,
})
view(k_var)

const m_var = Inputs.range([0, 10], {
  value: 5,
  step: 1,
  label: tex`\text{subj. per cluster}:~m`,
})
view(m_var)

const rho_var = Inputs.range([0, 1], {
  value: 0.1,
  step: 0.05,
  label: tex`\text{ICC}:~\rho`,
})
view(rho_var)
```

```js
const sigma_var_selection = Generators.input(sigma_var)
const n_var_selection = Generators.input(n_var)
const k_var_selection = Generators.input(k_var)
const m_var_selection = Generators.input(m_var)
const rho_var_selection = Generators.input(rho_var)
```

For equivalence, set ${tex`n=k \cdot m`}

```js
const variance1 = calculateVarianceFormulaIndividualRandomized(
  sigma_var_selection,
  n_var_selection
)
const variance2 = calculateVarianceFormulaClusterRandomized(
  sigma_var_selection,
  k_var_selection,
  m_var_selection,
  rho_var_selection
)
```

^ ICC: intra-cluster correlation coefficient.
${tex`\text{Var}_\text{Individual}=` } ${variance1.toFixed(3)}
${tex`\text{Var}_\text{cluster}=` } ${variance2.toFixed(3)}

```js
const variables = [
  { name: tex`n`, variable: "n", range: d3.range(1, 100, 0.1) },
  { name: tex`k`, variable: "k", range: d3.range(1, 10, 0.1) },
  { name: tex`m`, variable: "m", range: d3.range(1, 20, 0.1) },
  { name: tex`\rho`, variable: "rho", range: d3.range(0, 1.1, 0.1) },
]
const favorite = Inputs.radio(variables, {
  label: "Pick a variable",
  format: (x) => x.name,
  value: variables[2],
})
view(favorite)
const favorite_selection = Generators.input(favorite)
```

```js
// Generate data
const unifiedData = generateUnifiedVarianceData(
  favorite_selection.variable,
  favorite_selection.range,
  sigma_var_selection,
  k_var_selection,
  m_var_selection,
  rho_var_selection,
  n_var_selection
)
```

```js
const variance_comparison = Plot.plot({
  grid: true,
  marginLeft: 80,
  x: { label: favorite_selection.variable },
  y: { label: "Variance" },
  color: {
    legend: true,
    domain: ["Individual Variance", "Cluster Variance", "Variance Delta"],
  },
  marks: [
    Plot.line(unifiedData, {
      x: "x",
      y: "variance",
      stroke: "variance_type",
    }),
    Plot.frame(),
    Plot.gridY({
      strokeDasharray: "0.75,2", // dashed
      strokeOpacity: 1, // opaque
    }),
    Plot.axisY([0]),
  ],
})
view(variance_comparison)
```

## Quantifying the effect of clustering

The ICC, or ${tex`\rho`} quantifies the effect of clustering. It's a quantity between 0--1.

```js
const equation_icc = tex.block`\begin{equation} 
\rho = \frac{\sigma_b^2}{\sigma_b^2 + \sigma_w^2} 
\end{equation}`

view(equation_icc)
```

Where ${tex`\sigma_b^2`} is the _between_ cluster variance and ${tex`\sigma_b^2`} is the _within_ cluster variance.

The total variance is equal to the sum of the between and within cluster variance:

```js
const equation_variance = tex.block`\begin{equation} 
\sigma^2 = \sigma_b^2 + \sigma_w^2 
\end{equation}`
view(equation_variance)
```

So when we're trying to determine the sample size in a cluster randomized trial, the required number of subjects in each arm is inflated by the design effect.

```js
const equation_sample_size = tex.block`\begin{equation} 
km = \left[ 1 + (m - 1) \rho \right] \frac{(z_{1-\alpha/2} + z_{\beta})^2 2 \sigma^2}{(\mu_1 - \mu_2)^2}
\end{equation}`
view(equation_sample_size)
```



Becomes:

```js
const equation_km = tex.block`\begin{equation} 
k\cdot m = \left[ 1 + (m - 1) \rho \right]\cdot n
\end{equation}`
view(equation_km)
```

Where we then divide by ${tex`m`} to get the number of clusters per arm, ${tex`k`} for a CRT testing two proportions.

```js
const equation_k = tex.block`\begin{equation} 
k = \frac{\left[ 1 + (m - 1) \rho \right] n}{m}
\end{equation}`

view(equation_k)
```

<div class = "note" label = "Example: 4 steps to size a cluster randomized trial, with a lot of caveats">

For the case of a binary outcome for superiority, let's walk through the 3 steps needed to size this study.

1. Calculate ${tex`n`} needed in non-randomized design. In this case, a CRT testing two proportions. Observations needed per arm, <b> ${tex`n`} = ${view(n_proportions)}</b>

```js
view(z_alpha_2_proportions)
view(z_beta_proportions)
view(p1_proportions)
view(p2_proportions)
```

2. Inflate by the design effect, <b>${des_eff.toFixed(3)} </b>. Total number of subjects needed, <b> ${total_subjects(des_eff,n_proportions).toFixed(3)}</b>.

```js
const m_var_size = view(
  Inputs.range([0, 300], {
    value: 5,
    step: 1,
    label: tex`\text{subj. per cluster}:~m`,
  })
)

const rho_var_size = view(
  Inputs.range([0, 1], {
    value: 0.1,
    step: 0.05,
    label: tex`\text{ICC}:~\rho`,
  })
)
```

```js
function design_effect(rho, m) {
  return 1 + (m - 1) * rho
}

function total_subjects(de, n) {
  return de * n
}

function clusters_per_arm(total_subj, m) {
  return total_subj / m
}
```

```js
const des_eff = design_effect(rho_var_size, m_var_size)
```

```js

```

3. Estimate number of clusters needed by didviding by ${tex`m`}: <b>${tex`k`} = ${clusters_per_arm(total_subjects(des_eff,n_proportions), m_var_size).toFixed(3)}</b>.

```js
const z_alpha_2_proportions = Inputs.range([0, 5], {
  value: 1.96,
  step: 0.01,
  label: tex`Z_{1-\alpha/2}`,
})
const z_beta_proportions = Inputs.range([0, 5], {
  value: 0.84,
  step: 0.01,
  label: tex`Z_\beta`,
})
const sigma_proportions = Inputs.range([0, 10], {
  value: 30,
  step: 0.01,
  label: tex`\sigma`,
})
const p1_proportions = Inputs.range([0, 1], {
  value: 0.5,
  step: 0.01,
  label: tex`p_1`,
})
const p2_proportions = Inputs.range([0, 1], {
  value: 0.55,
  step: 0.01,
  label: tex`p_2`,
})

const z_alpha_2_proportions_selection = Generators.input(z_alpha_2_proportions)
const z_beta_proportions_selection = Generators.input(z_beta_proportions)

const p1_proportions_selection = Generators.input(p1_proportions)
const p2_proportions_selection = Generators.input(p2_proportions)
```

```js
const n_proportions = calculateSampleSizeForProportions(
  z_alpha_2_proportions_selection,
  z_beta_proportions_selection,
  p1_proportions_selection,
  p2_proportions_selection
)
```

4. If ${tex`k`} is ${tex`\le`} 10--15, add an addition cluster per arm.

</div>

## How do you estimate the ICC?

The ICC ${tex`\rho`} is assumed or estimated. When historical data is available, you can obtain an estimate by fitting a mixed model to the data. However, the uncertainty associated with any estimated correlations (particular for small n studies) may be large, rendering these estimates to be more or less uninformative.

When the endpoints are binary, the ICC's put into these calculations need to be put in the proportion scale. (fitted by linear mixed models, not logistic models, to estimate the ICC's).

When there's no information, not all is lost. However, as the ICC is a measure of correlation within the same cluster, it really only make sense to use an ICC value from other similar trials or studies will be appropriate when:

1. Same (similar) outcome - Outcome type (ICCs for process outcomes higher than for clinical outcomes)
2. Same (similar) cluster size - Cluster size (ICCs from smaller clusters tend to be higher)
3. Same (similar) setting - Setting (ICCs in secondary care are typically higher than ICCs in primary care)
4. Same (similar) prevalence - Prevalence (ICCs from more prevalent outcomes tend to be higher)

Further, in the absence of specific information on likely ICCs, recommendations are to use patterns observed from empirical studies of correlations.

## Caveats for RCTs with a small number of clusters

These formulas are generally derived/applied to large cluster studies.

1. For parallel arm analysis, use critical values from the t-distribution, rather than the normal (z) distribution
2. Set the number of degrees of freedom to: ${tex`2k-2`}
3. If needed at the sample-size design stage, add one cluster per arm (or two, if you're feeling extra conservative).

<div class = "note">

Qunatifying the ICC is typically done by measuring the degree of clustering. However, an alternative is to use the Coefficient of Cluster Variation (CCV):

```js
const equation_ccv = tex.block`\begin{equation} 
\text{CCV} = \frac{\sigma_b^2}{\mu} 
\end{equation}`
```

where ${tex`\mu`} is the true (unknown) cluster mean, proportion, or rate; and ${tex`\sigma_{b}^2`} is the between-cluster variance.

This can be a useful metric when only cluster-level means are available from any data being used to estimate correlations, or when the outcome is a count or rate rather than a continuous or binary outcome (e.g., gap closure).

</div>
