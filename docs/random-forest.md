---
toc: true
title: Home-grown In-Browser ML -- Building a Random Forest Classifier in JavaScript
sidebar: true
---

<style>
  body {
    font: 13.5px/1.5 var(--serif);
    margin: 0;
    max-width: 90%;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
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
    border-bottom: 1px solid black;
  }
  td, th {
    text-align: left;
    border-collapse: collapse;
    padding: 2px;
    font-size: 0.8em;
  }

  .horizontal-line {
    border-top: 0.5px solid #d3d3d3;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .katex { font-size: 1em; }

  p { max-width: 90%; }

  /* Style for code blocks */
  pre code {
    background-color: #f5f5f5;
    padding: 10px;
    display: block;
    overflow-x: auto;
    border-radius: 5px;
  }

  /* Style for inline code */
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.8em;
  }

  /* Ensure images are the same width as text (90%) */
  img {
    max-width: 90%; /* Matches the max-width of the text */
    height: auto;   /* Keep aspect ratio */
    display: block; /* Ensure the image is a block element */
    margin: 10px 0; /* Add some vertical spacing */
  }

</style>

```js
import { RandomForestClassifier } from "./components/RandomForestClassifier.js";
import { generateDonutHoleData } from "./components/DonutData.js";
```

# In-Browser Machine Learning: Building a Random Forest Classifier in JavaScript

## Training and Visualization

Donut-hole Parameters:

```js
// Donut hole data generation parameters as range inputs in a form with adjusted labels
const donutParamsForm = Inputs.form({
  nOuter: Inputs.range([5, 200], {
    value: 20,
    step: 10,
    label: html`<b>nOuter</b>`,
  }),
  nInner: Inputs.range([5, 100], {
    value: 20,
    step: 5,
    label: html`<b>nInner</b>`,
  }),
  innerRadius: Inputs.range([1, 5], {
    value: 2,
    step: 0.5,
    label: html`<b>innerRadius</b>`,
  }),
  outerRadius: Inputs.range([2, 10], {
    value: 5,
    step: 0.5,
    label: html`<b>outerRadius</b>`,
  }),
});

view(donutParamsForm);
const donutParamsForm_Selections = Generators.input(donutParamsForm);
```

Random forest classifier parameters:

```js
// RandomForestClassifier parameters as range inputs in a form with adjusted labels
const rfParamsForm = Inputs.form({
  nEstimators: Inputs.range([1, 200], {
    value: 5,
    step: 1,
    label: html`<b>nEstimators</b>`,
  }),
  maxDepth: Inputs.range([1, 10], {
    value: 4,
    step: 1,
    label: html`<b>maxDepth</b>`,
  }),
  minSize: Inputs.range([1, 10], {
    value: 2,
    step: 1,
    label: html`<b>minSize</b>`,
  }),
  sampleSize: Inputs.range([0.1, 1.0], {
    value: 0.8,
    step: 0.1,
    label: html`<b>sampleSize</b>`,
  }),
  maxFeatures: Inputs.range([1, 10], {
    value: 3,
    step: 1,
    label: html`<b>maxFeatures</b>`,
  }),
  decimalPrecision: Inputs.range([1, 5], {
    value: 2,
    step: 1,
    label: html`<b>decimalPrecision</b>`,
  }),
});
view(rfParamsForm);
const rfParamsForm_Selections = Generators.input(rfParamsForm);
```

```js
// Generate data using the inputs
const { X, y } = generateDonutHoleData(
  donutParamsForm_Selections.nOuter,
  donutParamsForm_Selections.nInner,
  donutParamsForm_Selections.innerRadius,
  donutParamsForm_Selections.outerRadius
);

// Create and train the classifier using the inputs
const clf = new RandomForestClassifier({
  nEstimators: rfParamsForm_Selections.nEstimators,
  maxDepth: rfParamsForm_Selections.maxDepth,
  minSize: rfParamsForm_Selections.minSize,
  sampleSize: rfParamsForm_Selections.sampleSize,
  maxFeatures: rfParamsForm_Selections.maxFeatures,
  decimalPrecision: rfParamsForm_Selections.decimalPrecision,
});

// fit the classifier
clf.fit(X, y);

// let's transform said donut data to a conveniently structured form, because js is awesome like that.
const scatterData = X.map((d, i) => ({
  x: d[0],
  y: d[1],
  truth: y[i],
}));

// let's visualize the decision boundary
const { grid2D, values2D } = clf.generateClassificationDomain(
  scatterData,
  0.15
);

// let's turn this data into a convenient raster object.
const rasterData = [];
for (let i = 0; i < grid2D.length; i++) {
  for (let j = 0; j < grid2D[i].length; j++) {
    rasterData.push({
      x: grid2D[i][j][0],
      y: grid2D[i][j][1],
      fill: values2D[i][j],
    });
  }
}

const treePaths = clf.convertForestToPaths();
const forestHierarch = clf.convertForestToHierarchy();
```

Ok cool. Now let's project the decision boundary over the 'donut-data' to visualize our trained model.

```js
// Prepare the raster data for plotting
const rasterData = [];
for (let i = 0; i < grid2D.length; i++) {
  for (let j = 0; j < grid2D[i].length; j++) {
    rasterData.push({
      x: grid2D[i][j][0], // X coordinate
      y: grid2D[i][j][1], // Y coordinate
      fill: values2D[i][j], // Predicted class (0 or 1)
    });
  }
}

const rasterPlot = Plot.plot({
  color: {
    type: "ordinal",
    legend: true,
    label: "Predicted Class",
    // domain: [0, 1],  // Domain to define class 0 and class 1
    range: ["lightblue", "lightcoral"], // Color range for classes
  },
  width: 900,
  height: 480,
  marks: [
    // Raster plot to represent the classification boundary
    Plot.raster(rasterData, {
      x: "x",
      y: "y",
      fill: "fill",
      interpolate: "random-walk", // Optional interpolation for smoother transition between classes
    }),
    // Scatter plot to show the actual points with ground truth labels
    Plot.dot(scatterData, {
      x: "x",
      y: "y",
      fill: (d) => (d.truth === 0 ? "blue" : "red"),
      stroke: "black",
      r: 4, // Larger radius for original data points
    }),
  ],
});

view(rasterPlot);
```

Here's the trained forest object.

```js
view(forestHierarch);
```

Neat. Now, let's visualize it. Note that trees here are connected to the terminal node. I don't want to mess with that visual (for now), so just like, get over it or whatever and stare at my beatiful FOREST.

```js
// Visualize using Observable Plot
const forestplot = Plot.plot({
  axis: null,
  margin: 10,
  marginLeft: 40,
  marginRight: 160,
  width: 900,
  height: 600,
  marks: [Plot.cluster(treePaths, { textStroke: "white" })],
});
view(forestplot);
```

Ok. Now let's make some predictions and check the performance.

```js
const yPred = clf.predict(X);
const confusionmatrix = clf.confusionMatrix(y, yPred);
const confusionData = [];
const labels = confusionmatrix.labels;

for (let i = 0; i < labels.length; i++) {
  for (let j = 0; j < labels.length; j++) {
    confusionData.push({
      true_label: labels[i],
      predicted_label: labels[j],
      count: confusionmatrix.matrix[i][j],
    });
  }
}

const accuracy = clf.round(clf.accuracyScore(yTrue, yPred));
const recall = clf.round(clf.recallScore(yTrue, yPred));
const precision = clf.round(clf.precisionScore(yTrue, yPred));
```

```js
const confusionPlot = Plot.plot({
  padding: 0,
  grid: true,
  x: {
    axis: "top",
    label: "Predicted Label",
    domain: labels, // Ensure the x-axis includes all labels
    tickFormat: (d) => d.toString(),
  },
  y: {
    label: "True Label",
    domain: labels, // Ensure the y-axis includes all labels
    tickFormat: (d) => d.toString(),
  },
  color: {
    type: "linear",
    scheme: "Blues",
    label: "Count",
  },
  width: 200,
  height: 200,
  marks: [
    // Cells representing counts
    Plot.cell(confusionData, {
      x: "predicted_label",
      y: "true_label",
      fill: "count",
      inset: 0.5,
      title: (d) =>
        `True: ${d.true_label}, Predicted: ${d.predicted_label}, Count: ${d.count}`,
    }),
    // Text labels showing counts
    Plot.text(confusionData, {
      x: "predicted_label",
      y: "true_label",
      text: (d) => d.count.toString(),
      fill: (d) => (d.count > 0 ? "black" : "gray"),
      textAnchor: "middle",
      stroke: "white",
      size: 10,
      dy: 5,
    }),
  ],
});
```

Should we make an AUC chart? I guess.

```js
// 1. Get probability estimates
const proba = clf.predictProba(X);

// 2. Extract probabilities for the positive class (assuming class '1')
const yScores = proba.map((probs) => probs[1]);

// 3. Ensure yTrue is an array of numbers
const yTrue = y.map((label) => Number(label));

// 4. Compute ROC curve
function computeROC(yTrue, yScores, positiveClass = 1) {
  const data = yTrue.map((trueLabel, index) => ({
    trueLabel,
    score: yScores[index],
  }));

  data.sort((a, b) => b.score - a.score);

  let tp = 0;
  let fp = 0;
  const tpr = [];
  const fpr = [];
  const thresholds = [];

  const posCount = yTrue.filter((label) => label === positiveClass).length;
  const negCount = yTrue.length - posCount;

  for (let i = 0; i < data.length; i++) {
    const { trueLabel } = data[i];
    if (trueLabel === positiveClass) {
      tp += 1;
    } else {
      fp += 1;
    }
    tpr.push(tp / posCount);
    fpr.push(fp / negCount);
    thresholds.push(data[i].score);
  }

  return { fpr, tpr, thresholds };
}

const { fpr, tpr, thresholds } = computeROC(yTrue, yScores, 1);

// 5. Compute AUC
function computeAUC(fpr, tpr) {
  let auc = 0;
  for (let i = 1; i < fpr.length; i++) {
    const xDiff = fpr[i] - fpr[i - 1];
    const ySum = tpr[i] + tpr[i - 1];
    auc += (xDiff * ySum) / 2;
  }
  return auc;
}

const auc = computeAUC(fpr, tpr);

// 6. Prepare data for plotting
const rocData = fpr.map((fprValue, index) => ({
  fpr: fprValue,
  tpr: tpr[index],
}));

// 7. Plot the ROC curve
const rocPlot = Plot.plot({
  width: 500,
  height: 500,
  x: {
    label: "False Positive Rate",
    domain: [0, 1],
  },
  y: {
    label: "True Positive Rate",
    domain: [0, 1],
  },
  marks: [
    Plot.line(rocData, { x: "fpr", y: "tpr", stroke: "steelblue" }),
    Plot.ruleY([0, 1], { x: [0, 1], stroke: "gray", strokeDasharray: "2,2" }),
    Plot.text([{ x: 0.6, y: 0.1, text: `AUC = ${clf.round(auc)}` }], {
      x: "x",
      y: "y",
      text: "text",
      fill: "black",
      fontSize: 14,
    }),
  ],
});
```

<div class="grid grid-cols-2">
  <div >
  
  ```js
  view(confusionPlot)

````

The accuracy ${accuracy}, recall ${recall}, and precision ${precision}.

</div>
<div >

```js
view(rocPlot);
````

 </div>
</div>
