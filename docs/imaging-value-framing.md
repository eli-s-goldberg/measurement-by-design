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
} from "./components/TableFormatters.js";

import { pwcStyle } from "./components/pwcStyle.js";
const styleElement = html`<style>
  ${pwcStyle}
</style>`;
document.head.appendChild(styleElement);
```

```js
import { createSplitPanelTableLayout } from "./components/createSplitPanelTableLayout.js";

import { createSplitPanelPlotLayout } from "./components/createSplitPanelPlotLayout.js";
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
  border: 3px solid #ccc;
  border-radius: 1px;
  overflow: hidden; 
}


</style>

```js
const tableStylesPlot = {
  headerBackground: "#444444",
  headerTextColor: "#ffffff",
  headerHeight: "45px",
  tableBorderRadius: "10px",
};

const configPlot = {
  title: "State Population Change Analysis",
  description: {
    initialText: "Population change data highlights ",
    highlightedText: "major shifts",
    finalText: " in certain states.",
  },
  tableStyles: tableStylesPlot,
  leftContent: {
    type: "plot",
    content: plot,
  },
  rightContent: {
    type: "table",
    content: Inputs.table(statepop),
  },
  gridSplit: { left: 50, right: 50 },
};

const elementPlotTable = createUnifiedSplitPanel(configPlot);
view(elementPlotTable);
```

<div style="height: 32px;"></div>

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
```

```js
const table = Inputs.table(imaging_breakdown, {
  // format: {
  //   proc_category: formatTwoLevel(),
  //   timeInMarket: formatTwoLevel(),
  //   outreach: sparkbar(d3.max(imaging_breakdown, (d) => d.outreach)),
  //   costPerChangeBehavior: (x) => `$${x.toLocaleString("en-US")}`,
  //   status: formatStatus,
  // },
  align: {
    version: "left",
    timeInMarket: "left",
    outreach: "left",
    costPerChangeBehavior: "left",
    behaviorChangeLift: "left",
    value: "left",
    status: "left",
  },
  // columns: ["version", "timeInMarket", "outreach", "status"],
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
```

```js
const topX = 15; // Change to desired number of top states

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
```

```js
const costAnalysisTableStyles = {
  headerBackground: "#333333",
  headerTextColor: "#ffffff",
  headerHeight: "48px",
  tableBorderRadius: "5px",
};

const configCardsAndPlot = {
  title: "How Do Preferred Facilities Compare?",
  tableStyles: costAnalysisTableStyles,
  description: {
    initialText: "Analysis shows ",
    highlightedText: "significant cost variations",
    finalText: " between preferred and non-preferred facilities.",
  },
  leftContent: {
    type: "plot",
    content: plot,
  },
  rightContent: {
    type: "tables",
    content: Inputs.table(imaging_breakdown),
  },
  gridSplit: { left: 50, right: 50 },
  subheader: "",
};

const elementCardsPlot = createUnifiedSplitPanel(configCardsAndPlot);
view(elementCardsPlot);
```
