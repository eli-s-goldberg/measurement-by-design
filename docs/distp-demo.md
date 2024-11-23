---
title: Distribution Business Case Demo
toc: true
---

```js
import {
  DistP, distributions
} from "./components/DistP.js"
```

# Distributions

There are rarely truly static parameters in life. In business, either. Creating distribution-based business cases is pretty easy to do and a powerful way to model and add probability to your estimates. 

Let's create the fundamental primatives for working with distributions. Then let's introduce some math to manipulate them. 

## Instantiating and plotting distributions
Let's first create some distributions using the `DistP` class we just made, starting with a normal and a lognormal distribution. 

The following distributions functions are available. 
1. normal
2. uniform
3. exponential
4. lognormal
5. triangular
6. beta
7. gamma
8. weibull
9. custom

N.b., that the idea behind the `custom` distribution is actually to use _real data_. in other words, why fit a distribution if you have actual data? This is implemented in the python version of this package, but not yet in javascript. 

### Normal distribution

```js
const ndp = view(Inputs.form(
    {
        'mean': Inputs.range([0, 1], { label: "Mean", value: 0.25, 
                    step: 0.01 }),
        'std' : Inputs.range([0.1, 1], { label: "Standard Deviation", value: 0.15, step: 0.01 }),
        'size' : Inputs.range([100, 500000], { label: "Size", value: 50000, step: 100, disabled:true }),
        'lowerBound' : Inputs.range([0, 10], { label: "Lower Bound", value: 0, step: 1, disabled:true }),
        'upperBound' : Inputs.range([0.1, 100000], { label: "Upper Bound", value: 1, step: 0.1, disabled:true }),
    }
    ));
    
```
```js
const normalDist = new DistP({
    name: "Normal Distribution",
    distfunc: distributions.normal,
    params: { mean: ndp.mean, std: ndp.std },
    bounds: [ndp.lowerBound, ndp.upperBound],
    size: ndp.size
});
view(normalDist.plot())
```

### Lognormal distribution
```js
const ldp = view(Inputs.form(
    {
        'mean': Inputs.range([0, 1], { label: "Mean", value: 0.2, step: 0.1 }),
        'shape' : Inputs.range([0.1, 1], { label: "Shape", value: 0.8, step: 0.01 }),
        'size' : Inputs.range([1000, 100000], { label: "Size", value: 50000, step: 1000,disabled:true }),
        'lowerBound' : Inputs.range([0, 10], { label: "Lower Bound", value: 0, step: 1, disabled:true }),
        'upperBound' : Inputs.range([0.1, 1], { label: "Upper Bound", value: 100000, step: 0.1, disabled:true}),
    }
    ));
    
```

```js
// Create a lognormal distribution
const lognormalDist = new DistP({
    name: "Lognormal Distribution",
    distfunc: distributions.lognormal,
    params: { mean: ldp.mean, shape: ldp.shape },
    bounds: [ldp.lowerBound, ldp.upperBound],
    size: ldp.size,
        boundMethod: "stack",
});

view(lognormalDist.plot())
```

### Beta distribution
Beta distributions are super flexible. They can be uniform, or resemble lognormal skewed left or right. Play around. 

```js
const bdp = view(Inputs.form(
    {
        'alpha': Inputs.range([0.1, 100],
             { label: "Alpha", value: 2, step: 0.1 }),
        'beta' : Inputs.range([0.1, 100], 
            { label: "Beta", value: 2, step: 0.1 }),
        'size' : Inputs.range([1000, 100000], 
            { label: "Size", value: 50000, step: 1000, disabled:true }),
        'lowerBound' : Inputs.range([0, 10], { label: "Lower Bound", value: 0, step: 1, disabled:true }),
        'upperBound' : Inputs.range([0.1, 100000], { label: "Upper Bound", value: 100000, step: 0.1, disabled:true  }),
    }
    ));
    
```

```js
// Create a lognormal distribution
const betaDist = new DistP({
    name: "Beta Distribution",
    distfunc: distributions.beta,
    params: { alpha: bdp.alpha, beta: bdp.beta },
    bounds: [bdp.lowerBound, bdp.upperBound],
    size: bdp.size
});

view(betaDist.plot())
```

## Operations on distributions for business cases
I'm convinced that almmost everyone builds _terrible_ business cases. Every parameter in a business case is actually a distribution. Thus, distributions as an object or entity are important to be able to use, and on which we're able to do some quick math. 

Let's say that the prevalence of a disease across counties varies in an approximatly lognormal manner, centered about ~20% prevalence. Let's say it's actually a beta distribution. 

Let's create that distribution and visualize it. 

```js
// Create a lognormal distribution
const diseasePrevalence = new DistP({
    name: "Disease Prevalence Distribution",
    distfunc: distributions.lognormal,
    pparams: { mean: 0.2, shape: 0.9 },
    bounds: [0, 10],
    boundMethod: "stack",
    size: 5000
});

view(diseasePrevalence.plot())
```
## Let's explore chaining


```js
// Example using chain operations with different distributions
const normalBase = new DistP({
    name: "Base Normal",
    distfunc: distributions.normal,
    params: { mean: 100, std: 10 },
    size: 5000,
    bounds: [0, 200]
});

const uniformDist = new DistP({
    name: "Uniform",
    distfunc: distributions.uniform,
    params: { min: 0.8, max: 1.2 },
    size: 5000
});
```

Let's add two distributions together. 

```javascript
// Chain operations
const addResult = new DistP({
    name: "Normal + Lognormal",
    samples: [...normalBase.samples],
    size: 5000
}).chainAdd(uniformDist);
view(addResult.plot())
```
```js
// Chain operations
const addResult = new DistP({
    name: "Normal + Lognormal",
    samples: [...normalBase.samples],
    size: 5000
}).chainAdd(uniformDist);
view(addResult.plot())
```

Let's multiply two distributions together. 

```javascript
// Chain operations
const multResult = new DistP({
    name: "Normal × Uniform",
    samples: [...normalBase.samples],
    size: 5000
}).chainMult(uniformDist);

//plot it
view(multResult.plot())
```
```js
// Chain operations
const multResult = new DistP({
    name: "Normal × Uniform",
    samples: [...normalBase.samples],
    size: 5000
}).chainMult(uniformDist);

//plot it
view(multResult.plot())
```

Let's divide two distributions.

```javascript
const divResult = new DistP({
    name: "Normal ÷ Uniform",
    samples: [...normalBase.samples],
    size: 5000,
}).chainDivide(uniformDist);

//plot it
view(multResult.plot())
```

```js
const divResult = new DistP({
    name: "Normal ÷ Uniform",
    samples: [...normalBase.samples],
    size: 5000,
}).chainDivide(uniformDist);

//plot it
view(divResult.plot())
```
