---
theme: dashboard
title: Example dashboard
toc: false
---

```js
// Import the CampaignAnalyzer class
import { CampaignAnalyzer } from "./components/CampaignAnalyzer.js";
```

```js
// make some data
const sampleData = {
  campaigns: [
    {
      name: "Early Breast Cancer Detection",
      intervention: "Mammography Screening",
      populationDesc: "Women aged 40-65",
      version: "1.0",
      timeInMarket: "14 months",
      populationSize: 120000,
      costPerChange: 50.0,
      totalImpact: "6.5M",
      financialImpact: "5.2M",
      pValue: 0.004,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 10 + Math.random() * 3,
        engagement: 800 + Math.random() * 200,
      })),
      funnelData: {
        totalBooked: 15000,
        targeted: 12000,
        connected: 9000,
        enrolled: 7000,
        engaged: 4500,
        changedBehavior: 2000,
      },
      impact: {
        livesImproved: 2000,
        costSavings: 800000,
        qualityMetrics: 85,
      },
      levers: ["Preventive screenings", "Mobile mammogram units"],
      assumptions: [
        "Early detection improves outcomes",
        "Accessibility reduces disparities",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "16.7%", // From totalBooked to changedBehavior
          lift: "15.0%",
          pValue: 0.004,
          ci_lower: "14.0%",
          ci_upper: "19.0%",
          stdDev: "1.5%",
        },
        {
          name: "Engagement Rate",
          value: "30.0%", // From enrolled to engaged
          lift: "18.0%",
          pValue: 0.004,
          ci_lower: "28.0%",
          ci_upper: "32.0%",
          stdDev: "1.2%",
        },
      ],
    },
    {
      name: "Lung Cancer Screening Initiative",
      intervention: "Low-Dose CT Scans",
      populationDesc: "Smokers aged 50+",
      version: "2.0",
      timeInMarket: "18 months",
      populationSize: 80000,
      costPerChange: 75.0,
      totalImpact: "7.8M",
      financialImpact: "6.4M",
      pValue: 0.002,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 8 + Math.random() * 4,
        engagement: 600 + Math.random() * 300,
      })),
      funnelData: {
        totalBooked: 10000,
        targeted: 8500,
        connected: 6500,
        enrolled: 5000,
        engaged: 3000,
        changedBehavior: 1400,
      },
      impact: {
        livesImproved: 1500,
        costSavings: 1200000,
        qualityMetrics: 90,
      },
      levers: ["CT scans in rural areas", "Smoking cessation integration"],
      assumptions: [
        "Smoking history correlates with lung cancer risk",
        "Accessibility improves compliance",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "14.0%", // From totalBooked to changedBehavior
          lift: "20.0%",
          pValue: 0.002,
          ci_lower: "12.0%",
          ci_upper: "16.0%",
          stdDev: "1.5%",
        },
        {
          name: "Engagement Rate",
          value: "30.0%", // From enrolled to engaged
          lift: "22.0%",
          pValue: 0.002,
          ci_lower: "28.0%",
          ci_upper: "32.0%",
          stdDev: "1.3%",
        },
      ],
    },
    {
      name: "Cardiac Health Screening",
      intervention: "Ultrasound and EKG",
      populationDesc: "Adults aged 30-70 with hypertension",
      version: "3.0",
      timeInMarket: "12 months",
      populationSize: 100000,
      costPerChange: 65.0,
      totalImpact: "8.0M",
      financialImpact: "6.5M",
      pValue: 0.003,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 9 + Math.random() * 5,
        engagement: 700 + Math.random() * 250,
      })),
      funnelData: {
        totalBooked: 12000,
        targeted: 9500,
        connected: 7000,
        enrolled: 5500,
        engaged: 3500,
        changedBehavior: 1750,
      },
      impact: {
        livesImproved: 1750,
        costSavings: 950000,
        qualityMetrics: 88,
      },
      levers: [
        "Heart health awareness campaigns",
        "Onsite screenings at clinics",
      ],
      assumptions: [
        "Hypertension is a leading cardiac risk factor",
        "Early detection reduces mortality",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "14.6%", // From totalBooked to changedBehavior
          lift: "18.0%",
          pValue: 0.003,
          ci_lower: "12.0%",
          ci_upper: "17.0%",
          stdDev: "1.8%",
        },
        {
          name: "Engagement Rate",
          value: "31.8%", // From enrolled to engaged
          lift: "21.0%",
          pValue: 0.003,
          ci_lower: "30.0%",
          ci_upper: "33.0%",
          stdDev: "1.5%",
        },
      ],
    },
    {
      name: "Diabetes Management A",
      intervention: "Personalized Coaching",
      populationDesc: "Type 2 Diabetes Patients",
      version: "2.1",
      timeInMarket: "8 months",
      populationSize: 300000,
      costPerChange: 42.5,
      totalImpact: "15.0M",
      financialImpact: "12.0M",
      pValue: 0.001,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 15 + Math.random() * 10,
        engagement: 1000 + Math.random() * 500,
      })),
      funnelData: {
        totalBooked: 10000,
        targeted: 8000,
        connected: 6000,
        enrolled: 4500,
        engaged: 2500,
        changedBehavior: 1200,
      },
      impact: {
        livesImproved: 1200,
        costSavings: 2500000,
        qualityMetrics: 85,
      },
      levers: [
        "Optimal message timing",
        "Personalized content",
        "Context-aware notifications",
      ],
      assumptions: [
        "Users respond better to personalized timing",
        "Context awareness increases engagement",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "12.0%",
          lift: "15.0%",
          pValue: 0.001,
          ci_lower: "10.0%",
          ci_upper: "14.0%",
          stdDev: "1.5%",
        },
        {
          name: "Engagement Rate",
          value: "27.8%",
          lift: "18.0%",
          pValue: 0.001,
          ci_lower: "26.0%",
          ci_upper: "29.0%",
          stdDev: "1.2%",
        },
      ],
    },
    {
      name: "Hypertension Management",
      intervention: "Remote Monitoring",
      populationDesc: "Hypertensive Adults",
      version: "1.8",
      timeInMarket: "12 months",
      populationSize: 250000,
      costPerChange: 38.2,
      totalImpact: "12.5M",
      financialImpact: "10.0M",
      pValue: 0.002,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 12 + Math.random() * 8,
        engagement: 800 + Math.random() * 400,
      })),
      funnelData: {
        totalBooked: 8000,
        targeted: 6400,
        connected: 4800,
        enrolled: 3600,
        engaged: 2000,
        changedBehavior: 1000,
      },
      impact: {
        livesImproved: 1000,
        costSavings: 2000000,
        qualityMetrics: 80,
      },
      levers: [
        "Remote monitoring alerts",
        "Daily check-ins",
        "Medication reminders",
      ],
      assumptions: [
        "Regular monitoring improves adherence",
        "Timely alerts prevent complications",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "12.5%",
          lift: "16.0%",
          pValue: 0.002,
          ci_lower: "10.5%",
          ci_upper: "14.5%",
          stdDev: "1.5%",
        },
        {
          name: "Engagement Rate",
          value: "27.8%",
          lift: "20.0%",
          pValue: 0.002,
          ci_lower: "26.0%",
          ci_upper: "29.0%",
          stdDev: "1.4%",
        },
      ],
    },
    {
      name: "Heart Health Initiative",
      intervention: "Dietary Counseling",
      populationDesc: "Cardiac Patients",
      version: "3.0",
      timeInMarket: "10 months",
      populationSize: 200000,
      costPerChange: 35.0,
      totalImpact: "10.0M",
      financialImpact: "8.0M",
      pValue: 0.003,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 10 + Math.random() * 5,
        engagement: 700 + Math.random() * 300,
      })),
      funnelData: {
        totalBooked: 6000,
        targeted: 4800,
        connected: 3600,
        enrolled: 2700,
        engaged: 1500,
        changedBehavior: 700,
      },
      impact: {
        livesImproved: 700,
        costSavings: 1500000,
        qualityMetrics: 82,
      },
      levers: ["Nutritional plans", "Calorie tracking", "Meal prep coaching"],
      assumptions: [
        "Meal tracking improves compliance",
        "Counseling encourages sustainable habits",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "11.7%",
          lift: "17.0%",
          pValue: 0.003,
          ci_lower: "10.0%",
          ci_upper: "13.0%",
          stdDev: "1.4%",
        },
        {
          name: "Engagement Rate",
          value: "25.9%",
          lift: "16.0%",
          pValue: 0.003,
          ci_lower: "24.0%",
          ci_upper: "27.0%",
          stdDev: "1.3%",
        },
      ],
    },
    {
      name: "Smoking Cessation Support",
      intervention: "Smoking Cessation Coaching",
      populationDesc: "Chronic Smokers",
      version: "1.5",
      timeInMarket: "9 months",
      populationSize: 180000,
      costPerChange: 30.2,
      totalImpact: "8.5M",
      financialImpact: "7.0M",
      pValue: 0.004,
      timeSeriesData: Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2023, 0, i),
        changeRate: 8 + Math.random() * 4,
        engagement: 600 + Math.random() * 200,
      })),
      funnelData: {
        totalBooked: 5000,
        targeted: 4000,
        connected: 3000,
        enrolled: 2250,
        engaged: 1250,
        changedBehavior: 600,
      },
      impact: {
        livesImproved: 600,
        costSavings: 1300000,
        qualityMetrics: 78,
      },
      levers: ["Nicotine patches", "Behavioral counseling", "Peer groups"],
      assumptions: [
        "Support groups improve adherence",
        "Behavioral counseling aids habit change",
      ],
      metrics: [
        {
          name: "Conversion Rate",
          value: "12.0%",
          lift: "18.0%",
          pValue: 0.004,
          ci_lower: "10.0%",
          ci_upper: "14.0%",
          stdDev: "1.5%",
        },
        {
          name: "Engagement Rate",
          value: "26.7%",
          lift: "15.0%",
          pValue: 0.004,
          ci_lower: "25.0%",
          ci_upper: "28.0%",
          stdDev: "1.2%",
        },
      ],
    },
  ],
};
```

```js
// Initialize the analyzer with sample data
const analyzer = new CampaignAnalyzer(sampleData);

// Get formatted table data
const tableData = analyzer.formatCampaignData();
```

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
```

# Campaign Performance Dashboard

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

<div class="grid grid-cols-2">
<div class="card">

<figure>
<figcaption>Engagement Rate Stats</figcaption>

```js
view(
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
        stdDev: "σ",
      },
      // layout: "auto",
    }
  )
);
```

</figure>
</div>

<div class="card">

<figure>
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
        value: "Engaged",
        lift: "Lift",
        pValue: "P",
        ci_lower: "CI (l)",
        ci_upper: "CI (u)",
        stdDev: "σ",
      },
      // layout: "auto",
    }
  )
);
```

</figure>
</div>
</div>
