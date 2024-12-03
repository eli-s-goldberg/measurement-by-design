import * as Plot from "../../_npm/@observablehq/plot@0.6.15/118fc3ce.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.45152b81.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

// Define distributions
export const distributions = {
    
    // Normal distribution using jStat
    normal: ({ mean = 0, std = 1 } = {}) => {
        return jStat.normal.sample(mean, std);
    },
    
    // Uniform distribution using jStat
    uniform: ({ min = 0, max = 1 } = {}) => {
        return jStat.uniform.sample(min, max);
    },
    
    // Exponential distribution using jStat
    exponential: ({ rate = 1 } = {}) => {
        return jStat.exponential.sample(rate);
    },
    
    // Lognormal distribution using jStat, with real-space mean and shape
    lognormal: ({ mean = 0.2, shape = 0.1 } = {}) => {
        const logMu = Math.log(mean) - (shape ** 2) / 2;
        const logSigma = shape;
        return jStat.lognormal.sample(logMu, logSigma);
    },
    
    // Triangular distribution (custom, as jStat lacks this)
    triangular: ({ min = 0, max = 1, mode = (min + max) / 2 } = {}) => {
        const u = Math.random();
        const f = (mode - min) / (max - min);
        return u < f
            ? min + Math.sqrt(u * (max - min) * (mode - min))
            : max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    },

    // Beta distribution using jStat
    beta: ({ alpha = 2, beta = 2 } = {}) => {
        return jStat.beta.sample(alpha, beta);
    },

    // Gamma distribution using jStat
    gamma: ({ shape = 1, scale = 1 } = {}) => {
        return jStat.gamma.sample(shape, scale);
    },

    // Weibull distribution using jStat
    weibull: ({ scale = 1, shape = 1 } = {}) => {
        return jStat.weibull.sample(scale, shape);
    },

    // Custom discrete distribution from sample array
    custom: ({ samples = [0, 1, 2, 3, 4, 5] } = {}) => {
        return samples[Math.floor(Math.random() * samples.length)];
    }
};

export class DistP {
    /**
     * @param {Object} config - Configuration object for the distribution
     * @param {string} config.name - Name of the distribution
     * @param {string} config.lever - Lever the distribution is associated with
     * @param {Function|string} config.distfunc - Distribution function or 'fitted'
     * @param {Object} config.params - Parameters for the distribution function
     * @param {Array<number>} config.bounds - [lower bound, upper bound]
     * @param {string} config.boundMethod - Method to handle outliers ('drop_recursive' or 'stack')
     * @param {number} config.size - Number of samples to generate
     * @param {Array<number>} [config.samples] - Initial samples (required if distfunc is 'fitted')
     */
    constructor({
        name = 'default',
        lever = 'default',
        distfunc = null,
        params = {},
        bounds = [0, 1e6],
        boundMethod = 'drop_recursive',
        size = 5000,
        samples = null
    } = {}) {
        this.name = name;
        this.lever = lever;
        this.distfunc = distfunc;
        this.params = params;
        this.bounds = bounds;
        this.boundMethod = boundMethod;
        this.size = size;
        this.samples = samples;
        
        // Initialize statistics
        this.stats = {
            mean: 0,
            median: 0,
            std: 0,
            percentiles: []
        };

        this.initialize();
    }

    initialize() {
        if (!this.distfunc && !this.samples) {
            throw new Error("Either distfunc or samples must be provided");
        }

        if (this.distfunc === 'fitted') {
            if (!this.samples) {
                throw new Error("Samples must be provided when using 'fitted' distribution");
            }
            this.samples = this._fitted();
        } else if (typeof this.distfunc === 'function') {
            this.generateSamples();
        }

        this.updateStats();
    }

    generateSamples() {
        // Generate samples using the provided distribution function
        this.samples = Array.from({ length: this.size }, () => {
            let sample = this.distfunc(this.params);
            return sample;
        });

        // Apply bounds if specified
        if (this.bounds) {
            this._applyBounds();
        }
    }

    _fitted() {
        const filtered = this.samples.filter(
            x => x >= this.bounds[0] && x <= this.bounds[1]
        );
        return this._sampleRandomly(filtered, this.size);
    }

    _applyBounds() {
        if (this.boundMethod === 'stack') {
            this.samples = this.samples.map(x => 
                Math.min(Math.max(x, this.bounds[0]), this.bounds[1])
            );
        } else if (this.boundMethod === 'drop_recursive') {
            this.samples = this._boundsSampler(this.bounds, this.samples);
        }
    }

    _boundsSampler(bounds, samples) {
        samples = samples.filter(x => x >= bounds[0] && x <= bounds[1]);
        
        if (samples.length >= this.size) {
            return this._sampleRandomly(samples, this.size);
        } else {
            // Resample with replacement until we reach desired size
            return this._sampleRandomly(samples, this.size);
        }
    }

    _sampleRandomly(arr, size) {
        return Array.from({ length: size }, () => 
            arr[Math.floor(Math.random() * arr.length)]
        );
    }

    updateStats() {
        if (!this.samples || this.samples.length === 0) return;
        
        this.stats.mean = d3.mean(this.samples);
        this.stats.median = d3.median(this.samples);
        this.stats.std = d3.deviation(this.samples);
        this.stats.size = this.samples.length;
        this.stats.percentiles = [0, 25, 50, 75, 100].map(p =>
            d3.quantile(this.samples, p / 100)
        );
    }

    // Chain operations
    multConst(k) {
        this.samples = this.samples.map(x => x * k);
        this.updateStats();
        return this;
    }

    chainMult(distribution) {
        if (this.samples.length !== distribution.samples.length) {
            throw new Error("Distributions must have the same number of samples");
        }
        this.samples = this.samples.map((x, i) => x * distribution.samples[i]);
        this.updateStats();
        return this;
    }

    chainDivide(distribution) {
        if (this.samples.length !== distribution.samples.length) {
            throw new Error("Distributions must have the same number of samples");
        }
        this.samples = this.samples.map((x, i) => x / distribution.samples[i]);
        this.updateStats();
        return this;
    }

    chainAdd(distribution) {
        if (this.samples.length !== distribution.samples.length) {
            throw new Error("Distributions must have the same number of samples");
        }
        this.samples = this.samples.map((x, i) => x + distribution.samples[i]);
        this.updateStats();
        return this;
    }

    chainSub(distribution) {
        if (this.samples.length !== distribution.samples.length) {
            throw new Error("Distributions must have the same number of samples");
        }
        this.samples = this.samples.map((x, i) => x - distribution.samples[i]);
        this.updateStats();
        return this;
    }

    confInt(ci = [2.5, 97.5]) {
        return ci.map(p => d3.quantile(this.samples, p / 100));
    }

    plot(options = {}, markOptions = {}) {


        // Default configuration
        const defaultConfig = {
            width: 600,
            height: 200,
            margin: 40,
            grid: true,
            x: { label: this.name },
            y: { label: "Frequency" },
            marks: [
                Plot.areaY(
                    this.samples,
                    Plot.binX(
                        { y: "count" },
                        { 
                            x: d => d,
                            stroke: "black",
                            thresholds: 10,
          curve: "natural",
                            ...markOptions 
                        }
                    )
                ),
                Plot.ruleY([0]),
                Plot.ruleX([this.stats.mean], {stroke: "red", strokeWidth: 2}),
                Plot.text([this.stats.mean], {
                    x: d => d,
                    text: [this.stats.mean.toFixed(2)],
                    dy: 0, 
                    textAnchor: 'middle',
                    lineAnchor: "top",
                    strokeWidth: 1,
                    fill: 'black',
                    stroke: 'white',
                    dx: -2
                })
            ]
        };

        // Deep merge the configurations
        const mergedConfig = this._deepMerge(defaultConfig, options);

        // If marks are provided in options, completely replace the default marks
        if (options.marks) {
            mergedConfig.marks = options.marks;
        }

        return Plot.plot(mergedConfig);
    }

    /**
     * Deep merge utility for configuration objects
     * @private
     */
    _deepMerge(target, source) {
        const output = { ...target };
        
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                output[key] = this._deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
        
        return output;
    }
}


export class MatrixSolver {

    constructor({
        currentState = math.matrix([
            [3000],
            [6000],
            [2200],
            [1800],
            [200]
          ]), 
        transferMatrix =math.matrix([
            [0.7500, 0.1000, 0.1000, 0.0000, 0.0000],
            [0.1500, 0.8500, 0.0500, 0.0000, 0.0500],
            [0.0500, 0.0000, 0.8000, 0.0500, 0.0500],
            [0.0500, 0.1000, 0.0000, 0.9500, 0.1000],
            [0.0000, 0.0500, 0.0500, 0.0000, 0.8500]
          ]),
        costMatrix = math.matrix( 
            [[2032], 
            [105], 
            [193], 
            [90], 
            [5]
        ]) 
        } = {}) 
        {
            this.currentState = currentState;
            this.transferMatrix = transferMatrix;
            this.costMatrix = costMatrix;
            this.futureState = math.multiply(transferMatrix, currentState);
            this.difference = math.subtract(this.futureState, this.currentState);
            this.cost_difference = math.dotMultiply(this.difference, this.costMatrix);
            this.cost_difference_total = math.sum(this.cost_difference);
        }

    formatCurrency(amount) {
            return amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

    generateLatexEquation() {
        // Ensure currentState is an array of arrays (matrix)
        if (!Array.isArray(this.currentState.toArray()) || !this.currentState.toArray().every(Array.isArray)) {
            throw new TypeError("currentState must be an array of arrays");
        }
    
        // Ensure transferMatrix is an array of arrays (matrix)
        if (!Array.isArray(this.transferMatrix.toArray()) || !this.transferMatrix.toArray().every(Array.isArray)) {
            throw new TypeError("transferMatrix must be an array of arrays");
        }
    
        // Ensure futureState is an array of arrays (matrix)
        if (!Array.isArray(this.futureState.toArray()) || !this.futureState.toArray().every(Array.isArray)) {
            throw new TypeError("futureState must be an array of arrays");
        }
    
        // Convert currentState to LaTeX format
        const currentStateLatex = this.currentState.toArray()
            .map(row => `${row[0]}`)  // Format each row
            .join(' \\\\\n');  // Join rows with LaTeX newline
        
        // Convert transferMatrix to LaTeX format
        const transferMatrixLatex = this.transferMatrix.toArray()
            .map(row => row.map(value => `${value.toFixed(4)}`).join(' & '))  // Format each row with "&" separator
            .join(' \\\\\n');  // Join rows with LaTeX newline
        
        // Convert futureState to LaTeX format
        const futureStateLatex = this.futureState.toArray()
            .map(row => `${row[0].toFixed(2)}`)  // Format each row
            .join(' \\\\\n');  // Join rows with LaTeX newline

        // Convert difference (State_future - State_current) to LaTeX format
        const differenceLatex = this.difference.toArray()
            .map(row => `${this.formatCurrency(row[0].toFixed(2))}`)
            .join(' \\\\\n');

        // Convert cost matrix to LaTeX format
        const costMatrixLatex = this.costMatrix.toArray()
            .map(row => `\\$${this.formatCurrency(row[0].toFixed(2))}`)
            .join(' \\\\\n');

        // Convert cost difference to LaTeX format
        const costDifferenceLatex = this.cost_difference.toArray()
            .map(row => `\\$${this.formatCurrency(row[0].toFixed(2))}`)
            .join(' \\\\\n');

        // Construct the full LaTeX equation string for main state calculations
        const calculationStateLatex = `
        \\\\
        \\\\
    \\text{State}_{\\text{current}} \\times \\mathbf{T}_{\\text{transfer}} = \\text{State}_{\\text{future}}
    \\\\
    ~\\\\
    \\therefore
    \\\\
    ~\\\\
    
    \\begin{bmatrix}
    ${currentStateLatex}
    \\end{bmatrix}
    \\times
    \\begin{bmatrix}
    ${transferMatrixLatex}
    \\end{bmatrix}
    =
    \\begin{bmatrix}
    ${futureStateLatex}
    \\end{bmatrix}
        `;
    
    // Construct the LaTeX equation string for cost difference calculations
    const costDifferenceLatexOutput = `
    \\\\
    \\\\
    \\\\
    \\text{Future} - \\text{Current} = \\text{Difference} \\odot \\text{Cost} = \\text{Total Cost Differential}
    \\\\
    ~\\\\
    \\\\
    \\Bigg(
    \\begin{bmatrix}
    ${futureStateLatex}
    \\end{bmatrix}
    \\ - 
    \\begin{bmatrix}
    ${currentStateLatex}
    \\end{bmatrix}
    \\Bigg)
    =
    \\begin{bmatrix}
    ${differenceLatex}
    \\end{bmatrix}
    \\odot
    \\begin{bmatrix}
    ${costMatrixLatex}
    \\end{bmatrix}
    =
    \\begin{bmatrix}
    ${costDifferenceLatex}
    \\end{bmatrix}
    \\\\
    \\\\
    \\\\
    ~\\\\
    \\text{Total Cost Differential} = \\$${this.cost_difference_total}
`;
    
        // Return two separate LaTeX outputs: one for the main equation and one for cost difference
        return {
            "matrices": {
                "currentState": this.currentState,
                "transferStateMatrix": this.transferMatrix,
                "futureStateMatrix": this.futureState,
                "differenceMatrix": this.difference,
                "costDifferenceMatrix": this.cost_difference,
                "costDifferenceTotal": this.cost_difference_total
            },
            "latex-matrices": {
                "currentStateMatrix_tex": currentStateLatex,
                "futureStateMatrix_tex": futureStateLatex,
                "transferStateMatrix_tex": transferMatrixLatex,
                "differenceMatrix_tex": differenceLatex,
                "costMatrix_tex": costMatrixLatex,
                "costDifferenceMatrix_tex": costDifferenceLatex,
                "calculationStateMatrix_tex": calculationStateLatex,
            },
            "latex-cost-difference": {
                "costDifferenceMatrix_tex": costDifferenceLatexOutput
            }
        };
    }
}


