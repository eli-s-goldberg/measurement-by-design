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

```js
const data = FileAttachment("./data/us-state-population-2010-2019.csv").csv({
  typed: true,
});
```

```js
import { SummaryTable } from "./components/SummaryTable.js";
```

```js
view(
  SummaryTable(data, {
    width: 800,
    tableStyles: {
      rowHeight: "60px",
      headerHeight: "50px",
      headerBackground: "#333333",
      headerTextColor: "#ffffff",
      tableBorderRadius: "18px",
    },
  })
);
```
