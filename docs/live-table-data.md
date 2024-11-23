---
title: Table Input Experiment
toc: true
---

```js
// imports

import { TableInput, TableInputTypes, EVENTS, LiveTable, LiveTableData } from './components/LiveTable.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

// it's 'noisy' when we have so much CSS in the page
import { defaultStyles } from "./components/styles.js"
const styleElement = html`<style>${defaultStyles}</style>`;
document.head.appendChild(styleElement);
```

# Introducing `LiveTable`. A live, editible, observable table. 

I've decided to do a bit of enhancement to observables default tables to make them live, responsive, and editable. I've also tried to do in an an 'observable~ish' manner, making things useful and generic and making the actual calls pretty simple. I did this because I didn't like the way I originally implemented my mass balance business model tables. It looked all weird like. 

Let's start out seeing what the table and output looks like. 

```js
view(tableWithCustomStats)
```

Here's the object. Watch! If you change the table, it'll change this object. 
```js
view(livetabledata)
```



## `LiveTable`

There are three components to making live, responsive, and editable tables: 
1. `LiveTable`, the function to create the table.
2. `TableInputTypes`, which are primatives that can be used to create entry types by column. 
3. `LiveTableData`, which is how you use the data in the table downstream. 
The table itself consists of a few components. Note that `html` is passed as an argument. 

The `LiveTable` function takes a few arguments: 
- `columns`: an array of primatives that describe the column entries. 
- `initialData`: an array of dictionaries that set the initial value of the table. 
- `description`: a string that describes the table in small italics below the table.
- `title`: a string that descrtibes the title. 
- `updateStats`: a generic function that can return some convenient aggregations with styling. 
- `width`: provide the width of the table. 

Here's an example. 

```javascript
const table = LiveTable(html, {
  columns,
  initialData,
  description: "Enter cost information for each site of care",
  title: 'Title: hello table', 
  updateStats: (data, container, html) => {
    const { parsed } = data;
    const totalCost = parsed.reduce((sum, row) => 
      sum + (parseFloat(row.totalNumber) * parseFloat(row.averageCost)), 0);
    
    container.innerHTML = '';
    container.appendChild(html`
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc;">
        <h3 style="color: #2563eb; margin: 0 0 10px 0;">Quick Stats</h3>
        <div style="font-size: 1.5em; font-weight: bold;">
          Total Cost: $${totalCost.toLocaleString()}
        </div>
      </div>
    `);
  }
})

view(table)
```

Cool. This will make a bit more sense when we put all the things together, but let's keep going. 

## `TableInputTypes`
There are a few input type primitives that I've coded. They are as follows. 

1. [Integer Input Type](#integer-input-type)
2. [Float Input Type](#float-input-type)
3. [Dropdown Input Type](#dropdown-input-type)
4. [Text Input Type](#text-input-type)
5. [Function Input Type](#function-input-type)
6. [Percentage Input Type](#percentage-input-type)


### Integer Input Type
The `integer` input type lets you create a table column that accepts ... check this out... _integers_. Perfect for when you need to count sheep, votes, or the number of times you've regretted your life choices.

Here's how you include the `integer` input type in your column definitions:

```javascript
TableInputTypes.integer({
  width: 50,
  key: 'count',
  label: 'Count',
  min: 0,
  max: 100,
  defaultValue: 10
})
```

- **width**: *(Number)* The pixel width of the column. Because size _does_ matter.
- **key**: *(String)* The unique identifier for this column. Think of it as the column's social security number.
- **label**: *(String)* The display name for the column header. Make it human readable.
- **min**: *(Number, optional)* The minimum acceptable value. 
- **max**: *(Number, optional)* The maximum acceptable value. 
- **defaultValue**: *(Number, optional)* The default value when a new row is added. Defaults to an empty string if you can't make up your mind.

---

### Float Input Type

For those moments when integers are just too...integer-ish. The `float` input type allows for decimal numbers, giving you the precision you never knew you wanted.

Include the `float` input type like so:

```javascript
TableInputTypes.float({
  width: 60,
  key: 'value',
  label: 'Value',
  min: 0.0,
  max: 100.0,
  step: 0.5,
  defaultValue: 0.0
})
```

- **width**: *(Number)* Column width in pixels. Again, because aesthetics.
- **key**: *(String)* Unique identifier for the column. 
- **label**: *(String)* What shows up in the header. Make it sound important.
- **min**: *(Number, optional)* Minimum value allowed. Floor's the limit.
- **max**: *(Number, optional)* Maximum value allowed. Sky's the limit, or like, whatever number you set.
- **step**: *(Number, optional)* The interval between valid values. 
- **defaultValue**: *(Number, optional)* Default value for new rows. Defaults to an empty string.

---

### Dropdown Input Type

Choices, choices. The `dropdown` input type lets you restrict input to predefined options. It's like democracy, except you can pick good candidates and it works. Oh no, I've just made myself sad. 

Here's how you set up a dropdown:

```javascript
TableInputTypes.dropdown({
  width: 80,
  key: 'type',
  label: 'Type',
  options: [
    { value: 'a', label: 'Type A' },
    { value: 'b', label: 'Type B' },
    { value: 'c', label: 'Type C' }
  ],
  defaultValue: 'a'
})
```

- **width**: *(Number)* Width in pixels.
- **key**: *(String)* The unique key for the column. The 'type' of your 'type', if you will.
- **label**: *(String)* Column header label. Make it count.
- **options**: *(Array of Objects)* The choices you're allowing. Each object should have:
  - **value**: *(String)* The actual value behind the option.
  - **label**: *(String)* What the user sees. Smoke and mirrors.
- **defaultValue**: *(String, optional)* The default selected value. Defaults to an empty string, leaving users in suspense.

---

### Text Input Type

For when you want to let users type whatever they want. Risky move, but sometimes necessary. The `text` input type accepts any string, including those emoji-filled responses from more expressive users.

Include a text input like this:

```javascript
TableInputTypes.text({
  width: 150,
  key: 'description',
  label: 'Description',
  placeholder: 'Enter details here...',
  defaultValue: '',
  parser: null
})
```

- **width**: *(Number)* Width in pixels. Because words can be long and I haven't implemented text wrapping, yet. 
- **key**: *(String)* Unique identifier. Name it wisely.
- **label**: *(String)* Header label. Make it alluring.
- **placeholder**: *(String, optional)* The greyed-out hint text. Because users need guidance.
- **defaultValue**: *(String, optional)* Default text for new rows. Defaults to an empty string, encouraging creativity.
- **parser**: *(Function, optional)* A function to parse the input value. Use it when you don't trust user input (always).

---

### Function Input Type

Let users input function names. Because letting users execute code indirectly is totally safe and not at all terrifying.

Here's how you set up a function input:

```javascript
TableInputTypes.function({
  width: 100,
  key: 'callback',
  label: 'Callback Function',
  validator: (funcName) => {
    if (typeof window[funcName] !== 'function') {
      alert('Function does not exist!');
    }
  }
})
```

- **width**: *(Number)* Width in pixels. Keep it tight; function names shouldn't be essays.
- **key**: *(String)* Unique key for the column. 'callback' sounds professional.
- **label**: *(String)* What the users see. Keep them intrigued.
- **validator**: *(Function, optional)* A function to validate the input. Because we can't have users running amok.

---

### Percentage Input Type

When you need numbers between 0 and 100. Perfect for grades, battery levels, or the chance of you understanding this code with Claude or GPT mommy. 

Include a percentage input like so:

```javascript
TableInputTypes.percentage({
  width: 70,
  key: 'completion',
  label: 'Completion (%)',
  defaultValue: '0'
})
```

- **width**: *(Number)* Column width in pixels. 
- **key**: *(String)* The unique identifier. 'completion' has a nice ring to it.
- **label**: *(String)* Column header label. 
- **defaultValue**: *(String, optional)* Default value for new rows. Defaults to '0' because that's the responsible thing to do.

---

### Bonus: Custom Parsers

Wait, there's more! You can add a `parser` function to any input type if you feel like being fancy. Useful for when users input JSON strings, and you want to parse them into objects because dealing with strings is so last year. This is good if you want to input dictionaries with parameters. Those parameters in that dict will then be parsed correctly in the `parsedData()` output.  

```javascript
TableInputTypes.text({
  width: 200,
  key: 'parameters',
  label: 'Parameters',
  parser: (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
})
```

- **parser**: *(Function, optional)* A function that takes the input value and returns the parsed value. Perfect for turning that stringified JSON into an actual object.

## `LiveTableData`
Due to how reactivity works in observable or javascript (I'm not exactly sure), getting objects to update requires `generator` functions. Admittidly, I have _no_ idea really how these things are supposed to work and I only mamaged to stumble through it with a lot of LLM assistance. 

However, you don't have to worry about it, because I've buried it all in the code. Note that in framework, you need to seperate the generate from the viewing to make it work properly. 

```javascript
const data = LiveTableData(table)
```
```javascript
view(data)
```



## An example

You've made it this far. Awesome sauce. Here's an example pulled directly from the mass balance business case page. 

```javascript
// Define care site options
const careSiteOptions = [
  { value: "ABL", label: "Ambulance" },
  { value: "ASC", label: "Ambulatory Surgical Center" },
  { value: "CCF", label: "Custodial Care Facility" },
  { value: "ETF", label: "ESRD Treatment Facility" },
  { value: "EMR", label: "Emergency Room" },
  { value: "HOM", label: "Home" },
  { value: "HOS", label: "Hospice" },
  { value: "ILB", label: "Independent Laboratory" },
  { value: "IPH", label: "Inpatient Hospital" },
  { value: "IPF", label: "Inpatient Psychiatric Facility" },
  { value: "NUF", label: "Nursing Facility" },
  { value: "OFF", label: "Office" },
  { value: "OTH", label: "Other" },
  { value: "OPH", label: "Outpatient Hospital" },
  { value: "RHC", label: "Public/Rural Health Clinic" },
  { value: "SNF", label: "Skilled Nursing Facility" },
  { value: "UCF", label: "Urgent Care Facility" }
];

// Define distribution options
const distributionOptions = [
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
  { value: "multinomial", label: "Multinomial" }
];

// Define initial data
const initialData = [
  {
    siteOfCare: 'asd',
    totalNumber: '1000',
    averageCost: '150.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.5, "scale": 150}',
    immoveableFraction: '20'
  },
  {
    siteOfCare: 'IPH',
    totalNumber: '500',
    averageCost: '2500.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.7, "scale": 2500}',
    immoveableFraction: '80'
  },
  {
    siteOfCare: 'ASC',
    totalNumber: '750',
    averageCost: '1200.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.6, "scale": 1200}',
    immoveableFraction: '50'
  },
  {
    siteOfCare: 'EMR',
    totalNumber: '250',
    averageCost: '800.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.8, "scale": 800}',
    immoveableFraction: '90'
  }
];

// Define columns
const columns = [
  TableInputTypes.dropdown({
    width: 200,
    key: 'siteOfCare',
    label: 'Site of Care',
    options: careSiteOptions,
    defaultValue: 'OFF'
  }),
  TableInputTypes.integer({
    width: 100,
    key: 'totalNumber',
    label: 'Total Number (#)',
    min: 0
  }),
  TableInputTypes.float({
    width: 120,
    key: 'averageCost',
    label: 'Average Cost ($)',
    min: 0,
    step: 0.01
  }),
  TableInputTypes.dropdown({
    width: 150,
    key: 'distribution',
    label: 'Distribution',
    options: [
      { value: "lognormal", label: "Log-Normal" },
      { value: "gamma", label: "Gamma" },
      { value: "uniform", label: "Uniform" }
    ],
    defaultValue: 'lognormal'
  }),
  TableInputTypes.text({
    width: 200,
    key: 'parameters',
    label: 'Parameters',
    parser: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    placeholder: 'Enter as JSON',
    defaultValue: '{"sigma": 1, "scale": 1}'
  }),
  TableInputTypes.percentage({
    width: 100,
    key: 'immoveableFraction',
    label: 'Immoveable (%)',
    defaultValue: '0'
  })
];
```

Let's instantiate the table. 

```javascript
const tableWithCustomStats = LiveTable(html, {
  columns,
  initialData,
  description: "Enter cost information for each site of care",
  title: 'Title: hello table', 
  updateStats: (data, container, html) => {
    const { parsed } = data;
    const totalCost = parsed.reduce((sum, row) => 
      sum + (parseFloat(row.totalNumber) * parseFloat(row.averageCost)), 0);
    
    container.innerHTML = '';
    container.appendChild(html`
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc;">
        <h3 style="color: #2563eb; margin: 0 0 10px 0;">Quick Stats</h3>
        <div style="font-size: 1.5em; font-weight: bold;">
          Total Cost: $${totalCost.toLocaleString()}
        </div>
      </div>
    `);
  }
})

view(tableWithCustomStats)
```

And now let's view the live data. Edit the table. See! See!!! It CHANGES OMG THIS TOOK FOREVER TO FIGURE OUT OMG. 

```javascript

const livetabledata = LiveTableData(tableWithCustomStats)
```

```javascript
view(livetabledata)
```
--- 

```js
// Define care site options
const careSiteOptions = [
  { value: "ABL", label: "Ambulance" },
  { value: "ASC", label: "Ambulatory Surgical Center" },
  { value: "CCF", label: "Custodial Care Facility" },
  { value: "ETF", label: "ESRD Treatment Facility" },
  { value: "EMR", label: "Emergency Room" },
  { value: "HOM", label: "Home" },
  { value: "HOS", label: "Hospice" },
  { value: "ILB", label: "Independent Laboratory" },
  { value: "IPH", label: "Inpatient Hospital" },
  { value: "IPF", label: "Inpatient Psychiatric Facility" },
  { value: "NUF", label: "Nursing Facility" },
  { value: "OFF", label: "Office" },
  { value: "OTH", label: "Other" },
  { value: "OPH", label: "Outpatient Hospital" },
  { value: "RHC", label: "Public/Rural Health Clinic" },
  { value: "SNF", label: "Skilled Nursing Facility" },
  { value: "UCF", label: "Urgent Care Facility" }
];

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
  { value: "multinomial", label: "Multinomial" }
];


// Define initial data
const initialData = [
  {
    siteOfCare: 'UCF',
    totalNumber: '1000',
    averageCost: '150.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.5, "scale": 150}',
    immoveableFraction: '20'
  },
  {
    siteOfCare: 'ASC',
    totalNumber: '500',
    averageCost: '2500.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.7, "scale": 2500}',
    immoveableFraction: '80'
  },
  {
    siteOfCare: 'CCF',
    totalNumber: '750',
    averageCost: '1200.00',
    distribution: 'normal',
    parameters: '{"mean": 0.6, "std": 1200}',
    immoveableFraction: '50'
  },
  {
    siteOfCare: 'CCF',
    totalNumber: '250',
    averageCost: '800.00',
    distribution: 'lognormal',
    parameters: '{"sigma": 0.8, "scale": 800}',
    immoveableFraction: '90'
  }
];

// Define columns
const columns = [
  TableInputTypes.dropdown({
    width: 200,
    key: 'siteOfCare',
    label: 'Site of Care',
    options: careSiteOptions,
    defaultValue: 'OFF'
  }),
  TableInputTypes.integer({
    width: 75,
    key: 'totalNumber',
    label: 'Total Number (#)',
    min: 0
  }),
  TableInputTypes.float({
    width: 75,
    key: 'averageCost',
    label: 'Average Cost ($)',
    min: 0,
    step: 0.01
  }),
  TableInputTypes.dropdown({
    width: 100,
    key: 'distribution',
    label: 'Distribution',
    options: distributionOptions,
    defaultValue: 'lognormal'
  }),
  TableInputTypes.text({
    width: 150,
    key: 'parameters',
    label: 'Parameters',
    parser: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    placeholder: 'Enter as JSON',
    defaultValue: '{"sigma": 1, "scale": 1}'
  }),
  TableInputTypes.percentage({
    width: 75,
    key: 'immoveableFraction',
    label: 'Immoveable (%)',
    defaultValue: '0'
  })
];

const tableWithCustomStats = LiveTable(html, {
  columns,
  initialData,
  width: 600,
  description: "Enter cost information for each site of care",
  title: 'Title: hello table', 
  updateStats: (data, container, html) => {
    const { parsed } = data;
    const totalCost = parsed.reduce((sum, row) => 
      sum + (parseFloat(row.totalNumber) * parseFloat(row.averageCost)), 0);
    const totalNumber = parsed.reduce((sum, row) => 
      sum + (parseFloat(row.totalNumber) ), 0);

    const averageCostPerEvent = totalCost/totalNumber
    
    container.innerHTML = '';
    container.appendChild(html`
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc;">
        <h3 style="color: #2563eb; margin: 0 0 10px 0;">Quick Stats</h3>
        <div style="font-size: 1.5em; font-weight: bold;">
          Total Cost: $${totalCost.toLocaleString()} <br>
          Total Events: ${totalNumber.toFixed(0)} <br>
          Average Cost Per Event: $${averageCostPerEvent.toLocaleString()}
        </div>
      </div>
    `);
  }
})

view(tableWithCustomStats)
```

```js
const livetabledata = LiveTableData(tableWithCustomStats)
```
```js
view(livetabledata)
```
