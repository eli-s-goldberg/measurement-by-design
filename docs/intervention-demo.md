---
toc: true
title: Intervention Demo
---
```js
// import some CSS to keep things well styled
import { defaultStyles } from "./components/styles.js"
const styleElement = html`<style>${defaultStyles}</style>`;
document.head.appendChild(styleElement);
``` 

```js
// import data gen and consts
import { generateHealthcareData, CONSTANTS, calculateImageUse } from './components/generateHealthcareData.js'
import {prepareImagingData, stratifiedSubsample, getRandomSubsample, computeMeanAndCI, computeROC} from "./components/ml-utils.js"
import { require } from "d3-require";
import { FunnelChart } from './components/FunnelChart.js';

import {createTreeWithStats, calculateStats, createFunnelData, formatNumber} from './components/TreeExplore.js'
import {
  createMulticlassMetric,
  createRateMetric,
  createDemographicMetrics,
  aggregateData, createDataSummary, createIntMetric, createFloatMetric
} from "./components/AggStats.js"
import { createSankeyFlow } from './components/SankeyFlow.js';
import { RandomForestClassifier } from "./components/RandomForestClassifier.js";
```


# Unveiling Insights in Imaging Utilization

A picture may be worth a thousand words, but it may also cost several thousand dollars—especially when imaging is done at non-preferred facilities. On the surface, imaging utilization across the book appears stable. However, when we dig deeper, we uncover a hidden inefficiency: a significant fraction of members seem to be bypassing preferred facilities, leading to higher costs and missed opportunities for clinical alignment.

Non-preferred imaging usage might seem like a minor issue, but its cumulative impact is substantial. For specific clinical groups, such as those with chronic conditions like COPD, this problem is amplified. These members often require frequent imaging, and when they consistently visit non-preferred centers, the financial burden grows while coordination of care suffers.

This isn't just a cost problem; it's a care problem. By understanding who is driving this non-preferred utilization and why, we can uncover actionable insights to redirect behavior, reduce inefficiencies, and improve outcomes.

--- 

## Digging deep: Doing _the right_ EDA. 

```js
// Generate a large dataset for analysis
const DATASETSIZE = 2100000
const data = generateHealthcareData(DATASETSIZE);
```

Here's the dataset we've asked our data scientists to pull. 

Dataset Description
- Total Book: ${DATASETSIZE.toLocaleString()} individuals.
- `ID`: Unique identifier (string)
- `Age`: Integer (18-95)
- `Gender`: Categorical (Male, Female, Other)
- `Region`: Categorical (Urban, Rural, Suburban)
- `PlanType`: Categorical (Medicare Advantage, Medicare Supplement, Dual Eligible Special Needs Plan, Chronic Condition Special Needs Plan, Institutional Special Needs Plan, Employer Group Waiver Plan, Programs of All-Inclusive Care for the Elderly)
- `Diagnosis`: Categorical (COPD, Diabetes, Hypertension, None)
- `PrimaryCareEngagement`: Binary (Yes, No)
- `SmokingStatus`: Binary (Smoker, Non-Smoker)
- `IncomeBracket`: Categorical (Low, Medium, High)
- `ImagingVisits`: Count (integer)
- `Non_Preferred_Imaging_Visits`: Count (integer).

### **EDA STEP 1: Create fundamental stats on the data** 

<figure>
<figcaption>
<strong> Table 1</strong>: Population Overview and Healthcare Patterns: This table summarizes key demographic attributes, health conditions, and utilization of healthcare services in an older population dataset.
</figcaption>

```js
// use dataset summarization
const summary = createDataSummary(data)

// Create headers dictionary
const headersDictSumm = summary.columns.reduce((acc, c) => {
  acc[c.field] = c.header;
  return acc;
}, {});

// Use with Inputs.table
const tableSummary = Inputs.table(summary.data, {
  columns: summary.columns.map(c => c.field),
  header: headersDictSumm, 
rows: 18, 
  maxWidth: 1000, 
  multiple: false, 
  layout: "auto" 
});

// Show table summary
view(tableSummary)
```

</figure>

```js
// Let's view it as a table
const rawData = Inputs.table(data, {
  width: {
    ID: 50,
    Age: 80,
    Gender: 75,
    Region: 100,
    PlanType: 100,
    Diagnosis: 100,
    PrimaryCareEngagement: 50,
    SmokingStatus: 100,
    IncomeBracket: 100,
    ImagingVisits: 50,
    Non_Preferred_Imaging_Visits: 50
  },
  // Column alignments
  align: {
    ID: "left",
    Age: "right",
    Gender: "center",
    Region: "center",
    PlanType: "left",
    Diagnosis: "center",
    PrimaryCareEngagement: "center",
    SmokingStatus: "center",
    IncomeBracket: "center",
    ImagingVisits: "right",
    Non_Preferred_Imaging_Visits: "right"
  },
  // Human-readable headers
  header: {
    ID: "Id",
    Age: "Age",
    Gender: "Sex",
    Region: "Region",
    PlanType: "Plan Type",
    Diagnosis: "Dx",
    PrimaryCareEngagement: "PCP",
     SmokingStatus: "Smoker",
    IncomeBracket: "Income",
    ImagingVisits: "Img. Visits",
    NonPreferredVisits: "Non-Pref. Img."
  },
  rows: 18, // Number of rows displayed at once
  maxWidth: 900, // Maximum width of the table
  multiple: false, // Single row selection
  layout: "auto" // Auto table layout
});

// view(rawData)

```

**Table 1** provides a comprehensive overview of a dataset focused on an older population, with balanced demographics across gender, region, and income. Most individuals are engaged with primary care, though a significant portion is not, which could indicate opportunities for targeted interventions. Smoking status and diagnoses suggest a mix of health behaviors and conditions, with a notable proportion of undiagnosed individuals. Healthcare visits, particularly imaging, show a skewed distribution, hinting at variations in healthcare utilization that warrant further analysis.

--- 
### **EDA STEP 2: Inspect the Overall Distributions** 

Let's take this exploratory data analysis step by step, starting by inspecting the overall distribution of non-preferred imaging. 

add: The average reported e.g., 22%. 

<figure>
<figcaption>
<strong> Figure 2</strong>: Non-preferred Imaging Overview: This figure shows the summarizes key demographic attributes, health conditions, and utilization of healthcare services in an older population dataset.
</figcaption>

```js
// let's do a bit of aggregating
const disttotals = {
  "Total Imaging": d3.sum(data, d => d.ImagingVisits),
  "Non-Preferred": d3.sum(data, d => d.NonPreferredVisits)
};

// Create data array for plotting
const plotDistData = Object.entries(disttotals).map(([key, value]) => ({
  category: key,
  value: value
}));

// Updated plot with scaling
view(Plot.plot({
  marginLeft: 90,
  height: 100,
  x: {
    label: "Number of Visits (Millions)",
    transform: d => d / 1000000
  },
  y: {
    label: null
  },
  color: {
    range: ["#FFB600", "#D04A02"],
    // legend: true
  },
  marks: [
    Plot.barX(plotDistData, {
      x: "value", 
      y: "category",
      fill: "category",
      sort: {y: "-x"}
    }),
    Plot.ruleX([0]),
    Plot.text(plotDistData, {
      x: "value",
      y: "category", 
      text: d => formatNumber(d.value, 'millions'),
      textAnchor: 'end', 
      dx: -4,
      fill: d => d.category === "Total Imaging" ? "white" : "black",
      font: "bold 12px sans-serif"
    })
  ]
}))

const frac_non_pref_of_total = (disttotals["Non-Preferred"]/disttotals["Total Imaging"]*100).toFixed(2)
```

</figure>

**Insight**: Non-preferred imaging* visits make up **${frac_non_pref_of_total}%** of all imaging events. 

Well. That seems _fairly_ normal. Let's dive in a bit deeper by subsetting by plan type, region, whether or not they're engaged in primary care, smoking status, and income bracket. 

--- 

### **EDA STEP 3: Look for patterns in the data** 

Let's take a look to see if we can make some basic cuts of the data and observe any patterns. 

**Figure 3** shows the percentage of non-preferred imaging visits for different health conditions (COPD, Diabetes, Hypertension, None) categorized by the dimension of choice (e.g.,  plan type, region, whether or not they're engaged in primary care, smoking status, and income bracket).

<figure>
<figcaption>
<strong> Figure 3</strong>: Distribution of Visit Percentages by plan type, region, whether or not they're engaged in primary care, smoking status, and income bracket.
</figcaption>

```js
// set dimensions for dropdown. 
const DIMENSIONS = [
  { value: "PlanType", label: "Plan Type" },
  { value: "Region", label: "Region" },
  { value: "PrimaryCareEngagement", label: "Primary Care Engagement" },
  { value: "SmokingStatus", label: "Smoking Status" },
  { value: "IncomeBracket", label: "Income Bracket" }
];

// Create the dimension selector
const selectedDimension = view(
  Inputs.select(DIMENSIONS, {
    label: "Select Dimension",
    format: (d) => d.label, // Display the label in the dropdown
    value: DIMENSIONS[0] // Default to first option
  })
);
```

```js
// Generate data based on selection
const imageUseData = calculateImageUse(data, selectedDimension.value)

// plot it
view(Plot.plot({
 marginLeft: 10,
 marginRight: 80,
 x: {
   label: "Percentage of Visits",
   grid: false,
   nice: true
 },
 y: {
   label: null,
   nice: true
 },
 color: {
   range: ["#FFB600", "#D04A02"],
   legend: true
 },
 facet: {
   data: imageUseData,
   marginRight: 30,
   x: selectedDimension.value,
   y: "diagnosis",
   label: "",
   labelAnchor: 'middle',

 },
 marks: [
   Plot.barX(imageUseData, {
     x: "value",
     y: "planType",
     fill: "category",
     sort: {y: "-x"},
     fx: selectedDimension.value,
     fy: "diagnosis"
   }),
   Plot.ruleX([0]),
   // Non-preferred text
   Plot.text(imageUseData.filter(d => d.category === "Non-Preferred"), {
     x: d => 100 - d.value,
     y: "planType",
     text: d => `${d.value.toFixed(1)}%`,
     textAnchor: "end",
     dx: -2,
     fill: "white",
     font: "bold 10px sans-serif",
    fx:selectedDimension.value,
     fy: "diagnosis"
   })
 ]
}))
```
</figure>



**Insights**: 
- Across all plan types, income brackets, smoking status, members with COPD seem to be driving more non-preferred imaging utilization. 
    - <strong>${copd_membership}</strong> members are diagnosed with COPD (${copd_frac} of ${total_membership}).
    - Among these, <strong> ${copd_non_pref_to_total_imaging_visits} </strong>  (${copd_non_pref_imaging_membership} unique members) visit non-preferred imaging centers.


- Rural members drive more non-preferred imaging utilization than suburban and Urban regions, with members with COPD driving ~3x more non-preferred imaging utilization than diabetes, hypertension, and those without a chronic condition. 
- Members without primary care engagement are ~2x as likely to drive non-preferred imaging utilization than those with a primary care physician. 
- Smoking status and income bracket do appear to be a significant factor in non-preferred imaging utilization. 


--- 

### **STEP 4: Employ a hierarchical grouping to explore arbitrary nested levels of aggregation across key parameters** 


```js
// members with copd (calc)
const copd_membership = data.filter((d)=>d.Diagnosis === 'COPD').length

const copd_non_pref_imaging = data
.filter((d) => d.Diagnosis === 'COPD')
.map((d) => d.NonPreferredVisits)
.reduce((acc, val) => acc + val, 0);

const copd_non_pref_imaging_membership = data.filter((d) => d.Diagnosis === 'COPD' && d.NonPreferredVisits > 0).length


const copd_total_imaging = data
.filter((d) => d.Diagnosis === 'COPD')
.map((d) => d.ImagingVisits)
.reduce((acc, val) => acc + val, 0);

const total_membership = data.length
const copd_frac = `${(copd_membership/total_membership*100).toFixed(2)}%`
const copd_non_pref_to_total_imaging_visits = `${(copd_non_pref_imaging/copd_total_imaging*100).toFixed(2)}%`
```


```js

const rural_membership = data.filter((d)=>d.Region === 'Rural').length 

const rural_membership_fraction_display = `${(rural_membership/total_membership*100).toFixed(2)}%`
const rural_membership_fraction = rural_membership/total_membership*100

const rural_COPD_membership = data
.filter((d) => d.Diagnosis === 'COPD' && d.Region === 'Rural').length

const rural_COPD_membership_fraction = rural_COPD_membership/total_membership

const rural_membership_non_pref = data.filter((d)=>d.Region === 'Rural'
    && d.NonPreferredVisits > 0).length 
const rural_membership_non_pref_fraction = rural_membership_non_pref/total_membership

const rural_membership_non_pref_COPD = data.filter((d)=>d.Region === 'Rural'
        && d.Diagnosis === 'COPD' && d.NonPreferredVisits > 0).length 
const rural_membership_non_pref_COPD_fraction = rural_membership_non_pref_COPD/total_membership

const rural_imaging_total = data.filter((d)=>d.Region === 'Rural')
.map((d) => d.ImagingVisits).reduce((acc, val) => acc + val, 0);

const rural_imaging_total_non_pref = data.filter((d)=>d.Region === 'Rural')
.map((d) => d.NonPreferredVisits).reduce((acc, val) => acc + val, 0);

const rural_copd_total_imaging = data
.filter((d) => d.Diagnosis === 'COPD' && d.Region === 'Rural')
.map((d) => d.ImagingVisits)
.reduce((acc, val) => acc + val, 0);

const rural_copd_total_imaging_non_pref = data
.filter((d) => d.Diagnosis === 'COPD' && d.Region === 'Rural')
.map((d) => d.NonPreferredVisits)
.reduce((acc, val) => acc + val, 0);

const funnel_data = [
{ 
    group: "Total Membership", 
    value: total_membership/total_membership*100,
    altValue: `${total_membership} members`
},
{ 
    group: "Rural Membership", 
    value: Number(rural_membership_fraction).toFixed(2),
    altValue: `${rural_membership} members`
},
{ 
    group: "Rural Membership with COPD", 
    value: Number(rural_COPD_membership_fraction*100).toFixed(2),
    altValue: `${rural_COPD_membership} members`
},
{ 
    group: "Rural Membership with COPD that drive non-preferred ", 
    value: Number(rural_membership_non_pref_COPD_fraction*100).toFixed(2),
    altValue: `${rural_membership_non_pref_COPD} members` 
}
];
```


The picture is getting _clearer_. However, let's div a bit deeper still and create a hierarchical grouping to explore arbitrary nested levels of aggregation across key parameters. This systematic approach allows us to uncover patterns or trends that might not be apparent in flat groupings. For non-preferred imaging utilization, hierarchical grouping could shed light on factors influencing usage patterns at multiple levels of granularity.


The order you select the checkboxes will alter the hierarchical filtering. 

```js
const columnMap = {
    'Region': 'Region',
    'PlanType': 'PlanType',
    'Diagnosis': 'Diagnosis',
    'SmokingStatus': 'SmokingStatus',
    'Gender': 'Gender',
    'IncomeBracket': 'IncomeBracket',
    'PrimaryCareEngagement': 'PrimaryCareEngagement'
};
const columnOrder = view(Inputs.checkbox(Object.keys(columnMap), 
{label: "Multi-Select", value: ['Region', 'PlanType', 'Diagnosis', 'SmokingStatus']}));
```



Your selection order: ${Array.from(columnOrder).join(', ')}
```js

// Usage

const stroke_width_divisor = 50000
const combinedViz = createTreeWithStats(data, columnOrder,columnMap, stroke_width_divisor);
view(combinedViz);
```



```js
// Define dimensions
const dimensions = ["Region","PlanType","Diagnosis","SmokingStatus"]

// Create Custom
const metrics = [
  ...createMulticlassMetric("Gender", ["Female", "Male"], {
    includeRates: true
  }),
  ...createRateMetric("PrimaryCareEngagement", 
    row => row.PrimaryCareEngagement === "Yes", 
    { header: "PCP Engagement Rate" }
  ),
  ...createMulticlassMetric("PrimaryCareEngagement", 
    ["Yes", "No"],
    { header: "PCP Engagement" }
  ),
    ...createIntMetric("ImagingVisits", 
    { header: "Imaging Visits", precision: 1, weightedAverage: false, aggregation: 'sum' }
  ), 
  ...createFloatMetric('Age', {
    header: 'Average Age',
    aggregation: 'average',
    precision: 1,
  })
]

// Get results
const results = aggregateData(data, dimensions, metrics)

const headersDict = results.columns.reduce((acc, c) => {
  acc[c.id] = c.name;
  return acc;
}, {});


const table = Inputs.table(results.data, {
  columns: results.columns.map(c => c.id), 
  header: headersDict, 
      rows: 18, // Number of rows displayed at once
  maxWidth: 1000, // Maximum width of the table
  multiple: false, // Single row selection
  layout: "auto" // Auto table layout
});

view(table);
```

## Hypothesis and Recommended Actions

### Hypothesis
1. **Clinical Opportunity**:
   - COPD patients aged 55+ are likely receiving imaging at non-preferred locations due to **lower primary care engagement** or limited local options.  

2. **Demographic Insight**:
   - Rural geography and low-income brackets amplify the problem, suggesting potential **accessibility barriers** or misinformation.
   
### Recommended Actions

1. Target COPD patients in rural areas with specific outreach to **improve primary care engagement**.  
2. Launch campaigns in rural geographies to incentivize the use of preferred imaging centers (e.g., transport support, cost offsets).  
3. Create educational materials for members 55+ on the benefits of preferred imaging.  


## Experimentation

Now that we know where the opportunity lays, let's run an experiment to evaluate three design variations: a control (A), an alternative (AA), and an intervention (B). The goal is to measure user preference and identify the most effective design. To ensure valid results, the experiment must be properly sized, considering statistical power and expected effect sizes, to minimize risks of false positives or negatives.

After sizing and conducting the experiment, the results are summarized in the figure. The outcomes indicate the distribution of user preferences ("Preferred" vs. "Non-Preferred") for each design. This data provides actionable insights into how the designs perform relative to each other, guiding decision-making for future implementations.


<figure>
<figcaption> <strong> Figure X</strong>: This figure illustrates the outcomes of an A/B/A test comparing the "control" (A), an alternative design (AA), and an intervention design (B). The figure shows the distribution of participants between "Preferred" and "Non-Preferred" outcomes for each design, along with their respective percentages. Key observations include:


</figcaption>

```js
const sankeydata = {
  root: {
    "copd control": {  // Group without intervention
      "a": { preferred: 300, non_preferred: 198 },
    },
    "COPD intervention": {  // Group with intervention
      "b": { preferred: 280, non_preferred: 218 },
      "bb": { preferred: 390, non_preferred: 172 }

    }
  }
};

const config = {
  width: 800,
  height: 300,
  particleSize: 6,
  particleSpeed: 5,
  particleSpawnRate: 0.4,
  particleVerticalSpread: 0.8,
  hideRootLabel: true,
  counterSpacing: 100,
  nodePadding: 30,
  margin: { top: 20, right: 250, bottom: 20, left: 40 },
  bucketColors: {
    'preferred': '#FFB600',
    'non_preferred': '#D04A02'
  }
};

const replay = view(Inputs.button("Replay"));
const { node, replay: replayFn } = createSankeyFlow(sankeydata, config);
view(node);
```
```js
replay; // This will trigger the replay when the button is clicked
replayFn();

```
</figure>

## Target everyone or make a model 

```js
// introduce training model loop
function trainModel(data, params) {
  const { X, y, featureNames } = prepareImagingData(data);
  const clf = new RandomForestClassifier({
    nEstimators: params.nEstimators,
    maxDepth: params.maxDepth,
    minSize: params.minSize,
    sampleSize: params.sampleSize,
    maxFeatures: params.maxFeatures,
    decimalPrecision: params.decimalPrecision
  });

  clf.fit(X, y);
  const yPred = clf.predict(X);
  const proba = clf.predictProba(X);
  const confusionMatrix = clf.confusionMatrix(y, yPred);
  const labels = confusionMatrix.labels;
  const accuracy = clf.round(clf.accuracyScore(y, yPred));
  const recall = clf.round(clf.recallScore(y, yPred));
  const precision = clf.round(clf.precisionScore(y, yPred));

  const confusionData = [];
  for (let i = 0; i < labels.length; i++) {
  for (let j = 0; j < labels.length; j++) {
    confusionData.push({
      true_label: labels[i],
      predicted_label: labels[j],
      count: confusionMatrix.matrix[i][j]
    });
    }
    }

    // confusion matrix plot
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

    // AUC plot w/ roc curve

    // 1. Get probability estimates

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


  return {
    clf, X, y, yPred, proba, featureNames,
    metrics: {
      accuracy,
      recall, 
      precision,
      confusionMatrix
    }, 
    plot: {confusionPlot: confusionPlot, rocPlot: rocPlot}
  };
}
```

```js
function trainMultiModel(data, rfParamsForm_Selections) {
    const headers = ['Region', 'planType', 'Gender', 'PrimaryCareEngagement'];
    const sampleSize = 100;
    const RUNS = 5;

    const mlresults = Array.from({ length: RUNS }, () => {
        const subsampledData = stratifiedSubsample(data, headers, sampleSize);
        return trainModel(subsampledData, rfParamsForm_Selections);
    });

    const aucValues = mlresults.map(r => r.metrics.auc).filter(Boolean);
    const aucStats = computeMeanAndCI(aucValues);

    // Generate confusion matrix
    const avgConfusionMatrix = mlresults.reduce((acc, result, idx) => {
        const matrix = result.metrics.confusionMatrix.matrix;
        const matrixTotal = matrix.flat().reduce((sum, val) => sum + val, 0);
        const normalizedMatrix = matrix.map(row => row.map(val => val / matrixTotal));
        return idx === 0 ? normalizedMatrix : 
            acc.map((row, i) => row.map((val, j) => val + normalizedMatrix[i][j]));
    }, null).map(row => row.map(val => (val / RUNS) * 100));

    const labels = ['Preferred', 'Non Preferred'];
    const avgConfusionData = avgConfusionMatrix.flatMap((row, trueIndex) => 
        row.map((percent, predictedIndex) => ({
            true_label: labels[trueIndex],
            predicted_label: labels[predictedIndex],
            percent: parseFloat(percent.toFixed(2))
        }))
    );

    // Generate aggregate ROC curves
    const fprPoints = Array.from({length: 100}, (_, i) => i / 99);
    const aggregatedROC = fprPoints.map(targetFpr => {
        const tprValues = mlresults.map(result => {
            const yScores = result.proba.map(probs => probs[1]);
            const yTrue = result.y.map(label => Number(label));
            const { fpr, tpr } = computeROC(yTrue, yScores, 1);
            
            // Find closest FPR point and interpolate TPR
            const idx = fpr.findIndex(x => x >= targetFpr);
            if (idx === -1) return 1;
            if (idx === 0) return tpr[0];
            
            const x1 = fpr[idx - 1];
            const x2 = fpr[idx];
            const y1 = tpr[idx - 1];
            const y2 = tpr[idx];
            return y1 + (y2 - y1) * (targetFpr - x1) / (x2 - x1);
        });

        const meanTpr = d3.mean(tprValues);
        const sortedTpr = [...tprValues].sort(d3.ascending);
        const ciLow = sortedTpr[Math.floor(0.025 * sortedTpr.length)];
        const ciHigh = sortedTpr[Math.ceil(0.975 * sortedTpr.length) - 1];

        return {
            fpr: targetFpr,
            tpr: meanTpr,
            ciLow,
            ciHigh
        };
    });

    // Create plots
    const avgConfusionPlot = Plot.plot({
        height: 300,
        width: 400,
        marginLeft: 100,
        marginRight: 40,
        inset: 10,
        marginTop: 50,
        padding: 0.1,
        grid: true,
        x: {
            label: "Predicted Label",
            domain: labels,
            tickFormat: d => d
        },
        y: {
            label: "True Label",
            domain: labels,
            tickFormat: d => d
        },
        color: {
            scheme: "Reds",
            label: "Average %"
        },
        marks: [
            Plot.cell(avgConfusionData, {
                x: "predicted_label",
                y: "true_label",
                fill: "percent",
                inset: 0.5,
                title: d => `True: ${d.true_label}\nPredicted: ${d.predicted_label}\n${d.percent}%`
            }),
            Plot.text(avgConfusionData, {
                x: "predicted_label",
                y: "true_label",
                text: d => `${d.percent}%`,
                fill: "white",
                textAnchor: "middle",
                fontSize: 12
            })
        ]
    });

    const rocPlot = Plot.plot({
        width: 500,
        height: 500,
        x: {
            label: "False Positive Rate",
            domain: [0, 1]
        },
        y: {
            label: "True Positive Rate",
            domain: [0, 1]
        },
        marks: [
            Plot.line(aggregatedROC, {
                x: "fpr",
                y: "tpr",
                stroke: "steelblue",
                strokeWidth: 2
            }),
            Plot.areaY(aggregatedROC, {
                x: "fpr",
                y1: "ciLow",
                y2: "ciHigh",
                fill: "steelblue",
                fillOpacity: 0.3
            }),
            Plot.ruleY([0, 1], {
                x: [0, 1],
                stroke: "gray",
                strokeDasharray: "2,2"
            })
        ]
    });


    return {
        mlresults,
        metrics: { aucStats, avgConfusionData },
        plot: { confusionPlot: avgConfusionPlot, 
        // rocPlot: rocPlot 
        }
    };
}

```

```js
const rfParamsForm = Inputs.form({
  nEstimators: Inputs.range([1, 200], {
    value: 5,
    step: 1,
    label: html`<b>nEstimators</b>`,
    disabled: true
  }),
  maxDepth: Inputs.range([1, 10], {
    value: 4,
    step: 1,
    label: html`<b>maxDepth</b>`,
    disabled: true
  }),
  minSize: Inputs.range([1, 10], {
    value: 2,
    step: 1,
    label: html`<b>minSize</b>`,
    disabled: true
  }),
  sampleSize: Inputs.range([0.1, 1.0], {
    value: 0.8,
    step: 0.1,
    label: html`<b>sampleSize</b>`,
    disabled: true
  }),
  maxFeatures: Inputs.range([1, 10], {
    value: 3,
    step: 1,
    label: html`<b>maxFeatures</b>`,
    disabled: true
  }),
  decimalPrecision: Inputs.range([1, 5], {
    value: 2,
    step: 1,
    label: html`<b>decimalPrecision</b>`,
    disabled: true
  })
});
// view(rfParamsForm)
const rfParamsForm_Selections = Generators.input(rfParamsForm)
```
 
```js
// Create train button
const trainButton = view(Inputs.button("Train Model"));
// Training sequence generator
```
```js
trainButton; // Run when button clicked
const modelResults = Generators.observe((next) => {
  if (trainButton) {
    next( trainMultiModel(data, rfParamsForm_Selections));
  } else {
    next("click to train");
  }
  return () => {};
}, trainButton);
```


```js
view(modelResults.plot.confusionPlot)
view(modelResults.plot.rocPlot)
```



