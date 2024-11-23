---
theme: light
title: Medicare, Medicare, Medicare
toc: true
---

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import * as numeric from "https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js"
import { require } from "d3-require"
const jStat = await require("jstat@1.9.4")
import { DOM } from "@observablehq/runtime"
```

```js
import {
  fetchECFRData,
  createCollapsibleElement,
  searchSections,
  displaySearchResults,
} from "./components/eCFRFetch.js"
```

<style>
      body {
      font: 13.5px/1.5 var(--serif);
      margin: 0;
      max-width: 90%;
      }

      table {
          border-collapse: collapse;
          table-layout:fixed;
          width: 100%;
          height: 20%;
          font: 13.5px/1.5 var(--serif);

      }
      th {
          font: 13.5px/1.5 var(--serif);
          font-weight: bold;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
    }
    tr:last-child td {
        /* font-weight: bold; */
        border-bottom: 1px solid black;
        /* background-color: lightyellow; */
    }
    /* tr:nth-last-child(2) {
        border-bottom: 1px dashed black;
    } */
    td, th {
        text-align: left;
        border-collapse: collapse;
        padding:2px;
        font-size:0.8em;
    }

    .horizontal-line {
    border-top: 0.5px solid #d3d3d3; /* Creates a thin gray line */
    width: 100%; /* Spans the width of the container/page */
    margin-top:10px;
    margin-bottom:10px
    }

    .katex { font-size: 1em; }
    

      /* p { max-width: 90% } */

  .iframe-container {
              position: relative;
              width: 100%;
              height: 100%;
              overflow: hidden;
          }
          .iframe-container iframe {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: none;
          }

               .container {
      margin-left: 20px;
    }
    .arrow {
      margin-right: 5px;
    }
     .header {
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
    }
    .content {
      display: none;
    }
    mark {
      background-color: yellow;
    }
    .highlighted-section {
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 10px;
    }
     .indented {
      margin-left: 20px;
    }
    .level-1 {
      margin-left: 20px;
    }
    .level-2 {
      margin-left: 40px;
    }
    .level-3 {
      margin-left: 60px;
    }
  
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.2/math.min.js"> </script>

# What are Star Ratings and why is your healthcare plan losing its mind?

Prior to talking about Stars and HEDIS things, we need to understand a bit about Medicare. Let's dive into this first and then get into the insanity of stars and hedis calculations.

## Fact: Medicare and Medicaid are NOT insurances

Medicare and Medicaid are NOT insurance. They're federal entitlements. Medicare benefits are guaranteed by federal law to all eligible individuals who have paid into the system through payroll taxes or meet specific eligibility criteria.

In the Code of Federal Registers (CFR): Title 42, Chapter IV, Subchapter B, you get a raw notion of exactly how complex the Medicare regulations are. To help you in your journey into this insanity, you can go the the [Code of Federal Regulations](https://www.ecfr.gov/).

This website is pretty good, actually. Unfortunately, it's not possible to directly embed an iframe for it, so I've gone and created an API to use it in javascript and embed it here. Was this a massive waste of time. **Yes**. Did I do it anyway? **Also, _yes_**.

For convenience, I've filtered this for just Title 42 : Public Health. You can then Search it, if you'd like.I'll also put a collapsable version, as well.

<div class = "horizontal-line"></div>

<div id="collapsible-container"></div>

```js
// prettier-ignore
fetchECFRData().then((data) => {
  const collapsibleElement = createCollapsibleElement(data);
  document.getElementById("collapsible-container").appendChild(collapsibleElement);
});
```

<div class = "horizontal-line"></div>

```js
// Event listener for search button
document.getElementById("search-button").addEventListener("click", async () => {
  const keyword = document.getElementById("search-input").value
  const sections = await searchSections(keyword)
  displaySearchResults(sections)
})

// Fetch the data and create the collapsible view
fetchECFRData().then((data) => {
  const collapsibleElement = createCollapsibleElement(data)
  document.body.appendChild(collapsibleElement)
})
```

<input type="text" id="search-input" placeholder="Enter keyword to search">
  <button id="search-button">Search</button>
  <div id="search-results"></div>

Ok, let's organize the code a little bit. This may break in the future, but for now, this works.
Let's start with a quick search of the titles:

## Medicare Breakdown

Once again, _not an attorney_, but here's a micro breakdown of the parts of Medicare.

<div class="grid grid-cols-2">
  <div><h1>Part A: Hospital Insurance </h1>

- Inpatient Hospital Care: Covers hospital stays, including semi-private rooms, meals, general nursing, and drugs as part of your inpatient treatment.
- Skilled Nursing Facility (SNF) Care: Covers skilled nursing care in a facility for a limited time (up to 100 days per benefit period) following a hospital stay of at least three days.
- Hospice Care: Provides care for terminally ill patients, including pain relief, symptom management, and support services for the patient and family.
- Home Health Care: Covers certain home health services if you are homebound and need skilled nursing care, physical therapy, speech-language pathology services, or continued occupational therapy.
</div>
<div><h1>Part B: Medical Insurance</h1>

- Doctor's Visits: Covers outpatient care, including visits to your primary care physician and specialists.
- Preventive Services: Covers screenings, vaccines, and annual wellness visits.
- Durable Medical Equipment (DME): Covers items like wheelchairs, walkers, and hospital beds.
- Outpatient Services: Includes services such as lab tests, x-rays, mental health services, and outpatient surgeries.
- Home Health Services: Limited to part-time or intermittent skilled nursing care and home health aide services, physical therapy, speech-language pathology services, and continued occupational therapy.

  </div>
  <div ><h1>Part C: Medicare Advantage</h1>

  - Medicare Advantage (MA) plans, offered by private insurance companies approved by Medicare, combine Part A, Part B, and usually Part D benefits.
  - Many plans offer extra benefits like vision, hearing, dental, wellness programs, and supplementary benefits. Some plans may also offer coverage for prescription drugs (MA-PD plans).
      </div>
      <div ><h1>Part D: Prescription Drug Coverage</h1>

    - Helps cover the cost of prescription drugs (including many recommended shots or vaccines).
      </div>
    </div>

It should be noted thatYou usually don't pay a monthly premium for Part A if you or your spouse paid Medicare taxes while working for a certain amount of time. This is sometimes called ["premium-free Part A."](https://www.medicare.gov/basics/costs/medicare-costs)

Medicare Star Ratings are a way to evaluate the quality of Medicare Advantage (Part C) and Part D Prescription Drug (Part D) plans on a scale of 1 to 5, with 5 being the highest.

TO BE CONTINUED...
