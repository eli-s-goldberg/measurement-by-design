---
toc: false
theme: [air, wide]
title: Summary
---

```js
import { DataFrame } from "./components/DataFrame.js";
import { createUnifiedSplitPanel } from "./components/Layouts.js";
import {
  formatTwoLevel,
  formatStatus,
  sparkbar,
  formatTextBold,
  formatWrappedText,
  withRowHeight,
} from "./components/TableFormatters.js";
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
<div class="horizontal-line"></div>

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
    version: "v3",
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

```js
const withTooltip =
  (tooltipContent) =>
  (formatter = (d) => d) => {
    return (value, row) => {
      const formattedValue = formatter(value, row);
      const tooltip =
        typeof tooltipContent === "function"
          ? tooltipContent(row)
          : tooltipContent;

      return html`
        <div class="points-wrapper">
          <span class="points-red tooltip-left" data-tooltip="${tooltip}">
            ${formattedValue}
          </span>
        </div>
      `;
    };
  };

// Change tableStyles to hoverTableStyles
const hoverTableStyles = {
  styles: html`
    <style>
      .points-wrapper {
        position: relative;
        display: inline-block;
      }

      .points-red {
        background-color: #d75f44;
        border-radius: 100%;
        height: 19px;
        color: #fff;
        font-size: 13px;
        line-height: 19px;
        text-align: center;
        text-shadow: 1px 1px rgba(0, 0, 0, 0.1);
        width: 19px;
        display: inline-block;
      }

      .tooltip-left[data-tooltip]:hover::before {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #af241c;
        margin: -8px 0 0 4px;
      }

      .tooltip-left[data-tooltip]:hover::after {
        content: attr(data-tooltip);
        padding: 2px 10px;
        position: absolute;
        background: #af241c;
        color: #fff;
        text-align: right;
        text-indent: 0;
        line-height: 25px;
        white-space: nowrap;
        word-wrap: normal;
        border-radius: 2px;
        z-index: 9999;
        font-weight: normal;
        margin: -36px 48px 0 0;
        right: 0;
      }
    </style>
  `,
};

// Version tooltips mapping
const versionTooltips = {
  v3: "Version 3: Latest production release with enhanced targeting",
  vs3: "Version S3: Special release with experimental features",
};
```

```js
const table_selected = await Inputs.table(df.print(), {
  required: false,
  format: {
    campaign: formatTextBold(df.print(), (d) => d.outreach),
    value: withTooltip((row) => `Here is the hover test for ${row.value}`)(
      (d) => d
    ),
    category: withRowHeight("45px", "top")(formatWrappedText()),
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
  style: hoverTableStyles.styles,
  header: {
    campaign: "Campaign",
    category: "Lever",
    version: "Vs.",
    outreach: "Outreach",
    behaviorChange: "Behavior Change",
    liftPerPerson: "Lift",
    value: "Value",
    status: "Status",
  },
  width: "auto",
  height: "auto",
  rows: 20,
});
```

</div>
</div>

```js
const myTableStyles = {
  headerBackground: "#fff",
  headerTextColor: "#000",
  headerHeight: "40px",
  tableBorderRadius: "18px",
};

// Example usage of createUnifiedSplitPanel for dashboard layout
const dashboardConfig = {
  title: "Campaign Dashboard",
  layout: "vertical", // Specify vertical layout
  tableStyles: myTableStyles,

  // Top section with cards
  topContent: {
    type: "cards",
    content: [
      {
        flavor: "keyTakeaway",
        title: "TOTAL CAMPAIGN VALUE",
        value: "$103M",
        subtitle: "50 Campaigns",
      },
      {
        flavor: "keyTakeawayWhite",
        title: "BOOKED VALUE",
        value: "$60M",
        subtitle: "35 Campaigns",
      },
      {
        flavor: "keyTakeawayWhite",
        title: "FORECASTED VALUE",
        value: "$43M",
        subtitle: "15 Campaigns",
      },
    ],
    cardHeight: "160px",

    card: true, // Don't wrap the cards section in an additional card
  },

  // Bottom section with table
  bottomContent: {
    type: "table",

    tableSubtitle: html`<div
      style="
      font-family: 'Helvetica Neue', sans-serif; 
      font-weight: 700; 
      font-size: 20px; 
      line-height: 24.42px;
      letter-spacing: -0.03em; 
      margin-bottom: 1rem;
      margin-left: 2rem;
      margin-top: 2rem"
    >
      Campaigns
    </div>`,
    tableStyles: myTableStyles,
    content: table_selected,
    card: false, // Wrap the table in a card container
  },

  theme: "dark",
};

// Create the panel
const dashboardPanel = createUnifiedSplitPanel(dashboardConfig);
view(dashboardPanel);
```
