---
# theme: dashboard
title: Whole Person Health
toc: false
---

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { require } from "d3-require"
const jStat = await require("jstat@1.9.4")
const math = await require("mathjs@9.4.2")
```

## DiD while controlling for externalities

```js
// Define the intervention time as an arbitrary point within the data
const intervention_time = intervention_time_ridge // Set intervention time (can be any point within t_pre)

// Data generation for control and treatment groups
const t_pre = Array.from({ length: 200 }, (_, i) => -12 + (i * 12) / 100) // Pre-intervention
const t_post = Array.from(
  { length: 200 },
  (_, i) => intervention_time + i * 0.05
) // Post-intervention, starts from intervention_time baseline_separation

// Control group (Z = 0)
const control_pre = t_pre
  .filter((t) => t <= intervention_time) // Only include times before or at intervention
  .map((t) => ({
    t,
    y: pre_trend_slope * t,
    group: "Control",
    phase: "Pre",
  }))
const control_post = t_post.map((t) => ({
  t,
  y: pre_trend_slope * t,
  group: "Control",
  phase: "Post",
}))

// Treatment group (Z = 1), with a change in slope post-intervention
const treatment_pre = t_pre
  .filter((t) => t <= intervention_time) // Only include times before or at intervention
  .map((t) => ({
    t,
    y: pre_trend_slope * t + baseline_separation,
    group: "Treatment",
    phase: "Pre",
  }))

// Get the y-value at the intervention time to start treatment_post and counterfactual lines
const treatment_intervention_y =
  pre_trend_slope * intervention_time + baseline_separation // y-value of treatment at intervention_time

// Treatment group post-intervention with a steeper slope
const treatment_post = t_post.map((t) => ({
  t,
  y:
    (pre_trend_slope + treatment_effect) * (t - intervention_time) +
    treatment_intervention_y, // Start from last pre value and diverge with new slope
  group: "Treatment",
  phase: "Post",
}))

// Counterfactual (dotted line showing treatment trend if no intervention had occurred)
// Start from the intervention point with the pre-intervention slope, but only post-intervention
const counterfactual_post = t_post.map((t) => ({
  t,
  y: pre_trend_slope * (t - intervention_time) + treatment_intervention_y, // Continue with pre-intervention slope from intervention y
  group: "Counterfactual",
  phase: "Post",
}))

// Combine all data
const data = [
  ...control_pre,
  ...control_post,
  ...treatment_pre,
  ...treatment_post,
  ...counterfactual_post,
]

// Plotting
const difndif_plot = Plot.plot({
  height: 400,
  width: 600,
  grid: true,
  x: {
    label: "t (Time in Months and Years)",
    tickValues: [-12, -6, 0, 6, 12, 24], // Major ticks every year
    ticks: 12, // Minor ticks every month
    tickFormat: (d) => (d % 12 === 0 ? `${d / 12} yr` : `${d} mo`), // Format as months and years
    nice: true,
  },
  y: { label: "Outcome", nice: true, domain: [-4, 6] },
  marks: [
    Plot.line(
      data.filter((d) => d.group === "Control"),
      { x: "t", y: "y", stroke: "blue", strokeWidth: 2 }
    ),
    Plot.line(
      data.filter((d) => d.group === "Treatment" && d.phase === "Pre"),
      { x: "t", y: "y", stroke: "orange", strokeWidth: 2 }
    ),
    Plot.line(
      data.filter((d) => d.group === "Treatment" && d.phase === "Post"),
      { x: "t", y: "y", stroke: "orange", strokeWidth: 2 }
    ),
    Plot.line(
      data.filter((d) => d.group === "Counterfactual"),
      { x: "t", y: "y", stroke: "gray", strokeDasharray: "4,2" }
    ),
    Plot.ruleY([0]), // Baseline at y=0
    // Plot.ruleX([0]),
    Plot.ruleX([intervention_time], {
      stroke: "black",
      strokeWidth: 1,
      strokeDasharray: "4,2",
    }),
  ],
})
view(difndif_plot)
```

```js
// Define the intervention time and generate time points
const t_values_ridge = Array.from({ length: 24 }, (_, i) => -12 + i) // Monthly time points

// Generate distribution data for each time point
const ridgelineData = t_values_ridge.flatMap((t) => {
  const control_mean = pre_trend_slope * t
  const treatment_mean =
    t <= intervention_time_ridge
      ? pre_trend_slope * t + baseline_separation // Pre-intervention: parallel trends
      : (pre_trend_slope + treatment_effect) * (t - intervention_time) +
        treatment_intervention_y // Post-intervention: diverging trend

  // Generate samples
  const samples_per_group = 50
  const control_distribution = d3.randomNormal(control_mean, std_dev)
  const treatment_distribution = d3.randomNormal(treatment_mean, std_dev)

  return [
    // Control group samples
    ...Array.from({ length: samples_per_group }, () => ({
      t,
      value: control_distribution(),
      group: "Control",
    })),
    // Treatment group samples
    ...Array.from({ length: samples_per_group }, () => ({
      t,
      value: treatment_distribution(),
      group: "Treatment",
    })),
  ]
})

// Create the plot
const ridgeline_plot = Plot.plot({
  height: 400,
  width: 1200,
  marginLeft: 60,
  marginRight: 40,
  marginTop: 40,
  marginBottom: 40,

  x: {
    label: "Time (Months)",
    domain: [-12, 12],
    tickFormat: (d) => (d === 0 ? "0" : d + "mo"),
    nice: true,
  },

  y: {
    label: "Outcome",
    domain: [-4, 6],
    grid: true,
  },

  marks: [
    // Mean values
    Plot.line(
      data.filter((d) => d.group === "Control"),
      { x: "t", y: "y", stroke: "blue", strokeWidth: 2 }
    ),
    Plot.line(
      data.filter((d) => d.group === "Treatment" && d.phase === "Pre"),
      { x: "t", y: "y", stroke: "orange", strokeWidth: 2 }
    ),
    Plot.line(
      data.filter((d) => d.group === "Treatment" && d.phase === "Post"),
      { x: "t", y: "y", stroke: "orange", strokeWidth: 2 }
    ),
    Plot.line(
      data.filter((d) => d.group === "Counterfactual"),
      { x: "t", y: "y", stroke: "gray", strokeDasharray: "4,2" }
    ),
    Plot.ruleY([0]), // Baseline at y=0
    Plot.ruleX([0]),
    Plot.ruleX([intervention_time], {
      stroke: "black",
      strokeWidth: 1,
      strokeDasharray: "4,2",
    }),
    // Base distributions
    Plot.density(
      ridgelineData.filter((d) => d.group === "Control"),
      {
        x: "t",
        y: "value",
        fill: "orange",
        fillOpacity: 0.05,
        // stroke: "orange",
        strokeWidth: 0.5,
        thresholds: [0.01, 0.1, 1, 5],
        bandwidth: 20,
      }
    ),

    Plot.density(
      ridgelineData.filter((d) => d.group === "Treatment"),
      {
        x: "t",
        y: "value",
        // stroke: "blue",
        fill: "blue",
        fillOpacity: 0.05,
        strokeWidth: 0.5,
        thresholds: [0.01, 0.1, 1, 5],
        bandwidth: 20,
      }
    ),

    // Intervention line
    Plot.ruleX([intervention_time_ridge], {
      stroke: "black",
      strokeDasharray: "4,2",
    }),

    // Zero baseline
    Plot.ruleY([0]),
  ],
})
```

```js
// Sample size calculation function
function calculateSampleSizeForMeans(z_alpha_2, z_beta, sigma, mu1, mu2) {
  const numerator = math.pow(z_alpha_2 + z_beta, 2) * 2 * math.pow(sigma, 2)
  const denominator = math.pow(mu1 - mu2, 2)
  return (numerator / denominator).toFixed(2)
}

// Function to calculate p-value for two samples
function calculatePValue(samples1, samples2) {
  const mean1 = d3.mean(samples1)
  const mean2 = d3.mean(samples2)
  const var1 = d3.variance(samples1)
  const var2 = d3.variance(samples2)
  const n1 = samples1.length
  const n2 = samples2.length

  // Calculate t-statistic
  const pooledSE = Math.sqrt(var1 / n1 + var2 / n2)
  const t = Math.abs((mean1 - mean2) / pooledSE)

  // Calculate degrees of freedom (Welch–Satterthwaite equation)
  const df = Math.floor(
    Math.pow(var1 / n1 + var2 / n2, 2) /
      (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1))
  )

  // Two-tailed p-value
  return 2 * (1 - jStat.studentt.cdf(t, df))
}

// Generate pre and post intervention time points
const t_pre = Array.from({ length: 12 }, (_, i) => -12 + i) // Pre-intervention points
const t_post = Array.from({ length: 12 }, (_, i) => i) // Post-intervention points
const t_values_ridge = [...t_pre, ...t_post]

// Improved KDE calculation
function generateKDE(samples, binCount = 50) {
  if (!samples || samples.length === 0) return { densities: [], xValues: [] }

  // Calculate bin extents with padding
  const extent = d3.extent(samples)
  if (!extent[0] || !extent[1]) return { densities: [], xValues: [] }

  const range = extent[1] - extent[0]
  const padding = range * 0.1
  const domain = [extent[0] - padding, extent[1] + padding]

  // Create bins
  const bins = d3.bin().domain(domain).thresholds(binCount)(samples)

  // Calculate densities and normalize
  const maxCount = d3.max(bins, (d) => d.length)
  const densities = bins.map((d) => d.length / maxCount || 0)

  // Get x values (bin midpoints)
  const xValues = bins.map((d) => (d.x0 + d.x1) / 2)

  return { densities, xValues }
}

// Generate the ridgeline data
const ridgelineDataDd = t_values_ridge.map((t) => {
  const slope = Number(pre_trend_slope)
  const effect = Number(treatment_effect)
  const separation = Number(baseline_separation)
  const deviation = Number(std_dev)
  const sample_count = Number(samples_per_group)
  const intervention_time = Number(intervention_time_ridge)

  // Generate samples
  const control_samples = Array.from({ length: sample_count }, () =>
    d3.randomNormal(slope * t, deviation)()
  )
  const treatment_samples = Array.from({ length: sample_count }, () =>
    d3.randomNormal(
      t <= intervention_time
        ? slope * t + separation
        : (slope + effect) * t + separation,
      deviation
    )()
  )

  // Rest of the KDE calculations...
  const control_kde = generateKDE(control_samples)
  const treatment_kde = generateKDE(treatment_samples)

  // Calculate counterfactual
  const counterfactual_samples = Array.from({ length: sample_count }, () =>
    d3.randomNormal(slope * t + separation, deviation)()
  )
  const counterfactual_kde = generateKDE(counterfactual_samples)

  // Calculate p-value for this timepoint
  const p_value = calculatePValue(counterfactual_samples, treatment_samples)

  // Calculate required sample size
  const required_sample_size = calculateSampleSizeForMeans(
    1.96, // z_alpha_2 for 95% confidence
    0.84, // z_beta for 80% power
    deviation,
    d3.mean(counterfactual_samples),
    d3.mean(treatment_samples)
  )

  return {
    t,
    control_mean: d3.mean(control_samples),
    treatment_mean: d3.mean(treatment_samples),
    counterfactual_mean: d3.mean(counterfactual_samples),
    p_value,
    required_sample_size,
    control_distribution: control_kde.densities,
    treatment_distribution: treatment_kde.densities,
    counterfactual_distribution: counterfactual_kde.densities,
    control_x: control_kde.xValues,
    treatment_x: treatment_kde.xValues,
    counterfactual_x: counterfactual_kde.xValues,
  }
})

// Calculate DiD statistics
const pre_intervention = ridgelineDataDd.filter(
  (d) => d.t <= Number(intervention_time_ridge)
)
const post_intervention = ridgelineDataDd.filter(
  (d) => d.t > Number(intervention_time_ridge)
)

const pre_diff = d3.mean(
  pre_intervention.map((d) => d.treatment_mean - d.counterfactual_mean)
)
const post_diff = d3.mean(
  post_intervention.map((d) => d.treatment_mean - d.counterfactual_mean)
)
const did_estimate = post_diff - pre_diff

// Calculate DiD standard error and p-value
const pre_var = d3.variance(
  pre_intervention.map((d) => d.treatment_mean - d.counterfactual_mean)
)
const post_var = d3.variance(
  post_intervention.map((d) => d.treatment_mean - d.counterfactual_mean)
)
const did_se = Math.sqrt(
  pre_var / pre_intervention.length + post_var / post_intervention.length
)
const did_t = Math.abs(did_estimate / did_se)
const did_df = pre_intervention.length + post_intervention.length - 2
const did_p_value = 2 * (1 - jStat.studentt.cdf(did_t, did_df))

// Create statistical summary view
const stats_summary = {
  did_estimate: did_estimate.toFixed(3),
  did_p_value: did_p_value.toFixed(4),
  did_se: did_se.toFixed(3),
  time_point_stats: ridgelineDataDd.map((d) => ({
    t: d.t,
    p_value: d.p_value.toFixed(4),
    required_n: d.required_sample_size,
  })),
}

// Transform data for visualization
const controlData = ridgelineDataDd.flatMap((d) =>
  d.control_distribution.map((value, i) => ({
    date: d.control_x[i], // Use actual x values
    value: value,
    t: `t=${d.t}`,
    group: "control",
  }))
)

const treatmentData = ridgelineDataDd.flatMap((d) =>
  d.treatment_distribution.map((value, i) => ({
    date: d.treatment_x[i], // Use actual x values
    value: value,
    t: `t=${d.t}`,
    group: "treatment",
  }))
)

const counterfactualData = ridgelineDataDd.flatMap((d) =>
  d.t > intervention_time_ridge
    ? d.counterfactual_distribution.map((value, i) => ({
        date: d.counterfactual_x[i],
        value: value,
        t: `t=${d.t}`,
        group: "counterfactual",
      }))
    : []
)

const scaleFactor = itemHeight * (1 - overlap / 20)

const meansData = ridgelineDataDd.map((d) => ({
  t: `t=${d.t}`,
  control_mean: d.control_mean,
  treatment_mean: d.treatment_mean,
  counterfactual_mean: d.counterfactual_mean,
  value: scaleFactor, // Use this for Y positioning
}))

const names = ridgelineDataDd.map((d) => `t=${d.t}`)
```

```js
// const filteredObject = filter_object_by_index(filter_time, names, "<")
function filterDataByTime(data, filterTime, timeKey) {
  return data.filter((d) => {
    const t = parseInt(d[timeKey].replace("t=", ""))
    return t > filterTime
  })
}

// Filter function for data objects based on month values
function filterDataByMonth(data, filterMonth, timeKey) {
  return data.filter((d) => {
    const month = parseInt(d[timeKey].replace("t=", ""))
    return month <= filterMonth
  })
}

const namesOrdered = [...names].reverse() // Reverse once and store

function getMonthFromT(t) {
  if (typeof t === "string") {
    return parseInt(t.replace("t=", ""))
  }
  return NaN // Return NaN if `t` is not valid
}

// Filter control data
const filteredControlData = controlData.filter((d) => {
  const month = getMonthFromT(d.t)
  return !isNaN(month) && month <= filter_time // Ensure month is a valid number
})

// Filter treatment data
const filteredTreatmentData = treatmentData.filter((d) => {
  const month = getMonthFromT(d.t)
  return !isNaN(month) && month <= filter_time
})

// Filter counterfactual data
const filteredCounterfactualData = counterfactualData.filter((d) => {
  const month = getMonthFromT(d.t)
  return !isNaN(month) && month <= filter_time
})

// const filteredRidgelineData = ridgelineDataDd.filter((d) => d.t <= filter_time)

const firstMonth = Math.min(
  ...ridgelineDataDd
    .map((d) => getMonthFromT(d.t))
    .filter((value) => !isNaN(value)) // Remove any invalid numbers
)

const filteredRidgelineData = ridgelineDataDd.filter((d) => {
  const month = getMonthFromT(d.t)
  return !isNaN(month) && (month === firstMonth || month === filter_time)
})
```

```js
function getRightmostPoint(data, timePoint) {
  const timeData = data.filter((d) => d.t === timePoint)
  if (timeData.length === 0) return null
  return Math.max(...timeData.map((d) => d.date))
}

function formatAnnotation(d) {
  const pValue = d.p_value.toFixed(3)
  const significance = d.p_value < 0.05 ? "*" : ""
  const sampleSize = Math.round(d.required_sample_size)
  return `p=${pValue}${significance}, n=${sampleSize}`
}

const filterIndex = namesOrdered.findIndex(
  (name) => getMonthFromT(name) === filter_time
)

// Create an array with the first element and the element at the filterIndex
const namesOrderedFirstLast =
  filterIndex !== -1
    ? [namesOrdered[0], namesOrdered[filterIndex]]
    : [namesOrdered[0]] // If filterIndex is not found, return only the first element

function filterByTValues(
  dataArray,
  tValues,
  filter_time,
  intervention_time_ridge
) {
  if (!dataArray || dataArray.length === 0) {
    return [] // Return an empty array if dataArray is undefined or empty
  }

  // Find the first filter time from the array (e.g., the first `t` value)
  const firstFilterTime = getMonthFromT(dataArray[0]?.t)

  // Filter elements based on `tValues`, matching `filter_time`, `firstFilterTime`, or `intervention_time_ridge`
  const filteredElements = dataArray.filter((d) => {
    if (!d || typeof d.t === "undefined") {
      return false // Skip elements that are undefined or don't have a `t` property
    }
    const month = getMonthFromT(d.t)
    return (
      tValues.includes(d.t) ||
      (!isNaN(month) &&
        (month === filter_time ||
          month === firstFilterTime ||
          month === intervention_time_ridge + 1))
    )
  })

  // Use a Set to ensure unique elements and return the result
  return Array.from(new Set(filteredElements))
}
```

```js
const filteredControlData_fl = filterByTValues(
  filteredControlData,
  namesOrderedFirstLast,
  filter_time,
  intervention_time_ridge
)
const filteredTreatmentData_fl = filterByTValues(
  filteredTreatmentData,
  namesOrderedFirstLast,
  filter_time,
  intervention_time_ridge
)
const filteredCounterfactualData_fl = filterByTValues(
  filteredCounterfactualData,
  namesOrderedFirstLast,
  filter_time,
  intervention_time_ridge
)

// Updated plot with filtered data

const ridgechart = Plot.plot({
  width: 1200,
  height: 600,
  marginTop: marginTop, // Adjust for spacing at the top of the plot
  marginBottom: marginBot, // Increase for spacing below the x-axis
  // marginLeft: 50, // Adjust for spacing on the left side
  // marginRight: 200, // Keep for annotations

  x: {
    axis: "bottom", // Set axis at the bottom
    label: "Effect",
    // ticks: 5, // Control the number of ticks
    tickValues: [-2, -1, 0, 1, 2], // Specific tick values for better control
    tickSize: 6, // Size of the tick marks
    tickPadding: tickPad, // Padding between the ticks and their labels
  },
  y: {
    axis: false,
    range: [
      2.5 * itemHeight + marginTop - marginBot - tickPad,
      (2.5 - overlap) * itemHeight,
    ],
  },
  fy: {
    label: null,
    domain: namesOrdered,
    range: [
      -(2.5 - overlap) * itemHeight + marginBot + marginTop + tickPad,
      names.length * itemHeight,
    ],
  },
  marks: [
    // Control group (red)
    Plot.areaY(filteredControlData_fl, {
      x: "date",
      y: "value",
      fy: "t",
      fill: "bue",
      fillOpacity: 0.05,
      curve: "basis",
    }),
    Plot.lineY(filteredControlData_fl, {
      x: "date",
      y: "value",
      fy: "t",
      fill: "blue",
      stroke: "blue",
      strokeWidth: 0.5,
      fillOpacity: 0.05,
      curve: "basis",
    }),

    // Treatment group (blue)
    Plot.areaY(filteredTreatmentData_fl, {
      x: "date",
      y: "value",
      fy: "t",
      fill: "orange",
      fillOpacity: 0.05,
      curve: "basis",
    }),
    Plot.lineY(filteredTreatmentData_fl, {
      x: "date",
      y: "value",
      fy: "t",
      fill: "orange",
      stroke: "orange",
      fillOpacity: 0.2,
      strokeWidth: 0.5,
      fillOpacity: 0.05,
      curve: "basis",
    }),

    // Counterfactual group (gray)
    Plot.areaY(filteredCounterfactualData_fl, {
      x: "date",
      y: "value",
      fy: "t",
      fill: "gray",
      fillOpacity: 0.2,
      strokeWidth: 0.5,
      fillOpacity: 0.05,
      curve: "basis",
    }),
    Plot.lineY(filteredCounterfactualData_fl, {
      x: "date",
      y: "value",
      fy: "t",
      fill: "gray",
      stroke: "gray",
      fillOpacity: 0.2,
      strokeWidth: 0.5,
      fillOpacity: 0.05,
      curve: "basis",
    }),
  ],
})
```

```js
// Input parameters
const pre_trend_slope = view(
  Inputs.range([-1, 1], {
    step: 0.01,
    value: 0.02,
    label: "Pre-intervention slope",
  })
)

const treatment_effect = view(
  Inputs.range([-2, 2], {
    step: 0.01,
    value: 0.02,
    label: "Treatment effect (additional slope)",
  })
)

const baseline_separation = view(
  Inputs.range([0, 2], {
    step: 0.01,
    value: 0,
    label: "Baseline separation",
  })
)

const std_dev = view(
  Inputs.range([0.1, 1], {
    step: 0.005,
    value: 0.01,
    label: "Distribution spread",
  })
)

// New samples per group slider
const samples_per_group = view(
  Inputs.range([100, 20000], {
    step: 100,
    value: 5000,
    label: "Samples per group",
  })
)

const itemHeight = view(
  Inputs.range([0, 50], {
    step: 1,
    value: 20,
    label: "Item height",
  })
)

const overlap = view(
  Inputs.range([0, 30], {
    step: 1,
    value: 8,
    label: "Distribution overlap",
  })
)

const intervention_time_ridge = view(
  Inputs.range([-8, 8], {
    step: 1,
    value: 0,
    label: "Intervention time",
  })
)

const filter_time = view(
  Inputs.range([11, -12], {
    step: 1,
    value: 11,
    label: "Filter Time",
  })
)

const marginTop = view(
  Inputs.range([-100, 100], {
    step: 1,
    value: 50,
    label: "Margin Top",
  })
)

const marginBot = view(
  Inputs.range([-100, 100], {
    step: 1,
    value: 20,
    label: "Margin Bot",
  })
)

const tickPad = view(
  Inputs.range([-100, 100], {
    step: 1,
    value: 20,
    label: "Tick Pad",
  })
)
```

```js
view(ridgechart)
```

```js
// view(Inputs.table(meansData))
```

```js
const table = Inputs.table(stats_summary.time_point_stats, {
  maxWidth: 400,
  width: "auto",
  align: {
    t: "left",
    p_value: "right",
    required_n: "right",
  },
  header: {
    t: "Time",
    p_value: "P-Value",
    required_n: "Required N",
  },
  layout: "auto",
  sort: "t",
})

view(table)
```

```js
view(stats_summary)
```

## Bootstrap simulation

```js
const desiredMean = 0.08
const desiredStd = 0.03

// Calculate lognormal parameters
const mu = Math.log(
  desiredMean ** 2 / Math.sqrt(desiredStd ** 2 + desiredMean ** 2)
)
const sigma = Math.sqrt(Math.log(1 + desiredStd ** 2 / desiredMean ** 2))

// Generate distribution points (x > 0)
const x = d3.range(0.001, 0.3, 0.001)
const dataSim = x
  .map((x) => ({
    x: x,
    y:
      (1 / (x * sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-((Math.log(x) - mu) ** 2) / (2 * sigma ** 2)),
  }))
  .filter((d) => !isNaN(d.y) && isFinite(d.y))

const z = 1.96 // For 95% confidence
const lowerBound = Math.exp(mu - z * sigma)
const upperBound = Math.exp(mu + z * sigma)

const bootstrap_plot = Plot.plot({
  height: 300,
  marginLeft: 60,
  y: { axis: null },
  x: {
    label: "Effect Size",
    domain: [0, 0.2], // Focusing on relevant range
  },
  marks: [
    Plot.areaY(dataSim, {
      x: "x",
      y: "y",
      fillOpacity: 0.1,
      fill: "steelblue",
    }),
    Plot.ruleY([0]),
    Plot.lineY(dataSim, {
      x: "x",
      y: "y",
      stroke: "steelblue",
      strokeWidth: 0.5,
    }),
    // Add vertical line at the DiD estimate
    Plot.ruleX([desiredMean], {
      stroke: "red",
      strokeWidth: 0.5,
      strokeDasharray: "4,4",
    }),
    // Add 95% confidence interval as vertical dashed lines
    Plot.ruleX([lowerBound, upperBound], {
      stroke: "green",
      strokeWidth: 0.5,
      strokeDasharray: "4,4",
    }),
    // Add arrow between the confidence intervals
    Plot.link(
      [
        {
          x1: lowerBound,
          y1: dataSim.find((d) => d.x === lowerBound)?.y || 0,
          x2: upperBound,
          y2: dataSim.find((d) => d.x === upperBound)?.y || 0,
        },
      ],
      {
        x1: "x1",
        y1: "y1",
        x2: "x2",
        y2: "y2",
        stroke: "green",
        strokeWidth: 1,
        markerEnd: "arrow", // Adds an arrowhead
        markerStart: "arrow", // Adds an arrowhead at the start
      }
    ),
    // Add labels for upper and lower bounds
    Plot.text(
      [
        {
          x: lowerBound,
          y: dataSim.find((d) => d.x === desiredMean)?.y || 0,
          text: `Lower 95% CI: ${lowerBound.toFixed(3)}`,
        },
        {
          x: upperBound,
          y: dataSim.find((d) => d.x === desiredMean)?.y || 0,
          text: `Upper 95% CI: ${upperBound.toFixed(3)}`,
        },
      ],
      {
        x: "x",
        y: "y",
        text: "text",
        dy: -10, // Adjusts label position
        anchor: "middle", // Centers the text
        fill: "green",
      }
    ),
    // Add an annotation with an arrow for the mean
    Plot.text(
      [
        {
          x: desiredMean,
          y: dataSim.find((d) => d.x === desiredMean)?.y || 0,
          text: `Mean: ${desiredMean.toFixed(2)}`,
        },
      ],
      {
        x: "x",
        y: "y",
        text: "text",
        dy: -15, // Shift the label slightly above
        anchor: "start", // Anchor the text to the left of the point
        fill: "red",
      }
    ),
    Plot.link(
      [
        {
          x1: desiredMean,
          y1: 0,
          x2: desiredMean,
          y2: dataSim.find((d) => d.x === desiredMean)?.y || 0,
        },
      ],
      {
        x1: "x1",
        y1: "y1",
        x2: "x2",
        y2: "y2",
        stroke: "red",
        strokeWidth: 1,
        markerEnd: "arrow", // Adds an arrowhead
      }
    ),
  ],
})

view(bootstrap_plot)
```
