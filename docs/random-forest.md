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

I had an afternoon to myself while my wife and child attended yet another birthday party (seriously, how many friends does a five-year-old need?). With no distractions, I decided to embark on a six-hour coding marathon.

In hindsight, this project was supe fun learning experience in understanding the inner workings of Random Forests and the delightful quirks of **PURE** JavaScript (**COUGH** _NOT MY MOST EXPERIENCED LANGUAGE AND ITS ECCENTRICITIES DRIVE ME UP A WALL_). To be brutally honest, this would not have been possible without the tireless patience of ChatGPT, arguably the world's most competent rubber duck. 

<figure>
  <div style="width: 55vw; margin: 0 auto;">

```js
      const trees = await FileAttachment('./data/decision-tree.jpg').image({
        style: "width: 100vw; height: 150px; object-fit: cover; box-shadow: 8px 8px 8px;",
        title: "Trees",
        alt: "https://unsplash.com/@sebastian_unrau?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
      });

      view(trees);
  ```

  </div>

  <figcaption style="text-align: center;">
    Photo by <a href="https://unsplash.com/@madebyjens?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jens Lelie</a> on 
    <a href="https://unsplash.com/photos/two-roads-between-trees-u0vgcIOQG08?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  </figcaption>

</figure>


**Why Did I Choose to Rewrite a Random Forest in JavaScript? Am I Some Kind of Masochist?**

Firstly, I'm extremely stressed out. When stress hits, I find solace in tackling complex problems; nothing says relaxation like reinventing the wheel (see [ml-random-forest js](https://www.npmjs.com/package/ml-random-forest)) in a language that tests my patience.

Secondly, I wanted a challenge. Python is my go-to language for data science, thanks to its rich ecosystem of libraries like scikit-learn, pandas, and numpy. JavaScript, on the other hand, doesn't quite measure up in that department. Sure, it has libraries, but let's be real... they're not the same, are they? Despite this, I love the convenience of JavaScript and Observable for bringing beautiful, interactive content to the web.

Third(ly?), in my data science career, I've noticed that most tasks require simple solutions, and simple models are largely sufficient (#MaintainROI). Running machine learning models directly in the browser without server-side dependencies might not have massive practical applications, unless you're into flashy demos and educational tools. I'd love to be proven wrong!


## 1. Let's just get to the neato visuals

To test the classifier, I introduced a donut hole classification example... because I was totally eating and drinking me some 'dunks when I decided to embark on this. The goal is to classify points inside a circle (the hole) differently from those in the surrounding donut-shaped area.

### 1.1 Data Generation

Let's generate some synthetic data. Because I _just_ got Dunkin', let's make this some kind of donut-hole classification. And thank you ChatGPT for whipping this one up in its entirety...

```javascript
function generateDonutHoleData(nOuter, nInner, innerRadius, outerRadius) {
    const X = [];
    const y = [];

    function randomPointInCircle(radiusMin, radiusMax) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return [x, y];
    }

    for (let i = 0; i < nOuter; i++) {
        const [x, yVal] = randomPointInCircle(innerRadius, outerRadius);
        X.push([x, yVal]);
        y.push(0);
    }

    for (let i = 0; i < nInner; i++) {
        const [x, yVal] = randomPointInCircle(0, innerRadius);
        X.push([x, yVal]);
        y.push(1);
    }

    return { X, y };
}
```

This function creates a challenging dataset for the classifier to learn non-linear boundaries.

### 1.2 Training and Visualization

Donut-hole Parameters:
```js
// Donut hole data generation parameters as range inputs in a form with adjusted labels
const donutParamsForm = Inputs.form({
  nOuter: Inputs.range([5, 200], {
    value: 20,
    step: 10,
    label: html`<b>nOuter</b>`
  }),
  nInner: Inputs.range([5, 100], {
    value: 20,
    step: 5,
    label: html`<b>nInner</b>`
  }),
  innerRadius: Inputs.range([1, 5], {
    value: 2,
    step: 0.5,
    label: html`<b>innerRadius</b>`
  }),
  outerRadius: Inputs.range([2, 10], {
    value: 5,
    step: 0.5,
    label: html`<b>outerRadius</b>`
  })
});

view(donutParamsForm)
const donutParamsForm_Selections = Generators.input(donutParamsForm)
```

Random forest classifier parameters:
```js
// RandomForestClassifier parameters as range inputs in a form with adjusted labels
const rfParamsForm = Inputs.form({
  nEstimators: Inputs.range([1, 200], {
    value: 5,
    step: 1,
    label: html`<b>nEstimators</b>`
  }),
  maxDepth: Inputs.range([1, 10], {
    value: 4,
    step: 1,
    label: html`<b>maxDepth</b>`
  }),
  minSize: Inputs.range([1, 10], {
    value: 2,
    step: 1,
    label: html`<b>minSize</b>`
  }),
  sampleSize: Inputs.range([0.1, 1.0], {
    value: 0.8,
    step: 0.1,
    label: html`<b>sampleSize</b>`
  }),
  maxFeatures: Inputs.range([1, 10], {
    value: 3,
    step: 1,
    label: html`<b>maxFeatures</b>`
  }),
  decimalPrecision: Inputs.range([1, 5], {
    value: 2,
    step: 1,
    label: html`<b>decimalPrecision</b>`
  })
});
view(rfParamsForm)
const rfParamsForm_Selections = Generators.input(rfParamsForm)
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
  decimalPrecision: rfParamsForm_Selections.decimalPrecision
});

// fit the classifier
clf.fit(X,y)

// let's transform said donut data to a conveniently structured form, because js is awesome like that.
const scatterData = X.map((d, i) => ({
    x: d[0],
    y: d[1],
    truth: y[i]
}));

// let's visualize the decision boundary
const { grid2D, values2D } = clf.generateClassificationDomain(scatterData, 0.15);

// let's turn this data into a convenient raster object. 
const rasterData = [];
for (let i = 0; i < grid2D.length; i++) {
    for (let j = 0; j < grid2D[i].length; j++) {
        rasterData.push({
            x: grid2D[i][j][0],
            y: grid2D[i][j][1],
            fill: values2D[i][j]
        });
    }
}

const treePaths = clf.convertForestToPaths();
const forestHierarch = clf.convertForestToHierarchy()
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
            fill: values2D[i][j] // Predicted class (0 or 1)
        });
    }
}

const rasterPlot = Plot.plot({
  color: {
    type: "ordinal",
    legend: true,
    label: "Predicted Class",
    // domain: [0, 1],  // Domain to define class 0 and class 1
    range: ["lightblue", "lightcoral"]  // Color range for classes
  },
  width: 900,
  height: 480,
  marks: [
    // Raster plot to represent the classification boundary
    Plot.raster(rasterData, {
      x: "x",
      y: "y",
      fill: "fill",
      interpolate: "random-walk"  // Optional interpolation for smoother transition between classes
    }),
    // Scatter plot to show the actual points with ground truth labels
    Plot.dot(scatterData, {
      x: "x",
      y: "y",
      fill: d => d.truth === 0 ? "blue" : "red",
      stroke: "black",
      r: 4 // Larger radius for original data points
    })
  ]
});

view(rasterPlot);
```

Here's the trained forest object. 
```js
view(forestHierarch)
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
  marks: [
   Plot.cluster(treePaths, {textStroke: "white"})
  ]
});
view(forestplot)
```

Ok. Now let's make some predictions and check the performance. 

```js
const yPred = clf.predict(X)
const confusionmatrix = clf.confusionMatrix(y, yPred)
const confusionData = [];
const labels = confusionmatrix.labels;

for (let i = 0; i < labels.length; i++) {
  for (let j = 0; j < labels.length; j++) {
    confusionData.push({
      true_label: labels[i],
      predicted_label: labels[j],
      count: confusionmatrix.matrix[i][j]
    });
  }
}

const accuracy = clf.round(clf.accuracyScore(yTrue, yPred))
const recall = clf.round(clf.recallScore(yTrue, yPred))
const precision = clf.round(clf.precisionScore(yTrue, yPred))
```


```js
const confusionPlot = Plot.plot({
  padding: 0,
  grid: true,
  x: {
    axis: "top",
    label: "Predicted Label",
    domain: labels, // Ensure the x-axis includes all labels
    tickFormat: d => d.toString()
  },
  y: {
    label: "True Label",
    domain: labels, // Ensure the y-axis includes all labels
    tickFormat: d => d.toString()
  },
  color: {
    type: "linear",
    scheme: "Blues",
    label: "Count"
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
      title: d => `True: ${d.true_label}, Predicted: ${d.predicted_label}, Count: ${d.count}`
    }),
    // Text labels showing counts
    Plot.text(confusionData, {
      x: "predicted_label",
      y: "true_label",
      text: d => d.count.toString(),
      fill: d => (d.count > 0 ? "black" : "gray"),
      textAnchor: "middle",
      stroke: 'white',
      size: 10,
      dy: 5
    })
  ]
});

```


Should we make an AUC chart? I guess. 

```js

// 1. Get probability estimates
const proba = clf.predictProba(X);

// 2. Extract probabilities for the positive class (assuming class '1')
const yScores = proba.map(probs => probs[1]);

// 3. Ensure yTrue is an array of numbers
const yTrue = y.map(label => Number(label));

// 4. Compute ROC curve
function computeROC(yTrue, yScores, positiveClass = 1) {
  const data = yTrue.map((trueLabel, index) => ({
    trueLabel,
    score: yScores[index]
  }));

  data.sort((a, b) => b.score - a.score);

  let tp = 0;
  let fp = 0;
  const tpr = [];
  const fpr = [];
  const thresholds = [];

  const posCount = yTrue.filter(label => label === positiveClass).length;
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
  tpr: tpr[index]
}));

// 7. Plot the ROC curve
const rocPlot = Plot.plot({
  width: 500,
  height: 500,
  x: {
    label: 'False Positive Rate',
    domain: [0, 1]
  },
  y: {
    label: 'True Positive Rate',
    domain: [0, 1]
  },
  marks: [
    Plot.line(rocData, { x: 'fpr', y: 'tpr', stroke: 'steelblue' }),
    Plot.ruleY([0, 1], { x: [0, 1], stroke: 'gray', strokeDasharray: '2,2' }),
    Plot.text([{ x: 0.6, y: 0.1, text: `AUC = ${clf.round(auc)}` }], {
      x: 'x',
      y: 'y',
      text: 'text',
      fill: 'black',
      fontSize: 14
    })
  ]
});


```

<div class="grid grid-cols-2">
  <div >
  
  ```js
  view(confusionPlot)

  ```

  The accuracy ${accuracy}, recall ${recall}, and precision ${precision}. 
  
  </div>
  <div >
  
  ```js
  view(rocPlot);
  ```
  

 </div>
</div>


## 2. How Does Each Part of This Function Work?

Let's dive into the `RandomForestClassifier` class. I'll walk you through its methods in the order they are executed during training and prediction, explaining how they fit together, and sprinkle in some commentary to keep things interesting.

### 2.1 Constructor

The journey begins with initializing the Random Forest classifier. The constructor sets up the model with user-defined parameters, controlling the complexity and randomness of the forest. This setup allows us to balance the bias-variance trade-off, eventually finding the sweet spot between underfitting and overfitting.

```javascript
constructor({ nEstimators = 10, maxDepth = 5, minSize = 1, sampleSize = 1.0, 
  maxFeatures = null, decimalPrecision = 2 } = {}) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.minSize = minSize;
    this.sampleSize = sampleSize;
    this.maxFeatures = maxFeatures;
    this.decimalPrecision = decimalPrecision;
    this.trees = [];
    this.classLabels = []; // Keep track of all class labels
}
```

**Parameters:**

- `nEstimators`: Number of trees in the forest. Because more trees equal more fun, right?
- `maxDepth`: Maximum depth of each tree. Let's not grow infinitely tall trees; we're not building skyscrapers.
- `minSize`: Minimum number of samples required to split an internal node. Sometimes, you just have to know when to stop splitting hairs.
- `sampleSize`: Proportion of the dataset to use for each tree (with replacement). Variety is the spice of life (and machine learning).
- `maxFeatures`: Number of features to consider when looking for the best split. If `null`, it defaults to the square root of the number of features, because that seems entirely not a made up thing to becuase one guy/girl did it once and it worked. 
- `decimalPrecision`: Precision for rounding numerical values. Because floating-point errors are the stuff of nightmares.

These settings are crucial for controlling overfitting and ensuring that each tree in the forest is sufficiently unique.

### 2.2 Fitting the Model

Training the Random Forest involves building multiple decision trees. The `fit` method is the entry point for this process.

```javascript
fit(X, y) {
    const dataset = X.map((row, idx) => [...row, y[idx]]);
    this.classLabels = [...new Set(y.map(label => String(label)))]; // Store class labels as strings
    for (let i = 0; i < this.nEstimators; i++) {
        const sample = this.subsample(dataset, this.sampleSize);
        const tree = this.buildTree(sample, this.maxDepth, this.minSize);
        this.trees.push(tree);
    }
}
```

**Parameters:**

- `X`: Feature matrix, an array of input vectors.
- `y`: Target values corresponding to each input vector in `X`.

First, it combines the features `X` and labels `y` into a single dataset. Each data point becomes an array of features followed by its label. Then, it stores all unique class labels (as strings) in `this.classLabels` for later use. For each tree, it generates a bootstrap sample using the `subsample` method. This sample is used to build a tree via the `buildTree` method, and the resulting tree is added to the forest.

#### 2.2.1 `subsample(dataset, ratio)`

Generates a bootstrap sample of the dataset with replacement. Each tree is trained on a random subset of the data, which helps create diverse trees and reduces overfitting.

```javascript
subsample(dataset, ratio) {
    const nSample = Math.round(dataset.length * ratio);
    const sample = [];
    for (let i = 0; i < nSample; i++) {
        const index = Math.floor(Math.random() * dataset.length);
        sample.push(dataset[index]);
    }
    return sample;
}
```

**Parameters:**

- `dataset`: The original dataset from which to sample.
- `ratio`: The proportion of the dataset to include in the sample.

This method randomly selects data points from the dataset to create a sample of a specified size (`ratio` of the original dataset). Because it samples with replacement, some data points may appear multiple times, while others may be omitted. This randomness is key to building uncorrelated trees in the forest.

### 2.3 Building Trees

The `buildTree` method initiates the construction of a decision tree. It starts by finding the best split for the root node and then recursively splits child nodes.

```javascript
buildTree(train, maxDepth, minSize) {
    const root = this.getSplit(train);
    this.split(root, maxDepth, minSize, 1);
    return root;
}
```

**Parameters:**

- `train`: The training dataset to build the tree.
- `maxDepth`: Maximum depth of the tree.
- `minSize`: Minimum number of samples required to split a node.

It uses the `getSplit` method to determine the optimal feature and value to split the data at the root node. Then, it calls the `split` method to recursively build the tree from there.

### 2.4 Finding the Best Split

The `getSplit` method determines the best feature and value to split the dataset to minimize Gini impurity.

```javascript
getSplit(dataset) {
    const classValues = [...new Set(dataset.map(row => row[row.length - 1]))];
    let bestIndex, bestValue, bestScore = Infinity, bestGroups;

    const nFeatures = dataset[0].length - 1;
    const features = this.getRandomFeatures(nFeatures);

    for (const index of features) {
        for (const row of dataset) {
            const groups = this.testSplit(index, row[index], dataset);
            const gini = this.giniImpurity(groups, classValues);
            if (gini < bestScore) {
                bestIndex = index;
                bestValue = row[index];
                bestScore = gini;
                bestGroups = groups;
            }
        }
    }

    if (bestGroups === undefined) {
        return this.toTerminal(dataset);
    }

    return {
        index: bestIndex,
        value: this.round(bestValue),
        gini: bestScore,
        groups: bestGroups
    };
}
```

**Parameters:**

- `dataset`: The dataset to find the best split for.

By considering a random subset of features (thanks to `getRandomFeatures`), it ensures each tree is a unique snowflake. The goal is to find the most "pure" split, reducing the impurity like a water filter for your data. It iterates over possible splits, using `testSplit` to divide the dataset and `giniImpurity` to evaluate the quality of each split. Like some sort of dystopian future I fear we're headed towards, this function tracks and returns the split with the lowest Gini impurity (which is traditionally called 'best', but that's not really the right way to think about it... IS IT?).

#### 2.4.1 `getRandomFeatures(nFeatures)`

Selects a random subset of features to consider at each split.

```javascript
getRandomFeatures(nFeatures) {
    let maxFeatures = this.maxFeatures;
    if (!maxFeatures) {
        maxFeatures = Math.max(1, Math.floor(Math.sqrt(nFeatures)));
    }
    maxFeatures = Math.min(maxFeatures, nFeatures); // Ensure we don't select more features than available
    const features = [];
    while (features.length < maxFeatures) {
        const index = Math.floor(Math.random() * nFeatures);
        if (!features.includes(index)) {
            features.push(index);
        }
    }
    return features;
}
```

**Parameters:**

- `nFeatures`: Total number of features in the dataset.

This introduces randomness into the model, which is crucial for the diversity of the trees in the forest. It helps reduce correlation among trees, thereby improving overall performance. Think of it as diversifying your investment portfolio but with data features.

#### 2.4.2 `testSplit(index, value, dataset)`

Splits the dataset into two groups based on the specified feature index and value.

```javascript
testSplit(index, value, dataset) {
    const left = [], right = [];
    for (const row of dataset) {
        if (row[index] < value) {
            left.push(row);
        } else {
            right.push(row);
        }
    }
    return [left, right];
}
```

**Parameters:**

- `index`: The index of the feature to split on.
- `value`: The value of the feature to split at.
- `dataset`: The dataset to split.

This function divides the dataset into two groups: those that meet the split condition and those that don't. It's like dividing your Halloween candy stash into piles to maximize happiness...except with data and probably less eventual diabetes.

#### 2.4.3 `giniImpurity(groups, classes)`

Computes the Gini impurity for a split, measuring how often a randomly chosen element would be incorrectly labeled.

```javascript
giniImpurity(groups, classes) {
    const nInstances = groups.reduce((sum, group) => sum + group.length, 0);
    let gini = 0.0;

    for (const group of groups) {
        const size = group.length;
        if (size === 0) continue; // Avoid dividing by zero.
        const classCounts = {};
        for (const row of group) {
            const classVal = row[row.length - 1];
            classCounts[classVal] = (classCounts[classVal] || 0) + 1;
        }
        let score = 0.0;
        for (const classVal of classes) {
            const proportion = (classCounts[classVal] || 0) / size;
            score += proportion * proportion;
        }
        gini += (1.0 - score) * (size / nInstances);
    }
    return this.round(gini);
}
```

**Parameters:**

- `groups`: An array containing the left and right groups after a split.
- `classes`: A list of unique class values in the dataset.

This method calculates the impurity of the groups created by a split. A lower Gini impurity indicates a better split. In other words, we're trying to make each node as "pure" as possible, much like trying to keep toddlers from sticking their fingers in their mouths, getting sick, destroying everyone's ability to rest and recover, only to _eventually recover_ and do the same thing again **literally** the next day. Futile.

### 2.5 Recursive Splitting

The `split` method recursively divides the dataset into smaller subsets, building the tree structure. Think of it as a Russian nesting doll, but it maxes out at the depth provided in the constructor to prevent infinite recursion.

```javascript
split(node, maxDepth, minSize, depth) {
    if (node.isTerminal) {
        return; // We've reached a leaf node.
    }

    const [left, right] = node.groups;
    delete node.groups; // Remove groups to free up memory.

    // Check for a no-split condition
    if (!left.length || !right.length) {
        node.left = node.right = this.toTerminal(left.concat(right));
        return;
    }

    // Max depth reached
    if (depth >= maxDepth) {
        node.left = this.toTerminal(left);
        node.right = this.toTerminal(right);
        return;
    }

    // Left child
    if (left.length <= minSize) {
        node.left = this.toTerminal(left);
    } else {
        node.left = this.getSplit(left);
        this.split(node.left, maxDepth, minSize, depth + 1);
    }

    // Right child
    if (right.length <= minSize) {
        node.right = this.toTerminal(right);
    } else {
        node.right = this.getSplit(right);
        this.split(node.right, maxDepth, minSize, depth + 1);
    }
}
```

**Parameters:**

- `node`: The current node to split.
- `maxDepth`: Maximum depth of the tree.
- `minSize`: Minimum number of samples required to split a node.
- `depth`: Current depth of the tree.

This method ensures that the tree doesn't grow indefinitely. Each recursive call increases the `depth` by one, and when it reaches `maxDepth`, the recursion stops. Additionally, if a node has fewer samples than `minSize`, it becomes a terminal node. This helps prevent overfitting and keeps the tree manageable. It's like deciding that further debate is pointless and settling on an answer, Dad.

#### 2.5.1 `toTerminal(group)`

Creates a terminal node (leaf) by assigning the most common class in the group.

```javascript
toTerminal(group) {
    const outcomes = group.map(row => row[row.length - 1]);
    const counts = {};
    let maxCount = 0;
    let prediction;
    for (const value of outcomes) {
        counts[value] = (counts[value] || 0) + 1;
        if (counts[value] > maxCount) {
            maxCount = counts[value];
            prediction = value;
        }
    }
    return { isTerminal: true, value: prediction };
}
```

**Parameters:**

- `group`: The dataset at the current node.

This method determines the class that appears most frequently in the group and creates a terminal node with that prediction.

### 2.6 Making Predictions

After training, we use the model to make predictions on new data. The `predict` method aggregates predictions from all trees.

```javascript
predict(X, plotPath = false) {
    return X.map(row => {
        const predictions = this.trees.map(tree => this.predictTree(tree, row, plotPath));
        const counts = {};
        for (const pred of predictions) {
            counts[pred] = (counts[pred] || 0) + 1;
        }
        let maxCount = 0;
        let majorityClass = null;
        for (const [key, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                majorityClass = key;
            }
        }
        return majorityClass;
    });
}
```

**Parameters:**

- `X`: Feature matrix of input data to predict.
- `plotPath` (optional): If `true`, logs the path taken through the tree for each prediction.

For each data point, it collects predictions from all trees using the `predictTree` method. It then determines the most common prediction among the aboreal majority voting to decide the final prediction.

#### 2.6.1 `predictTree(node, row, plotPath = false, depth = 0)`

Traverses a single tree to make a prediction for a given data point.

```javascript
predictTree(node, row, plotPath = false, depth = 0) {
    if (node.isTerminal) {
        if (plotPath) console.log(`${'|  '.repeat(depth)}Leaf: Predict ${node.value}`);
        return node.value;
    }

    if (plotPath) {
        console.log(`${'|  '.repeat(depth)}Node: X${node.index} < ${node.value} (Gini: ${node.gini})`);
    }

    if (row[node.index] < node.value) {
        return this.predictTree(node.left, row, plotPath, depth + 1);
    } else {
        return this.predictTree(node.right, row, plotPath, depth + 1);
    }
}
```

**Parameters:**

- `node`: The current node in the tree.
- `row`: The data point to predict.
- `plotPath` (optional): If `true`, logs the path taken through the tree.
- `depth`: Current depth in the tree (used for logging purposes).

This function starts at the root and moves left or right based on the feature value until it reaches a leaf node. If `plotPath` is true, it logs the path taken through the tree.

### 2.7 Predicting Probabilities

To compute metrics like the ROC curve and AUC, we need probability estimates. The `predictProba` method provides class probability estimates based on the proportion of trees predicting each class.

```javascript
predictProba(X) {
    return X.map(row => {
        const predictions = this.trees.map(tree => this.predictTree(tree, row));
        const counts = {};
        for (const pred of predictions) {
            const classLabel = String(pred); // Ensure the label is a string
            counts[classLabel] = (counts[classLabel] || 0) + 1;
        }
        const total = this.trees.length;
        const probabilities = {};
        for (const classLabel of this.classLabels) {
            probabilities[classLabel] = counts[classLabel] ? counts[classLabel] / total : 0;
        }
        return probabilities;
    });
}
```

This method ensures that all possible class labels are included in the probability output, even if their probability is zero.

### 2.8 Helper Methods

#### 2.8.1 `round(value)`

Rounds a number to the specified decimal precision. Ensures consistency and readability in numerical outputs.

```javascript
round(value) {
    return parseFloat(value.toFixed(this.decimalPrecision));
}
```

**Parameters:**

- `value`: The numerical value to round.

This method helps prevent floating-point errors and keeps numerical values neat and tidy. Also, it helps prevent the infamous JavaScript floating-point shenanigans that can turn your elegant algorithm into a dumpster fire.

### 2.9 Model Persistence

#### 2.9.1 `saveModel()`

Serializes the model to a JSON string for saving.

```javascript
saveModel() {
    return JSON.stringify({
        nEstimators: this.nEstimators,
        maxDepth: this.maxDepth,
        minSize: this.minSize,
        sampleSize: this.sampleSize,
        decimalPrecision: this.decimalPrecision,
        maxFeatures: this.maxFeatures,
        trees: this.trees
    });
}
```

This allows the trained model to be saved and reloaded later without retraining.

#### 2.9.2 `loadModel(modelJson)`

Loads the model from a JSON string.

```javascript
loadModel(modelJson) {
    const model = JSON.parse(modelJson);
    this.nEstimators = model.nEstimators;
    this.maxDepth = model.maxDepth;
    this.minSize = model.minSize;
    this.sampleSize = model.sampleSize;
    this.decimalPrecision = model.decimalPrecision;
    this.maxFeatures = model.maxFeatures;
    this.trees = model.trees;
}
```

**Parameters:**

- `modelJson`: A JSON string representing the saved model.

Restores the model state, making it ready for predictions without retraining.

### 2.10 Visualization and Debugging Methods

#### 2.10.1 `printTree(node, depth = 0)`

Prints the structure of a tree.

```javascript
printTree(node, depth = 0) {
    if (node.isTerminal) {
        console.log(`${'|  '.repeat(depth)}[Leaf] Predict: ${node.value}`);
    } else {
        console.log(`${'|  '.repeat(depth)}[X${node.index} < ${node.value}]`);
        this.printTree(node.left, depth + 1);
        this.printTree(node.right, depth + 1);
    }
}
```

Useful for understanding how the tree makes decisions and for debugging purposes.

#### 2.10.2 `convertToHierarchy(node, depth = 0)`

Converts a tree into a hierarchical structure for visualization.

```javascript
convertToHierarchy(node, depth = 0) {
    if (node.isTerminal) {
        return { name: `Leaf: ${node.value}` };
    }

    return {
        name: `X${node.index} < ${node.value}`,
        children: [
            this.convertToHierarchy(node.left, depth + 1),
            this.convertToHierarchy(node.right, depth + 1)
        ]
    };
}
```

This can be used with visualization libraries to create tree diagrams.

#### 2.10.3 `convertForestToHierarchy()`

Converts the entire forest into a hierarchical structure.

```javascript
convertForestToHierarchy() {
    return this.trees.map((tree, index) => ({
        name: `Tree ${index + 1}`,
        children: [this.convertToHierarchy(tree)]
    }));
}
```

Allows visualization of all trees in the forest, helping to bring order to the complexity.

#### 2.10.4 `getPaths(node, path = "")`

Retrieves all decision paths in a tree.

```javascript
getPaths(node, path = "") {
    if (node.isTerminal) {
        return [`${path}/Leaf: ${node.value}`];
    }

    const leftPaths = this.getPaths(node.left, `${path}/X${node.index} < ${node.value}`);
    const rightPaths = this.getPaths(node.right, `${path}/X${node.index} >= ${node.value}`);

    return [...leftPaths, ...rightPaths];
}
```

Provides a detailed view of all possible paths through the tree.

#### 2.10.5 `convertForestToPaths()`

Retrieves decision paths from all trees in the forest.

```javascript
convertForestToPaths() {
    let paths = [];
    this.trees.forEach((tree, index) => {
        const treePaths = this.getPaths(tree, `Tree ${index + 1}`);
        paths = [...paths, ...treePaths];
    });
    return paths;
}
```

Gives a comprehensive view of how the forest makes predictions.

### 2.11 Classification Domain Generation

Generates a grid of predictions over the feature space for visualization.

```javascript
generateClassificationDomain(scatterData, stepSize = 0.1) {
    const xMin = Math.min(...scatterData.map(d => d.x)) - 1;
    const xMax = Math.max(...scatterData.map(d => d.x)) + 1;
    const yMin = Math.min(...scatterData.map(d => d.y)) - 1;
    const yMax = Math.max(...scatterData.map(d => d.y)) + 1;

    const grid = [];
    const values = [];
    for (let x = xMin; x <= xMax; x += stepSize) {
        for (let y = yMin; y <= yMax; y += stepSize) {
            grid.push([x, y]);
            values.push(this.predict([[x, y]])[0]);
        }
    }

    const gridWidth = Math.round((xMax - xMin) / stepSize) + 1;
    const gridHeight = Math.round((yMax - yMin) / stepSize) + 1;
    const grid2D = Array.from({ length: gridHeight }, (_, i) => grid.slice(i * gridWidth, (i + 1) * gridWidth));
    const values2D = Array.from({ length: gridHeight }, (_, i) => values.slice(i * gridWidth, (i + 1) * gridWidth));

    return {
        gridPredictions: values,
        gridWidth: gridWidth,
        gridHeight: gridHeight,
        grid2D: grid2D,
        values2D: values2D
    };
}
```

**Parameters:**

- `scatterData`: An array of data points with `x` and `y` properties.
- `stepSize`: The resolution of the grid.

This method helps in visualizing the decision boundaries learned by the model. It creates a grid over the feature space and predicts the class for each point in the grid.

## 3. What's Next?

I absolutely love decision trees. They're interpretable, intuitive, and just plain cool.

I could implement a boosting approach, but I think I'll dip my toes into some neural networks. Besides, the recursive insanity with decision trees has given me an insane headache.
