---
toc: false
theme: [air, wide]
title: Value Framing
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
Behavior Change Portfolio: MedEx
</div>

Track, manage, and forecast campaign impact.

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
<div class="grid">
  <div class="card card-yellow">
    <div>
      <p class="text-header">TOTAL CAMPAIGN VALUE</p>
      <p class="horizontal-line"></p>
      <p class="text-title">$103M</p>
      <p class="text-subtext">50 Campaigns</p>
    </div>
  </div>

  <!-- Second Card (White) -->
  <div class="card card-white">
    <div>
      <p class="text-header">BOOKED VALUE</p>
      <div class="horizontal-line"></div>
      <p class="text-title">$60M</p>
      <p class="text-subtext">35 Campaigns</p>
    </div>
  </div>

  <!-- Third Card (Gray) -->
  <div class="card card-white">
    <div>
      <p class="text-header">FORECASTED VALUE</p>
      <div class="horizontal-line"></div>
      <p class="text-title">$43M</p>
      <p class="text-subtext">15 Campaigns</p>
    </div>
  </div>
</div>

```js
const data = [
  {
    campaign: "Shift Imaging to Preferred Facility",
    category: "site of care & provider selection",
    version: "v3",
    outreach: 18800,
    behaviorChange: 1300,
    liftPerPerson: 3,
    value: 1100000,
    status: "booked",
  },
  {
    campaign: "Increased Adherence for High Risk of CHF Readmission",
    category: "site of care & provider selection",
    version: "v3",
    outreach: 20000,
    behaviorChange: 2200,
    liftPerPerson: 3,
    value: 1100000,
    status: "booked",
  },
  {
    campaign: "Avoid Low Value Procedures",
    category: "rx management",
    version: "v3",
    outreach: 28000,
    behaviorChange: 1800,
    liftPerPerson: 3,
    value: 1100000,
    status: "booked",
  },
  {
    campaign: "ASC for Cataracts",
    category: "rx management",
    version: "v3",
    outreach: 48000,
    behaviorChange: 1800,
    liftPerPerson: 3,
    value: 1100000,
    status: "booked",
  },
  {
    campaign: "Switch to On-Formulary RX",
    category: "rx management",
    version: "vs3",
    outreach: 35000,
    behaviorChange: 1800,
    liftPerPerson: 3,
    value: 1100000,
    status: "pilot",
  },
  {
    campaign: "Avoid Specialty Escalation",
    category: "rx management",
    version: "v3",
    outreach: 50000,
    behaviorChange: 1800,
    liftPerPerson: 3,
    value: 1100000,
    status: "pilot",
  },
  {
    campaign: "Early PT Adherence",
    category: "rx management",
    version: "v3",
    outreach: 24000,
    behaviorChange: 1800,
    liftPerPerson: 3,
    value: 1100000,
    status: "pilot",
  },
  {
    campaign: "Asthma + COPD Misdiagnosis",
    category: "rx management",
    version: "v3",
    outreach: 5000,
    behaviorChange: 1800,
    liftPerPerson: 3,
    value: 1100000,
    status: "pilot",
  },
];

const df = new DataFrame(data);
```

<div class = "card">
<div class = "table-header-style">

Campaigns

</div>

```js
function sparkbar(max) {
  return (x) => htl.html`<div style="
    background: lightblue;
    color: black;
    width: ${(100 * x) / max}%;
    float: left;
    padding-right: 3px;
    padding-left: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: start;">${x.toLocaleString("en-US")}`;
}

function formatTextBold(text, charLimit = 50) {
  return (x) => {
    const str = x.toLocaleString("en-US");
    const wrapped = str.replace(new RegExp(`(.{${charLimit}})`, "g"), "$1\n");
    return htl.html`<div style="
      color: black;
      font-weight: 500;
      min-height: 40px;
      float: left;
      padding: 3px;
      box-sizing: border-box;
      white-space: pre-wrap;
      display: flex;
      align-items: center;
      justify-content: start;">${wrapped}</div>`;
  };
}

function formatText(text, charLimit = 50) {
  return (x) => {
    const str = x.toLocaleString("en-US");
    const wrapped = str.replace(new RegExp(`(.{${charLimit}})`, "g"), "$1\n");
    return htl.html`<div style="
      color: black;
      min-height: 40px;
      float: left;
      padding: 3px;
      box-sizing: border-box;
      white-space: pre-wrap;
      display: flex;
      align-items: center;
      justify-content: start;">${wrapped}</div>`;
  };
}
// font: 52px/1.5 "ITC Charter Com", serif;

const table_selected = await view(
  Inputs.table(df.print(), {
    required: false,
    format: {
      campaign: formatTextBold(df.print(), (d) => d.outreach),
      category: formatText(df.print(), (d) => d.category),
      outreach: sparkbar(d3.max(df.print(), (d) => d.outreach)),
      behaviorChange: sparkbar(d3.max(df.print(), (d) => d.behaviorChange)),
    },
    align: {
      campaign: "left",
      category: "left",
      version: "center",
      outreach: "left",
      behaviorChange: "left",
      liftPerPerson: "left",
      value: "left",
      status: "left",
    },
    header: {
      campaign: "Campaign",
      category: "Category",
      version: "Vs.",
      outreach: "Outreach",
      behaviorChange: "Behavior Change",
      liftPerPerson: "Lift",
      value: "Value",
      status: "Status",
    },
    layout: "auto",
    rows: 20,
  })
);
```

</div>
</div>
