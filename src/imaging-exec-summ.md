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

import { createUnifiedSplitPanel } from "./components/Layouts.js";
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
const element5 = createUnifiedSplitPanel(tabconfig);
view(element5);
```

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
});

view(table);
```

```js
const tabconfig = {
  title: "Current Campaign",
  subtitle: "",
  gridSplit: { left: 50, right: 25 },
  leftContent: {
    type: "tabs",
    content: [
      {
        type: "bodyDescription", // New type to handle body description
        initialText: "This campaign targets members who are ",
        highlightedText:
          "most likely to receive imaging procedures at Non-Preferred facilities ",
        finalText:
          "  and attempts to drive them to Preferred locations instead.",
        position: "top",
      },
      {
        name: "Tactics",
        title: "",
        subtitle: "",
        description: html`<div style="width: 499px;">
          Member-specific out-of-pocket savings as hook to influence switch to
          Preferred. Duis nec efficitur massa. Maecenas pellentesque sapien et
          quam scelerisque, vitae blandit odio vehicula. Class aptent taciti
          sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Vivamus at viverra sem, sed tempor elit. Sed rhoncus nec
          nunc nec commodo. Phasellus lobortis, eros ultricies feugiat
          hendrerit.
        </div>`,
        isActive: true,
      },
      {
        name: "Channels",
        title: "",
        subtitle: "",
        description: html`<div style="width: 499px;">
          Channel-specific out-of-pocket savings as hook to influence switch to
          Preferred. Duis nec efficitur massa. Maecenas pellentesque sapien et
          quam scelerisque, vitae blandit odio vehicula. Class aptent taciti
          sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Vivamus at viverra sem, sed tempor elit. Sed rhoncus nec
          nunc nec commodo. Phasellus lobortis, eros ultricies feugiat
          hendrerit.
        </div>`,
        isActive: false,
      },
      {
        name: "Measurement",
        title: "",
        subtitle: "",
        description: html`<div style="width: 499px;">
          Measurement-specific out-of-pocket savings as hook to influence switch
          to Preferred. Duis nec efficitur massa. Maecenas pellentesque sapien
          et quam scelerisque, vitae blandit odio vehicula. Class aptent taciti
          sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Vivamus at viverra sem, sed tempor elit. Sed rhoncus nec
          nunc nec commodo. Phasellus lobortis, eros ultricies feugiat
          hendrerit.
        </div>`,
        isActive: false,
      },
    ],
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
      {
        title: "RUN-RATE SAVINGS",
        flavor: "valueAtStake",
        value: "$1.1M",
        subtitle: "Current Campaign (v3)",
        highlight: true,
      },
    ],
  },
  theme: "dark",
};
```
