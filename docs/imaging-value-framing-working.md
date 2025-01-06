---
toc: false
theme: [air, wide]
title: Imaging - Value Framing
---

```js
// Import the CampaignAnalyzer class
import { CampaignAnalyzer } from "./components/CampaignAnalyzer.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "d3-require";

import { DataFrame } from "./components/DataFrame.js";
import {
  formatTwoLevel,
  formatStatus,
  sparkbar,
  formatTextBold,
  formatWrappedText,
  withRowHeight,
} from "./components/TableFormatters.js";

import { pwcStyle } from "./components/pwcStyle.js";
const styleElement = html`<style>
  ${pwcStyle}
</style>`;
document.head.appendChild(styleElement);

import { createUnifiedSplitPanel } from "./components/Layouts.js";

import { createTwoToneBoxplot } from "./components/TwoToneBoxplot.js";
```

<style>
  body {
    margin: auto;
    overflow-x: hidden; /* Prevent horizontal scroll */
  }
  </style>

```js
// data input
const imaging_breakdown = [
  {
    proc_category: "X-Rays",
    procedure: "Chest X-Ray",
    description: "Standard chest imaging to evaluate lungs and heart",
    cpt_code: "XXXX",
  },
  {
    proc_category: "CT",
    procedure: "Head/Brain CT",
    description: "Cross-sectional imaging of head or brain",
    cpt_code: "XXXX",
  },
  {
    proc_category: "MRI",
    procedure: "Brain CT",
    description: "Detailed imaging of brain and soft tissue",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Ultrasound",
    procedure: "Abdominal Ultrasound",
    description: "Non-invasive imaging for soft tissue evaluation",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Flouroscopy",
    procedure: "Real-Time Imaging",
    description: "Continuous X-Ray imaging for real-time movement",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Mammography",
    procedure: "Breast Screening",
    description: "Mammogram for breast cancer screening",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Nuclear Medicine",
    procedure: "Radiotracer Imaging",
    description: "Imaging with radiotracers to assess organ function",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Interventional Radiology",
    procedure: "Guided Procedures",
    description: "Image-guided techniques for surgical or diagnostic use",
    cpt_code: "XXXX",
  },
];
```

<div class="page-title-header ">
<div class="page-title">
Value Framing
</div>

<div class="horizontal-line"></div>

Hypothesis: Employ personalized savings as the primary behavioral economic principle.

</div>

<style>

table thead tr th {
  background-color: black !important;
  color: white !important;
}

table {
  border-collapse: separate; 
  border-spacing: 0; 
  border: 0px solid #ccc;
  border-radius: 10px;
  overflow: hidden; 
}


</style>

```js
const topX = 10; // Change to desired number of top states

const statepop = FileAttachment("./data/us-state-population-2010-2019.csv")
  .csv({ typed: true })
  .then((data) => {
    const withValue = data.slice(0, topX).map((d) => ({
      ...d,
      value: (d[2019] - d[2010]) / d[2010],
    }));
    return withValue;
  });
```

```js
const plot = Plot.plot({
  label: null,
  height: 400,

  x: {
    axis: "top",
    label: "← decrease · Change in population, 2010–2019 (%) · increase →",
    labelAnchor: "center",
    tickFormat: "+",
    percent: true,
  },
  color: {
    scheme: "PiYG",
    type: "ordinal",
  },
  marks: [
    Plot.barX(statepop, {
      x: "value",
      y: "State",
      fill: (d) => d.value > 0,
      sort: { y: "x" },
      limit: 10,
    }),
    Plot.gridX({ stroke: "white", strokeOpacity: 0.5 }),
    d3
      .groups(statepop, (d) => d.value > 0)
      .map(([growth, states]) => [
        Plot.axisY({
          x: 0,
          ticks: states.map((d) => d.State),
          tickSize: 0,
          anchor: growth ? "left" : "right",
        }),
        Plot.textX(states, {
          x: "value",
          y: "State",
          text: (
            (f) => (d) =>
              f(d.value)
          )(d3.format("+.1%")),
          textAnchor: growth ? "start" : "end",
          dx: growth ? 4 : -4,
        }),
      ]),
    Plot.ruleX([0]),
  ],
});

// Example usage
const config = {
  title: "How Do Preferred Facilities Compare?",
  subtitle: "Discover the incidence of Non-Preferred usage.",
  description: {
    initialText: "",
    highlightedText: "",
    finalText: "",
  },
  gridSplit: { left: 87, right: 25 },
  leftContent: {
    type: "plot",
    content: plot,
  },
  rightContent: {
    type: "cards",
    content: [
      {
        title: "KEY TAKEAWAY",
        flavor: "keyTakeaway",
        value: "4%",
        subtitle:
          "of Commercial Fully Insured members used Non-Preferred facilities for imaging in 2024",
        highlight: true,
      },
    ],
  },
  theme: "light",
  subheader: "",
};
```

```js
const imaging_breakdown = [
  {
    proc_category: "X-Rays",
    procedure: "Chest X-Ray",
    description: "Standard chest imaging to evaluate lungs and heart",
    cpt_code: "XXXX",
  },
  {
    proc_category: "CT",
    procedure: "Head/Brain CT",
    description: "Cross-sectional imaging of head or brain",
    cpt_code: "XXXX",
  },
  {
    proc_category: "MRI",
    procedure: "Brain CT",
    description: "Detailed imaging of brain and soft tissue",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Ultrasound",
    procedure: "Abdominal Ultrasound",
    description: "Non-invasive imaging for soft tissue evaluation",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Flouroscopy",
    procedure: "Real-Time Imaging",
    description: "Continuous X-Ray imaging for real-time movement",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Mammography",
    procedure: "Breast Screening",
    description: "Mammogram for breast cancer screening",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Nuclear Medicine",
    procedure: "Radiotracer Imaging",
    description: "Imaging with radiotracers to assess organ function",
    cpt_code: "XXXX",
  },
  {
    proc_category: "Interventional Radiology",
    procedure: "Guided Procedures",
    description: "Image-guided techniques for surgical or diagnostic use",
    cpt_code: "XXXX",
  },
];

const table = Inputs.table(imaging_breakdown, {
  format: {
    procedure: formatStatus,
    description: formatWrappedText(),
    proc_category: withRowHeight(
      "45px",
      "top"
    )(formatTextBold((d) => d.proc_category)),
  },
  // align: {
  //   proc_category: "left",
  //   procedure: "left",
  //   description: "left",
  //   cpt_code: "left",
  // },
  // columns: ["version", "timeInMarket", "outreach", "status"],
  header: {
    proc_category: "Procedure Category",
    procedure: "Procedure",
    description: "Description",
    cpt_code: "CPT",
  },
  width: "auto",
  height: "auto",
});
view(table);
```

```js
const composedPlot = {
  combine() {
    const teams = [
      { name: "Lakers", location: "Los Angeles, California" },
      { name: "Warriors", location: "San Francisco, California" },
      { name: "Celtics", location: "Boston, Massachusetts" },
      { name: "Nets", location: "New York City, New York" },
      { name: "Raptors", location: "Toronto, Ontario" },
    ];

    const teamSelector = Inputs.select(teams, {
      label: "Favorite team",
      format: (t) => t.name,
      value: teams.find((t) => t.name === "Warriors"),
    });

    // Create the main plot
    const mainPlot = Plot.plot({
      label: null,
      title: "Non-Preferred Incidence Rate by Procedure Category",
      height: 400,
      x: {
        axis: "top",
        label: "← decrease · Change in population, 2010–2019 (%) · increase →",
        labelAnchor: "center",
        tickFormat: "+",
        percent: true,
      },
      style: {
        background: "#fff",
      },
      color: {
        scheme: "PiYG",
        type: "ordinal",
      },
      marks: [
        Plot.barX(statepop, {
          x: "value",
          y: "State",
          fill: (d) => d.value > 0,
          sort: { y: "x" },
          limit: 10,
        }),
        Plot.gridX({ stroke: "white", strokeOpacity: 0.5 }),
        ...d3
          .groups(statepop, (d) => d.value > 0)
          .map(([growth, states]) => [
            Plot.axisY({
              x: 0,
              ticks: states.map((d) => d.State),
              tickSize: 0,
              anchor: growth ? "left" : "right",
            }),
            Plot.textX(states, {
              x: "value",
              y: "State",
              text: (
                (f) => (d) =>
                  f(d.value)
              )(d3.format("+.1%")),
              textAnchor: growth ? "start" : "end",
              dx: growth ? 4 : -4,
            }),
          ]),
        Plot.ruleX([0]),
      ],
    });

    // Create a container div
    const container = html`<div>
      <div style="margin-bottom: 1rem">${teamSelector}</div>
      ${mainPlot}
    </div>`;

    return container;
  },
  value: null, // This will be set when combine() is called
};
```

```js
const plot2 = Plot.plot({
  label: null,
  title: html`<div
      style="
    font-family: 'Helvetica Neue', sans-serif; 
    font-weight: 700; 
    font-size: 20px; 
    line-height: 24.42px;
    letter-spacing: -0.03em; 
    margin-bottom: 1rem;"
    >
      Non-Preferred Incidence Rate by Procedure Category
    </div>
    <div style="height: 24px;"></div>`,
  height: 400,
  x: {
    axis: "top",
    label: "← decrease · Change in population, 2010–2019 (%) · increase →",
    labelAnchor: "center",
    tickFormat: "+",
    percent: true,
  },
  style: {
    background: "#fff",
  },
  color: {
    scheme: "PiYG",
    type: "ordinal",
  },
  marks: [
    Plot.barX(statepop, {
      x: "value",
      y: "State",
      fill: (d) => d.value > 0,
      sort: { y: "x" },
      limit: 10,
    }),
    Plot.gridX({ stroke: "white", strokeOpacity: 0.5 }),
    d3
      .groups(statepop, (d) => d.value > 0)
      .map(([growth, states]) => [
        Plot.axisY({
          x: 0,
          ticks: states.map((d) => d.State),
          tickSize: 0,
          anchor: growth ? "left" : "right",
        }),
        Plot.textX(states, {
          x: "value",
          y: "State",
          text: (
            (f) => (d) =>
              f(d.value)
          )(d3.format("+.1%")),
          textAnchor: growth ? "start" : "end",
          dx: growth ? 4 : -4,
        }),
      ]),
    Plot.ruleX([0]),
  ],
});

const myTableStyles = {
  headerBackground: "#333333",
  headerTextColor: "#ffffff",
  headerHeight: "50px",
  tableBorderRadius: "18px",
};

const config2 = {
  title: "Where Are Members Going For Imaging?",
  subtitle: "Discover the incidence of Non-Preferred usage.",
  tableStyles: myTableStyles,
  description: {
    initialText: "",
    highlightedText: "",
    finalText: "",
  },
  gridSplit: { left: 35, right: 65 },

  leftContent: {
    type: "bodyDescription",
    content: "",
    bodyDescription: {
      initialText: html`<div style="height: 84px;"></div>
        We identified`,
      highlightedText: "8 categories of imaging procedures ",
      finalText: html`
        that can be done either at preferred or non-preferred facilities.
        <p>
          <strong> Non-preferred </strong> facilities are classified as
          out-of-network for CFI plans
        </p>
      `,
    },
    cardBackground: "#FFF",
  },
  rightContent: {
    type: "table",
    content: table,
    card: false,
  },
  theme: "dark",
  subheader: html``,
};
```

```js
const config3 = {
  title: "",
  subtitle: "The data reveals usage patterns and key trends.",
  tableStyles: "",
  description: {
    initialText: "",
    highlightedText: "",
    finalText: "",
  },
  gridSplit: { left: 50, right: 50 },

  leftContent: {
    type: "bodyDescription",
    content: "",
    bodyDescription: {
      initialText: html`
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut varius nisi
        quis neque elementum, sit amet commodo nisl dignissim. Duis nec
        efficitur massa. Maecenas pellentesque sapien et quam scelerisque, vitae
        blandit odio vehicula. Class aptent taciti sociosqu ad litora torquent
        per conubia nostra, per inceptos himenaeos. Vivamus at viverra sem, sed
        tempor elit. Sed rhoncus nec nunc nec commodo. Phasellus lobortis, eros
        ultricies feugiat hendrerit.
      `,
      highlightedText: "",
      finalText: "",
      fontStyles: {
        fontFamily: '"Helvetica Neue", sans-serif',
        fontSize: "18px",
        fontWeight: "400",
        lineHeight: "28px",
        marginBottom: "0.5rem",
        letterSpacing: "-.03em",
      },
    },
    cardBackground: "#FFF",
  },
  rightContent: {
    type: "bodyDescription",
    content: "",
    bodyDescription: {
      initialText: html`
        <ul style="margin: 0; padding-left: 1.5em;">
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
          <li>Duis nec efficitur massa.</li>
          <li>Class aptent taciti sociosqu ad litora torquent</li>
          <li>Sed rhoncus nec nunc nec commodo.</li>
        </ul>
      `,
      highlightedText: "",
      finalText: "",
      fontStyles: {
        fontFamily: '"Helvetica Neue", sans-serif',
        fontSize: "18px",
        fontWeight: "400",
        lineHeight: "28px",
        marginBottom: "0.5rem",
        letterSpacing: "-.03em",
      },
    },
    cardBackground: "#FFF",
  },
  theme: "light",
};
```

```js
//config 4
const config4 = {
  title: "The Cost of Choice.",
  subtitle: "How much could the members save by choosing Preferred facilities?",
  description: {
    initialText: "",
    highlightedText: "",
    finalText: "",
  },
  gridSplit: { left: 87, right: 25 },
  leftContent: {
    type: "plot",
    content: plot2,
    cardBackground: "#FFF",
  },
  rightContent: {
    type: "cards",
    content: [
      {
        title: "KEY TAKEAWAY",
        flavor: "keyTakeaway",
        value: "4%",
        subtitle:
          "of Commercial Fully Insured members used Non-Preferred facilities for imaging in 2024",
        highlight: true,
      },
    ],
  },
  theme: "dark",
  subheader: "",
};
```

```js
const boxdata = await FileAttachment("./data/Synthetic_Boxplot_Data.csv").csv({
  typed: true,
});
```

```js
const boxplot = createTwoToneBoxplot(boxdata, {
  // Dimensions
  title: "title",
  width: 800,
  height: 500,
  marginTop: 60,
  marginRight: 40,
  marginBottom: 100,
  marginLeft: 70,

  // Colors and styling
  fill1: "#E27588", // lighter pink for lower half
  fill2: "#D93954", // darker pink for upper half
  stroke1: "#E27588", // border for lower half
  stroke2: "#D93954", // border for upper half
  backgroundColor: "#ffffff",

  // Labels
  yLabel: "Allowed Cost ($)",
  xLabel: "Procedure Category",

  // Box styling
  boxStrokeWidth: 0,
  boxStrokeOpacity: 1,
  boxFillOpacity: 0.7,
  boxPadding: 0.3,

  // Median line
  medianLineColor: "#fff",
  medianLineWidth: 0,

  // Whisker styling
  whiskerColor: "#666",
  whiskerWidth: 1,
  whiskerCapWidth: 0.5,

  // Outlier styling
  showOutliers: true,
  outlierRadius: 3,
  outlierColor: "#FF4757",
  outlierFill: "#fff",
  outlierStrokeWidth: 1,

  // Grid styling
  showGrid: true,
  gridColor: "#e0e0e0",
  gridOpacity: 0.7,
  gridDash: [0],

  // Axis styling
  xTickRotation: 0,
  xTickSize: 0,
  yTickSize: 0,
  tickFontSize: "12px",
  tickFontFamily: "Arial, sans-serif",
  labelFontSize: "14px",
  labelFontFamily: "Arial, sans-serif",

  // Scales
  yScale: {
    type: "linear",
    domain: [0, 9000],
    nice: true,
  },

  // Tooltip styling
  tooltipEnabled: true,
  tooltipStyles: `
    .custom-tooltip {
      background: white;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-family: Arial, sans-serif;
    }
    .custom-tooltip-header {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .custom-tooltip-content {
      display: grid;
      grid-template-columns: auto auto;
      gap: 6px;
      font-size: 12px;
    }
    .custom-tooltip-label {
      color: #666;
    }
    .custom-tooltip-value {
      font-weight: 500;
      text-align: right;
    }
  `,
  tooltipClassName: "custom-tooltip",
  tooltipPosition: "auto",
  tooltipOffset: { x: 10, y: 10 },
  tooltipDelay: 0,
  tooltipHideDelay: 0,
  tooltipAnimation: false,
  /// show advDiff
  showAdvDiff: true,
  advDiffBackground: {
    show: true,
    fill: "#f8f9fa",
    height: 30,
  },
  advDiffStyles: {
    label: {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      fontWeight: "bold",
      color: "000",
    },
    values: {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      fontWeight: "normal",
      color: "000",
    },
  },
  advDiffData: {
    Any: 1200,
    "X-Ray": 300,
    CT: 1000,
    MRI: 2200,
    US: 300,
    NM: 1500,
    Mammo: 1500,
    Fluoro: 500,
    IR: 1500,
  },
  advDiffLabel: "Adv. Diff:",
  advDiffPrefix: "$",
  advDiffPadding: 30,
});

// Append to document
```

```js
const config5 = {
  title: "The Cost of Choice.",
  subtitle: "How much could the members save by choosing Preferred facilities?",
  description: {
    initialText: "",
    highlightedText: "",
    finalText: "",
  },
  gridSplit: { left: 87, right: 25 },
  leftContent: {
    type: "plot",
    content: boxplot.svg,
    cardBackground: "#FFF",
  },
  rightContent: {
    type: "cards",
    content: [
      {
        title: "KEY TAKEAWAY",
        flavor: "keyTakeaway",
        value: "4%",
        subtitle:
          "of Commercial Fully Insured members used Non-Preferred facilities for imaging in 2024",
        highlight: true,
      },
    ],
  },
  theme: "light",
  subheader: "",
};
```

```js
const element2 = createUnifiedSplitPanel(config2);

view(element2);

const element = createUnifiedSplitPanel(config);

view(element);

const element3 = createUnifiedSplitPanel(config3);

view(element3);

const element4 = createUnifiedSplitPanel(config4);

view(element4);

const element5 = createUnifiedSplitPanel(config5);

view(element5);
```
