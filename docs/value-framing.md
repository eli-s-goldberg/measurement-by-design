---
toc: false
theme: [air, wide]
title: Behavior Change Portfolio- MedEx
---

```js
// Import the CampaignAnalyzer class
import { CampaignAnalyzer } from "./components/CampaignAnalyzer.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "d3-require";
```

```js
import { DataFrame } from "./components/DataFrame.js";
```

```js
import { pwcStyle } from "./components/pwcStyle.js";
const styleElement = html`<style>
  ${pwcStyle}
</style>`;
document.head.appendChild(styleElement);
```

<div class="page-title-header ">
<div class="page-title ">
Shifting Imaging to Preferred Facility
</div>

Current: Version 3 – direct mail + email + microsite for predicted savers

</div>

```js
const metrics = [
  {
    title: "TOTAL CAMPAIGN VALUE",
    value: "$103M",
    subtext: "50 Campaigns",
    bgColor: "bg-yellow-400",
  },
  {
    title: "BOOKED VALUE",
    value: "$60M",
    subtext: "35 Campaigns",
    bgColor: "bg-white",
  },
  {
    title: "FORECASTED VALUE",
    value: "$43M",
    subtext: "15 Campaigns",
    bgColor: "bg-gray-50",
  },
];
```

<div class="full-width-section">
  <div class="content-container">

  <div class="text-subheader">
  Current Campaign
  </div>

<div class="pull-quote-grid-card">

  <div class="pull-quote-grid-item pull-quote-item-a">
  <div class="text-subheader-pullquote">
  This campaign targets members at <a class="text-subheader-pullquote-highlight"> elevated liklihood to receive imaging procedures at Non-Preferred facilities </a> and 'nudges' them to drive them to Preferred locations instead.

  </div>

  </div>

<!--  -->

<div class="container">
  <div class="tabs">
    <div class="tab active">Tactics</div>
    <div class="tab">Channels</div>
    <div class="tab">Measurement</div>
  </div>

  <div class="tab-content active">
    <p class="tab-header-style">Marketing Tactics</p>
    <p class = "table-body-style">Key strategies and approaches to reach target audience effectively.</p>
  </div>
  
  <div class="tab-content">
    <p class="tab-header-style">Distribution Channels</p>
    <p class = "table-body-style">Multi-channel approach to maximize market reach and engagement.</p>
  </div>
  
  <div class="tab-content">
    <p class="tab-header-style">Performance Metrics</p>
    <p class = "table-body-style">Analytics and KPIs to track campaign success and ROI.</p>
  </div>

</div>

```js
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    contents[index].classList.add("active");
  });
});
```

<div class="pull-quote-grid-item pull-quote-item-b">
  <div class="grid-2-by-1">

<div class="grid-vertical-stack">
    <div class="card card-yellow">
        <p class="text-header">TOTAL VALUE AT STAKE</p>
        <div class="horizontal-line"></div>
        <p class="grid-value">$72M</p>
        <p class="grid-subtitle">Commercial Fully Insured</p>
        <p class="grid-description">40,000 members with Non-Preferred imaging $1,800 per shift to Preferred</p>
    </div>

  <div class="card card-yellow">
        <p class="text-header">RUN-RATE SAVINGS</p>
        <div class="horizontal-line"></div>
        <p class="grid-value">$1.1M</p>
        <p class="grid-subtitle">Current Campaign (v3)</p>
    </div>
    </div>

</div>

</div>

</div>
  
  </div>

</div>

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
