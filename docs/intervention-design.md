---
title: Generic `BusinessModelBuilder`
toc: true
---

```js
// imports

import { TableInput, TableInputTypes, EVENTS, LiveTable, LiveTableData } from './components/LiveTable.js';

import { FunnelChart } from './components/FunnelChart.js';

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

// it's 'noisy' when we have so much CSS in the page
import { genericInterventionStyle } from "./components/styles.js"
const styleElement = html`<style>${genericInterventionStyle}</style>`;
document.head.appendChild(styleElement);
```

# Generic `BusinessModelBuilder` Introduction

This framework provides a structured way to create interactive business model visualizations that show relationships between parameters and derived metrics. It consists of two main components: a parameter input table and a visualization builder.

The system allows you to:
1. Define input parameters with units and distributions
2. Create formulas showing relationships between parameters
3. Calculate derived metrics
4. Visualize the business model in a structured format
5. Update visualizations reactively as parameters change

## Step 1: Create Parameter Table
First, define your parameters, their units, and distributions:

```javascript
// Define your parameters data
const parameterData = [
  {
    Parameter: "monthly_leads",    // Unique identifier
    Value: 1000,                  // Default value
    Units: "#",                   // Unit type (#, %, $)
    Distribution: "normal",       // Statistical distribution
    Parameters: '{"mean": 1000, "std": 100}',  // Distribution parameters
  },
  // Add more parameters...
];

// Create column definitions
const parameterColumns = [
  TableInputTypes.dropdown({
    width: 200,
    key: "Parameter",
    label: "Parameter",
    options: [
      { value: "monthly_leads", label: "Monthly Leads" },
      // Add more parameter options...
    ],
    defaultValue: "monthly_leads",
  }),
  // Standard columns for value, units, distribution
  TableInputTypes.float({
    width: 75,
    key: "Value",
    label: "Value",
    min: 0,
    step: 0.01,
  }),
  // ... other standard columns
];

// Create the LiveTable
const parameterTable = LiveTable(html, {
  columns: parameterColumns,
  initialData: parameterData,
  width: 700,
  description: "Enter model parameters",
  title: "Table: Model Inputs",
});

// Create reactive data stream
const parameterTableData = LiveTableData(parameterTable);
```

## Step 2: Create Business Model Visualization
Define your business model structure and calculations:

```javascript
function visualizationModel(currentData, html) {
  const builder = new BusinessModelBuilder(currentData, html);
  
  // Extract parameters
  const param1 = builder.getParameterInfo("parameter_name");
  
  // Calculate derived values
  const derivedValue = param1.value * someCalculation;
  
  return builder
    .addFormulaSection({
      title: "Main Metrics",
      formulas: [
        // Top formula (usually ROI or main metric)
        {
          topRow: true,
          result: {
            label: "Main Metric",
            value: mainValue,
            unit: "x",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Component 1",
              value: comp1Value,
              unit: "$",
              highlighted: true
            },
            // More components...
          ]
        },
        // Supporting formulas
        {
          gridPosition: [0, 0],  // Position in grid
          result: {
            label: "Derived 1",
            value: derived1,
            unit: "#",
            highlighted: true
          },
          operators: ["×"],
          components: [/* ... */]
        },
        // More formulas...
      ]
    })
    .addParametersSection({
      title: "Parameter Group 1",
      parameters: [
        { label: "Param 1", parameter: "parameter_name" },
        // More parameters...
      ]
    })
    .build();
}
```

## Step 3: Implement the Visualization
Connect everything together:

```javascript
// Create and view the table
view(parameterTable);

// Create and view the visualization
const visualizationOutput = visualizationModel(parameterTableData, html);
view(visualizationOutput);
```

## Key Components:

### Formula Structure
- **Top Row Formula**: Usually shows the main metric (ROI, profit, etc.)
- **Grid Formulas**: Show supporting calculations in a logical flow
- Each formula has:
  - Result (output)
  - Operators (×, -, /, etc.)
  - Components (inputs)
  - Highlighting (pink for derived, gray for inputs)

### Parameter Sections
- Group related parameters together
- Show current values with units
- Update automatically with table changes

### Best Practices:
1. Use clear, unique parameter names
2. Group related formulas and parameters logically
3. Maintain consistent units throughout calculations
4. Use highlighting to show value flow
5. Position formulas to show clear relationships

## Example Use Cases:
### Example 1: Belle Cares


```js
// Define distribution options
const distributionOptions = [
  { value: "normal", label: "Normal" },
  { value: "uniform", label: "Uniform" },
  { value: "exponential", label: "Exponential" },
  { value: "poisson", label: "Poisson" },
  { value: "binomial", label: "Binomial" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
  { value: "chisquare", label: "Chi-Square" },
  { value: "bernoulli", label: "Bernoulli" },
  { value: "geometric", label: "Geometric" },
  { value: "pareto", label: "Pareto" },
  { value: "lognormal", label: "Log-Normal" },
  { value: "weibull", label: "Weibull" },
  { value: "cauchy", label: "Cauchy" },
  { value: "multinomial", label: "Multinomial" },
];

// Updated initial data
const initialData = [
  {
    Parameter: "pop",
    Value: 156000,
    Units: "#",
    Distribution: "lognormal",
    Parameters: '{"sigma": 0.5, "scale": 150}',
  },
  {
    Parameter: "target_rate",
    Value: 25,
    Units: "%",
    Distribution: "lognormal",
    Parameters: '{"sigma": 0.7, "scale": 2500}',
  },
  {
    Parameter: "event_prevalence",
    Value: 7.74,
    Units: "%",
    Distribution: "normal",
    Parameters: '{"mean": 0.6, "std": 1200}',
  },
  {
    Parameter: "average_event_cost",
    Value: 30000,
    Units: "$",
    Distribution: "lognormal",
    Parameters: '{"sigma": 0.8, "scale": 800}',
  },
  {
    Parameter: "engagement_rate",
    Value: 35,
    Units: "%",
    Distribution: "lognormal",
    Parameters: '{"mean": 0.03, "shape": 0.29}',
  },
  {
    Parameter: "intervention_fee",
    Value: 130,
    Units: "$",
    Distribution: "uniform",
    Parameters: '{"min": 130, "max": 130}',
  },
  {
    Parameter: "treatments_per_year",
    Value: 6,
    Units: "#",
    Distribution: "beta",
    Parameters: '{"alpha": 75.4, "beta": 3.8}',
  },
  {
    Parameter: "incremental_effect",
    Value: 3,
    Units: "%",
    Distribution: "lognormal",
    Parameters: '{"mean": 0.3, "shape": 0.29}',
  },
];

// Updated columns
const columns = [
  TableInputTypes.dropdown({
    width: 200,
    key: "Parameter",
    label: "Parameter",
    options: [
      { value: "pop", label: "Population" },
      { value: "target_rate", label: "Target Rate" },
      { value: "event_prevalence", label: "Event Prevalence" },
      { value: "average_event_cost", label: "Average Event Cost" },
      { value: "engagement_rate", label: "Engagement Rate" },
      { value: "intervention_fee", label: "Intervention Fee" },
      { value: "treatments_per_year", label: "Treatments/Year" },
      { value: "incremental_effect", label: "Incremental Effect" },
    ],
    defaultValue: "pop",
  }),
  TableInputTypes.float({
    width: 75,
    key: "Value",
    label: "Value",
    min: 0,
    step: 0.01,
  }),
  TableInputTypes.dropdown({
    width: 75,
    key: "Units",
    label: "Units",
    options: [
      { value: "#", label: "#" },
      { value: "%", label: "%" },
      { value: "$", label: "$" },
    ],
    defaultValue: "#",
  }),
  TableInputTypes.dropdown({
    width: 100,
    key: "Distribution",
    label: "Distribution",
    options: distributionOptions,
    defaultValue: "lognormal",
  }),
  TableInputTypes.text({
    width: 160,
    key: "Parameters",
    label: "Parameters",
    parser: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    placeholder: "Enter as JSON",
    defaultValue: '{"sigma": 1, "scale": 1}',
  }),
];

// Updated LiveTable
const tableWithCustomStats = LiveTable(html, {
  columns,
  initialData,
  width: 700,
  description: "Enter parameter data for analysis",
  title: "Table: Parameter Inputs",
  updateStats: (data, container, html) => {
    const { parsed } = data;

    const totalValue = parsed.reduce((sum, row) => sum + parseFloat(row.Value || 0), 0);

    container.innerHTML = "";
    // container.appendChild(
    //   html`
    //     <div style="margin-top: 20px; padding: 15px; background: #f8fafc;">
    //       <h3 style="color: #2563eb; margin: 0 0 10px 0;">Summary Stats</h3>
    //       <div style="font-size: 1.5em; font-weight: bold;">
    //         Total Value: ${totalValue.toLocaleString()}
    //       </div>
    //     </div>
    //   `
    // );
  },
});

view(tableWithCustomStats);
```

```js
const livetabledata = LiveTableData(tableWithCustomStats)
```

```js
import { BusinessModelBuilder } from './components/BusinessModelBuilder.js';
```
```js
function visualizationGeneric(currentData, html) {
  const builder = new BusinessModelBuilder(currentData, html);
  
  // Extract parameters and calculate derived values (same as before)
  const pop = builder.getParameterInfo("pop");
  const targetRate = builder.getParameterInfo("target_rate");
  const engagementRate = builder.getParameterInfo("engagement_rate");
  const feePerTarget = builder.getParameterInfo("intervention_fee");
  const treatmentsPerYear = builder.getParameterInfo("treatments_per_year");
  const incrementalEffect = builder.getParameterInfo("incremental_effect");
  const eventPrevalence = builder.getParameterInfo("event_prevalence");
  const averageEventCost = builder.getParameterInfo("average_event_cost");

  // Calculate derived values
  const engagedPopulation = pop.value * targetRate.value/100 * engagementRate.value/100;
  const incrementalEvents = engagedPopulation * incrementalEffect.value/100;
  const incrementalBenefit = incrementalEvents * averageEventCost.value;
  const cost = engagedPopulation * feePerTarget.value * treatmentsPerYear.value;
  const roi = ((incrementalBenefit - cost) / cost) || 0;

  return builder
    .addFormulaSection({
      title: "Derived Business Model Parameters",
      formulas: [
        // Top row: ROI formula
        {
          topRow: true,
          result: {
            label: "ROI",
            value: roi,
            unit: "x",
            highlighted: true
          },
          operators: ["-", "/"],
          components: [
            {
              label: "Incr Ben",
              value: incrementalBenefit,
              unit: "$",
              highlighted: true
            },
            {
              label: "Cost",
              value: cost,
              unit: "$",
              highlighted: true
            },
            {
              label: "Cost",
              value: cost,
              unit: "$",
              highlighted: true
            }
          ]
        },
        // Bottom rows in order: Engd Pop, Inc Evnt, Inc Ben, Cost
        {
          gridPosition: [0, 0], // Bottom left
          result: {
            label: "Engd Pop",
            value: engagedPopulation,
            unit: "#",
            highlighted: true
          },
          operators: ["×", "×"],
          components: [
            {
              label: "Pop",
              value: pop.value,
              unit: pop.unit,
              highlighted: false
            },
            {
              label: "Tgt Rate",
              value: targetRate.value,
              unit: targetRate.unit,
              highlighted: false
            },
            {
              label: "Eng Rate",
              value: engagementRate.value,
              unit: engagementRate.unit,
              highlighted: false
            }
          ]
        },
        {
          gridPosition: [1, 0],
          result: {
            label: "Incr Evnt",
            value: incrementalEvents,
            unit: "#",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Engd Pop",
              value: engagedPopulation,
              unit: "#",
              highlighted: true
            },
            {
              label: "Incr Eff",
              value: incrementalEffect.value,
              unit: incrementalEffect.unit,
              highlighted: false
            }
          ]
        },
        {
          gridPosition: [2, 0],
          result: {
            label: "Incr Ben",
            value: incrementalBenefit,
            unit: "$",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Incr Evnt",
              value: incrementalEvents,
              unit: "#",
              highlighted: true
            },
            {
              label: "Avg Cost",
              value: averageEventCost.value,
              unit: averageEventCost.unit,
              highlighted: false
            }
          ]
        },
        {
          gridPosition: [3, 0],
          result: {
            label: "Cost",
            value: cost,
            unit: "$",
            highlighted: true
          },
          operators: ["×", "×"],
          components: [
            {
              label: "Tgt Pop",
              value: pop.value,
              unit: pop.unit,
              highlighted: true
            },
            {
              label: "Fee/Tgt",
              value: feePerTarget.value,
              unit: feePerTarget.unit,
              highlighted: false
            },
            {
              label: "Trtmt/yr",
              value: treatmentsPerYear.value,
              unit: treatmentsPerYear.unit,
              highlighted: false
            }
          ]
        }
      ]
    })
    .addParametersSection({
      title: "Fundamental Internal Distribution Parameters",
      parameters: [
        { label: "Eng Rate", parameter: "engagement_rate" },
        { label: "Fee/Tgt", parameter: "intervention_fee" },
        { label: "Trtmt/yr", parameter: "treatments_per_year" },
        { label: "Incr Eff", parameter: "incremental_effect" }
      ]
    })
    .addParametersSection({
      title: "Fundamental External Distribution Parameters",
      parameters: [
        { label: "Pop", parameter: "pop" },
        { label: "Tgt Rate", parameter: "target_rate" },
        { label: "Evt Prev", parameter: "event_prevalence" },
        { label: "Avg Cost", parameter: "average_event_cost" }
      ]
    })
    .build();
}

const visualizationGenericD = visualizationGeneric(livetabledata, html)
view(visualizationGenericD)
```

### Example 2: A sales Pipeline

```js
// Sales Pipeline Table Data
const salesPipelineData = [
  {
    Parameter: "monthly_leads",
    Value: 1000,
    Units: "#",
    Distribution: "normal",
    Parameters: '{"mean": 1000, "std": 100}',
  },
  {
    Parameter: "conversion_rate",
    Value: 15,
    Units: "%",
    Distribution: "beta",
    Parameters: '{"alpha": 2, "beta": 8}',
  },
  {
    Parameter: "avg_deal_size",
    Value: 5000,
    Units: "$",
    Distribution: "lognormal",
    Parameters: '{"sigma": 0.5, "scale": 5000}',
  },
  {
    Parameter: "sales_cycle",
    Value: 30,
    Units: "#",
    Distribution: "gamma",
    Parameters: '{"shape": 3, "scale": 10}',
  },
  {
    Parameter: "cost_per_lead",
    Value: 50,
    Units: "$",
    Distribution: "uniform",
    Parameters: '{"min": 40, "max": 60}',
  },
  {
    Parameter: "sales_salary",
    Value: 5000,
    Units: "$",
    Distribution: "normal",
    Parameters: '{"mean": 5000, "std": 500}',
  },
  {
    Parameter: "commission_rate",
    Value: 10,
    Units: "%",
    Distribution: "uniform",
    Parameters: '{"min": 8, "max": 12}',
  },
  {
    Parameter: "overhead_costs",
    Value: 2000,
    Units: "$",
    Distribution: "normal",
    Parameters: '{"mean": 2000, "std": 200}',
  },
];

const salesPipelineColumns = [
  TableInputTypes.dropdown({
    width: 200,
    key: "Parameter",
    label: "Parameter",
    options: [
      { value: "monthly_leads", label: "Monthly Leads" },
      { value: "conversion_rate", label: "Conversion Rate" },
      { value: "avg_deal_size", label: "Average Deal Size" },
      { value: "sales_cycle", label: "Sales Cycle Days" },
      { value: "cost_per_lead", label: "Cost per Lead" },
      { value: "sales_salary", label: "Sales Salary" },
      { value: "commission_rate", label: "Commission Rate" },
      { value: "overhead_costs", label: "Overhead Costs" },
    ],
    defaultValue: "monthly_leads",
  }),
  // Rest of columns same as original
  TableInputTypes.float({
    width: 75,
    key: "Value",
    label: "Value",
    min: 0,
    step: 0.01,
  }),
  TableInputTypes.dropdown({
    width: 75,
    key: "Units",
    label: "Units",
    options: [
      { value: "#", label: "#" },
      { value: "%", label: "%" },
      { value: "$", label: "$" },
    ],
    defaultValue: "#",
  }),
  TableInputTypes.dropdown({
    width: 100,
    key: "Distribution",
    label: "Distribution",
    options: distributionOptions,
    defaultValue: "normal",
  }),
  TableInputTypes.text({
    width: 160,
    key: "Parameters",
    label: "Parameters",
    parser: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    placeholder: "Enter as JSON",
    defaultValue: '{"mean": 0, "std": 1}',
  }),
];

const salesPipelineTable = LiveTable(html, {
  columns: salesPipelineColumns,
  initialData: salesPipelineData,
  width: 700,
  description: "Enter sales pipeline parameters",
  title: "Table: Sales Pipeline Inputs",
  updateStats: (data, container, html) => {
    const { parsed } = data;
    container.innerHTML = "";
  },
});

view(salesPipelineTable)
```
```js
const salesPipelineTableData = LiveTableData(salesPipelineTable);

```
```js
function visualizationSalesPipeline(currentData, html) {
  const builder = new BusinessModelBuilder(currentData, html);
  
  // Extract parameters
  const leads = builder.getParameterInfo("monthly_leads");
  const conversionRate = builder.getParameterInfo("conversion_rate");
  const avgDealSize = builder.getParameterInfo("avg_deal_size");
  const salesCycle = builder.getParameterInfo("sales_cycle");
  const costPerLead = builder.getParameterInfo("cost_per_lead");
  const salesSalary = builder.getParameterInfo("sales_salary");
  const commissionRate = builder.getParameterInfo("commission_rate");
  const overhead = builder.getParameterInfo("overhead_costs");

  // Calculate derived values
  const monthlyDeals = leads.value * conversionRate.value/100;
  const monthlyRevenue = monthlyDeals * avgDealSize.value;
  const acquisitionCosts = leads.value * costPerLead.value;
  const commissionCosts = monthlyRevenue * commissionRate.value/100;
  const totalCosts = acquisitionCosts + salesSalary.value + commissionCosts + overhead.value;
  const profit = monthlyRevenue - totalCosts;
  const roi = ((monthlyRevenue - totalCosts) / totalCosts) || 0;

  return builder
    .addFormulaSection({
      title: "Sales Pipeline Performance Metrics",
      formulas: [
        // Top row: ROI formula
        {
          topRow: true,
          result: {
            label: "ROI",
            value: roi,
            unit: "x",
            highlighted: true
          },
          operators: ["-", "/"],
          components: [
            {
              label: "Revenue",
              value: monthlyRevenue,
              unit: "$",
              highlighted: true
            },
            {
              label: "Costs",
              value: totalCosts,
              unit: "$",
              highlighted: true
            },
            {
              label: "Costs",
              value: totalCosts,
              unit: "$",
              highlighted: true
            }
          ]
        },
        // Bottom rows showing pipeline flow
        {
          gridPosition: [0, 0],
          result: {
            label: "Deals",
            value: monthlyDeals,
            unit: "#",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Leads",
              value: leads.value,
              unit: leads.unit,
              highlighted: false
            },
            {
              label: "Conv Rate",
              value: conversionRate.value,
              unit: conversionRate.unit,
              highlighted: false
            }
          ]
        },
        {
          gridPosition: [1, 0],
          result: {
            label: "Revenue",
            value: monthlyRevenue,
            unit: "$",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Deals",
              value: monthlyDeals,
              unit: "#",
              highlighted: true
            },
            {
              label: "Deal Size",
              value: avgDealSize.value,
              unit: avgDealSize.unit,
              highlighted: false
            }
          ]
        },
        {
          gridPosition: [2, 0],
          result: {
            label: "Acq Cost",
            value: acquisitionCosts,
            unit: "$",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Leads",
              value: leads.value,
              unit: leads.unit,
              highlighted: false
            },
            {
              label: "Cost/Lead",
              value: costPerLead.value,
              unit: costPerLead.unit,
              highlighted: false
            }
          ]
        },
        {
          gridPosition: [3, 0],
          result: {
            label: "Commission",
            value: commissionCosts,
            unit: "$",
            highlighted: true
          },
          operators: ["×"],
          components: [
            {
              label: "Revenue",
              value: monthlyRevenue,
              unit: "$",
              highlighted: true
            },
            {
              label: "Comm Rate",
              value: commissionRate.value,
              unit: commissionRate.unit,
              highlighted: false
            }
          ]
        }
      ]
    })
    .addParametersSection({
      title: "Sales Process Parameters",
      parameters: [
        { label: "Conv Rate", parameter: "conversion_rate" },
        { label: "Deal Size", parameter: "avg_deal_size" },
        { label: "Sale Cycle", parameter: "sales_cycle" },
        { label: "Comm Rate", parameter: "commission_rate" }
      ]
    })
    .addParametersSection({
      title: "Cost Structure Parameters",
      parameters: [
        { label: "Lead Cost", parameter: "cost_per_lead" },
        { label: "Salary", parameter: "sales_salary" },
        { label: "Overhead", parameter: "overhead_costs" },
        { label: "Leads", parameter: "monthly_leads" }
      ]
    })
    .build();
}

const visualizationSalesPipelineD = visualizationSalesPipeline(salesPipelineTableData, html);
view(visualizationSalesPipelineD);
```
