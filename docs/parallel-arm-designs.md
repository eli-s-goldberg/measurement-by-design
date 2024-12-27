---
theme: light
title: Individual Parallel Randomized Designs
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
<!-- <script src="https://cdn.jsdelivr.net/npm/jstat@latest/dist/jstat.min.js"> </script> -->

# Parallel Random Designs

Derived from this video [S4b Sample size and power for cluster randomised trial](https://www.youtube.com/watch?v=JOtwZyaJZpk)

<iframe width="560" height="315" src="https://www.youtube.com/embed/JOtwZyaJZpk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<div class = "horizontal-line"></div>

## Notes

4.b Parallel arm cluster randomization (no repeated measure)
4.c Loongitudinal cluster randomization (repeated measure)

## 1.0 Parallel arm cluster randomization (no repeated measures)

<div class = "tip" label = "DEFINITIONS">

1. Target difference or "effect size"
2. Measure of variation:

   - Standard deviation if continuous outcome (${tex`\sigma^2`})
   - Control arm proportion if dichotomous outcome (proportion: ${tex`p_1`})

3. Desired statistical power (1- ${tex`\beta`})

   - ${tex`(1- P_{type-II}`} or 1 - probabiility of a type-II error.
   - Type II error = failing to delcare a significant difference when it does exist.
   - Generally try to achieve power of +80%.

4. Desired level of significance (${tex`\alpha`})

   - Probability of Type-I error
   - Type-1 Error: Declaring significant difference when one doesn't exist.
   - Generally try to keep error rate < 5%.

</div>

### 1.1 Mean Testing: Null Hypothesis: H0: ${tex`\mu_1 = \mu_2`}

<div class = "warning" label = "RESTRICTIONS">

- 2 treatment conditions: intervention & control
- Superior design (is the intervention superior than control?)
- Equal allocation (1:1 randomization t:c)
- Consider continuous & dichotomous

</div>

Note, that these are for an _individually_ not _cluster_ randomized designs.

```js
const equation_1 = tex.block` \begin{equation}  n = \frac{(z_{1-\alpha/2} + z_{\beta})^2 2\sigma^2}{(\mu_1 - \mu_2)^2} \end{equation}`

view(equation_1)
```

Calculated Size:

```js
const z_alpha_2_means = Inputs.range([0, 5], {
  value: 1.96,
  step: 0.01,
  label: tex`Z_{1-\alpha/2}`,
})
const z_beta_means = Inputs.range([0, 1], {
  value: 0.84,
  step: 0.01,
  label: tex`Z_\beta`,
})
const sigma_means = Inputs.range([0, 100], {
  value: 30,
  step: 0.01,
  label: tex`\sigma`,
})
const mu1_means = Inputs.range([0, 1e6], {
  value: 50,
  step: 0.1,
  label: tex`\mu_1`,
})
const mu2_means = Inputs.range([0, 100], {
  value: 51,
  step: 0.1,
  label: tex`\mu_2`,
})

const z_alpha_2_means_selection = Generators.input(z_alpha_2_means)
const z_beta_means_selection = Generators.input(z_beta_means)
const sigma_means_selection = Generators.input(sigma_means)
const mu1_means_selection = Generators.input(mu1_means)
const mu2_means_selection = Generators.input(mu2_means)
```

```js
view(
  Inputs.form([
    z_alpha_2_means,
    z_beta_means,
    sigma_means,
    mu1_means,
    mu2_means,
  ])
)

// view(z_alpha_2_means);
// view(z_beta_means);
// view(sigma_means);
// view(mu1_means);
// view(mu2_means);
```

```js
const n_means = calculateSampleSizeForMeans(
  z_alpha_2_means_selection,
  z_beta_means_selection,
  sigma_means_selection,
  mu1_means_selection,
  mu2_means_selection
)
```

Observations needed per arm <b>${view(n_means)}</b>.

### 1.2 Proportion testing: Null Hypothesis: H0: ${tex`p_1 = p_2`}

<div class = "warning" label = "RESTRICTIONS">

- 2 treatment conditions: intervention & control
- Superior design (is the intervention superior than control?)
- Equal allocation (1:1 randomization t:c)
- Consider continuous & dichotomous

</div>

Note, that these are for an _individually_ not _cluster_ randomized designs.



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
view(z_alpha_2_proportions)
view(z_beta_proportions)
view(p1_proportions)
view(p2_proportions)
```

```js
const n_proportions = calculateSampleSizeForProportions(
  z_alpha_2_proportions_selection,
  z_beta_proportions_selection,
  p1_proportions_selection,
  p2_proportions_selection
)
```

Observations needed per arm <b>${view(n_proportions)}</b>.

## 2.0 Examples

<div class = "note" label = "Example 1: Enrollment Rate Magic Wand">
Let's assume that we want to incrementally increase our enrollment rate, ${tex`R_{enrollment}`}.

${tex`R_{enrollment}`} is currently set to be:

${tex.block`R_{enrollment} = \frac{n_{enrolled}}{n_{mailed}}`}

Let's say we have a magic wand that incrementally increases the relative enrollment rate by 30%, i.e., ${tex`R_{wand, relative~increase}=0.3`}.

```js
const equation_enrollment = tex.block`R_{enrollment, wand} = \frac{n_{enrolled}}{n_{mailed}}\cdot (1+R_{wand, relative~increase})`

view(equation_enrollment)
```

**Question:** How many people would we need to observe this relative increase in enrollment rate with a given statistical certainty?

**Answer:**

Let's use this equation to calculate:

```js
view(equation_2)
```

```js
const Example1Form = Inputs.form({
  z_alpha_2_proportions: Inputs.range([0, 5], {
    value: 1.96,
    step: 0.01,
    label: tex`Z_{1-\alpha/2}`,
  }),
  z_beta_proportions: Inputs.range([0, 5], {
    value: 0.84,
    step: 0.01,
    label: tex`Z_\beta`,
  }),
  p1_proportions: Inputs.range([0, 1], {
    value: 0.5,
    step: 0.01,
    label: tex`p_1`,
  }),

  relative_increase: Inputs.range([0, 1], {
    value: 0.3,
    step: 0.01,
    label: tex`R_{wand, relative~increase}`,
  }),
})
view(Example1Form)
```

```js
const relative_p2_calc =
  Example1Form_Selections.p1_proportions *
  (1 + Example1Form_Selections.relative_increase)
const p2_proportions_r = Inputs.range([0, 1], {
  value: relative_p2_calc,
  step: 0.01,
  label: tex`p_2`,
  disabled: true,
})
view(p2_proportions_r)
```

```js
const Example1Form_Selections = Generators.input(Example1Form)
```

```js
const n_proportions_wand = calculateSampleSizeForProportions(
  Example1Form_Selections.z_alpha_2_proportions,
  Example1Form_Selections.z_beta_proportions,
  Example1Form_Selections.p1_proportions,
  relative_p2_calc
)
```

<!-- prettier-ignore -->
You would need: ${n_proportions_wand} participants in each arm to observe a relative shift of <b>${Example1Form_Selections.relative_increase*100}%</b> in enrollment rate (i.e., a p1 of ${Example1Form_Selections.p1_proportions} and a p2 of ${relative_p2_calc}). Note that the relative increase is a common framing, but one that is somewhat mathematically confusing.
