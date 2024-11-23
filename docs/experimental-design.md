---
theme: light
title: Choosing an experimental design
toc: true
---

```js
import {
  calculateSampleSizeWithDesignMatrix,
  calculateFollowUpPeriods,
  calculateStandardizedMeanDifference,
  DesignMatrix,
  DesignMatrixWithDetails,
  vartheta_Krep,
  vartheta_m,
  assignClustersToDesignMatrix,
} from "./components/swmethods.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import * as numeric from "https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js"
import { require } from "d3-require"
const jStat = await require("jstat@1.9.4")
```

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.2/math.min.js"> </script>

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

      p { max-width: 90% }


    </style>

# Choosing an experimental design

For me _measurement_ is the essence of data science.

You say your model that has a higher prediction performance works better? _Prove it_.

You say your product drives more ROI or impact than your competitors? _Prove it_.

You say your new educational program improves student learning outcomes? _Prove it_.

In the pharmaceutical world, drugs are heavily examined through the drug development process. I think it's likely arguable that not all are tested under the best approaches (and many drugs are extremely difficult to test due to their operational constraints or targets) and some allowances need to be made. However, in almost every other clinical context (e.g., payer and vendor clinical products), most products are not well tested. There are some obvious counterpoints here, but you get the point. There are products that generate millions or even _tens of millions_ in revenue and no one... and I mean no one, really knows if it actually _works_.

To this end, I've taken to dividing measurement into _credible_ measurement and everything else. To credibly measure something is to look past all the marketing, product framing, and business logic, and truly figure out _does this thing actually work_. For products that are people-facing, I think it's super important that we change this. To this end, I've always wanted to write my own little guide to credible measurement. Not because I would do the math any differently (well, maybe), but because I've always wanted to simply write my thoughts on designing experiments.

## A flowchart

This is a good resource for RCT Designs: [Cornu et al., 2013](https://link.springer.com/article/10.1186/1750-1172-8-48)

Within this article, there's a really interesting plot that I've recreated here. However, I've tried to make it a bit easier to navigate by asking a series of question (I'll probably dork this up).

```js
const result_cluster = Plot.plot({
  axis: null,
  inset: 10,
  marginLeft: 60,
  marginRight: 60,
  round: true,
  // width: 1000,
  // height: 800,
  marks: Plot.cluster(flare_flat, {
    // treeSort: "node:height",
    textStroke: "white",
    treeLayout: indent,
    delimiter: "/",
    // curve: "step-before",
  }),
})

view(result_cluster)
```

```js
const design_json = FileAttachment("./data/experimental-flare.json").json()
```

```js
function flattenHierarchy(node, path = []) {
  if (!node.children || node.children.length === 0) {
    return [path.concat(node.name).join("/")]
  }

  return node.children.flatMap((child) =>
    flattenHierarchy(child, path.concat(node.name))
  )
}
const flare_flat = flattenHierarchy(design_json)
```

```js
function indent() {
  return (root) => {
    root.eachBefore((node, i) => {
      node.y = node.depth
      node.x = i
    })
  }
}
```

## Visualizing common experimental designs.

```js
const trialDesign = Inputs.radio(
  new Map([
    ["Parallel", "Parallel"],
    ["Parallel with baseline measure", "Before and After"],
    ["Two-period cross-over", "Cross-over"],
    ["Stepped-wedge", "Stepped-wedge"],
    ["Multiple-period cross-over", "Multi cross-over"],
  ]),
  { value: "Parallel", label: "Trial Design" }
)
const trialDesignSelection = Generators.input(trialDesign)
view(trialDesign)
```

```js
const periods = Inputs.range([2, 10], {
  value: 4,
  step: 1,
  label: "Experimental Periods",
})
const periodsSelection = Generators.input(periods)
view(periods)
```

```js
const dm = DesignMatrix(trialDesignSelection, periodsSelection)
```

```js
const flattenedDm = dm.flatMap((row, i) =>
  row.map((cell, j) => ({ x: j, y: i, value: cell }))
)
```

```js
const designMatrixPlot = Plot.plot({
  marks: [
    Plot.cell(flattenedDm, {
      x: "x",
      y: "y",
      fill: (d) => (d.value === 1 ? "green" : "white"),
    }),
    Plot.text(flattenedDm, {
      x: "x",
      y: "y",
      text: (d) => d.value,
      fill: "black",
      title: "title",
    }),
  ],
  x: { axis: true, label: "periods" },
  y: { axis: false, label: "arms" },
  color: { legend: false },
  grid: true,
  marginLeft: 100,
  width: 400,
  height: 200,
})
```

```js
view(designMatrixPlot)
```

<!-- Tree Visualizatinon and Selection -->

```js
function reduceTrialDesignTree(answers) {
  const trialDesignTree = {
    name: "",
    children: [
      {
        name: "Reversible outcome",
        children: [
          {
            name: "Rapid response",
            children: [
              {
                name: "",
                children: [
                  {
                    name: "Minimise time on placebo",
                    children: [
                      {
                        name: "Active treatment at the end",
                        children: [{ name: "DS, RPP, SW" }],
                      },
                      {
                        name: "No active treatment at the end",
                        children: [{ name: "RW, EE, 3S, AR" }],
                      },
                    ],
                  },
                  {
                    name: "Time on placebo not minimised",
                    children: [
                      {
                        name: "Intra-patient controls",
                        children: [{ name: "CO, LS, N1" }],
                      },
                      {
                        name: "Inter-patient controls",
                        children: [{ name: "PG, F" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "Slow response",
            children: [
              {
                name: "Minimise time on placebo",
                children: [
                  {
                    name: "Active treatment at the end",
                    children: [{ name: "DS, RPP, SW" }],
                  },
                  {
                    name: "No active treatment at the end",
                    children: [{ name: "RW" }],
                  },
                ],
              },
              {
                name: "Time on placebo not minimised",
                children: [{ name: "PG, F" }],
              },
            ],
          },
        ],
      },
      {
        name: "Non-reversible outcome",
        children: [
          {
            name: "",
            children: [
              {
                name: "Rapid response",
                children: [
                  {
                    name: "Minimise time on placebo",
                    children: [
                      {
                        name: "Active treatment at the end",
                        children: [{ name: "RPP, SW" }],
                      },
                    ],
                  },
                  {
                    name: "Time on placebo not minimised",
                    children: [{ name: "PG, F" }],
                  },
                ],
              },
              {
                name: "Slow response",
                children: [
                  {
                    name: "Minimise time on placebo",
                    children: [{ name: "RPP, SW" }],
                  },
                  {
                    name: "Time on placebo not minimised",
                    children: [{ name: "PG, F" }],
                  },
                ],
              },
              {
                name: "Active treatment at the end",
                children: [{ name: "RPP, SW" }],
              },
              {
                name: "No active treatment at the end",
                children: [{ name: "AR" }],
              },
            ],
          },
        ],
      },
    ],
  }

  function traverseTree(node, answers) {
    if (answers.length === 0) {
      return node.children
        ? node.children.map((child) => ({ name: child.name }))
        : []
    }

    if (node.children) {
      let answer = answers.shift()
      for (let child of node.children) {
        if (child.name.includes(answer)) {
          return traverseTree(child, answers)
        }
      }

      // Recursively look down the tree if no matching child is found
      for (let child of node.children) {
        if (child.children) {
          let result = traverseTree(child, [answer, ...answers])
          if (result.length > 0) {
            return result
          }
        }
      }
    }
    return [] // Return an empty array if no match is found
  }

  let terminalNodes = traverseTree(trialDesignTree, [...answers])
  return terminalNodes
}
```

```js
function translateTrialDesign(nodes) {
  const trialDesignKey = {
    PG: "Parallel Groups",
    CO: "Cross-over",
    LS: "Latin square",
    F: "Factorial design",
    N1: "N-of-1",
    RPP: "Randomised placebo phase",
    SW: "Stepped wedge",
    RW: "Randomised withdrawal",
    EE: "Early escape",
    DS: "Delayed start",
    "3S": "Three stage",
    AR: "Adaptive randomization",
  }

  return nodes.map((node) => {
    const codes = node.name.split(", ")
    return codes.map((code) => trialDesignKey[code] || code).join(", ")
  })
}
```

<!--  Old flare plot

```js
const flare_cluster = Plot.plot({
  axis: null,
  inset: 10,
  marginLeft: 60,
  insetRight: 120,
  marginRight: 200,
  round: true,
  width: 500,
  height: 800,
  marks: Plot.tree(flare_flat, {
    treeSort: "node:height",
    textStroke: "white",
    treeLayout: indent,
    delimiter: "/",
    curve: "step-before",
  }),
});

view(flare_cluster);
``` -->
