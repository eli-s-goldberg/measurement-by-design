---
title: Problem Definition
toc: true
---

```js
// import some CSS to keep things well styled
import { defaultStyles } from "./components/styles.js";
const styleElement = html`<style>
  ${defaultStyles}
</style>`;
document.head.appendChild(styleElement);
```

```js
import { InteractiveImagingExplorer } from "./components/interactiveimagingexample.js";
import { DistP, distributions } from "./components/DistP.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
```

# Problem Definition

```mermaid
graph LR
  direction LR
  PD[Problem
  Definition]:::pwcYellow --> DS[EDA & ROI]:::transparent
  DS[EDA &
  ROI] --> ClinApproval[Hypothesis &
  Recommend Actions]:::transparent
  ClinApproval--> TargExc[Targeting,
  Exclusions,
  Cohorting]:::transparent
  TargExc--> ExpDesign1[Experimental
  Design]:::transparent
  ExpDesign1-- Terminate -->DevTerm["Start Over"]:::transparent
  ExpDesign1-- Rethink -->DevReturn["Return to EDA"]:::transparent
  ExpDesign1-- Approval -->ToMarketing["To Marketing"]:::transparent

  classDef pwcYellow fill:#FFB600,stroke:#000000,color:#000000
  classDef transparent fill:#ffffff40,stroke:#00000040,color:#00000040
  linkStyle default color:#00000040
```

### What is `preferred` vs `non-preferred` imaging? What types of imaging are there?

```js
view(InteractiveImagingExplorer());
```

### Why `preferred` Imaging Locations?

Opting for **preferred (in-network) imaging locations** benefits both payers and members:

- **For Members**: Lower out-of-pocket costs due to negotiated rates with in-network providers. Members also avoid unexpected billing surprises and benefit from streamlined approval and claims processes.

- **For Payers**: Reduced costs by leveraging pre-negotiated contracts with in-network providers. This promotes predictable spending, reduces administrative burden, and helps maintain lower premiums for members.

Encouraging preferred imaging usage aligns financial incentives, improves member satisfaction, and supports sustainable healthcare costs.
