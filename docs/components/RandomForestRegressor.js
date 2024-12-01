export class RandomForestRegressor {
    constructor({ nEstimators = 100, maxDepth = 3, minSize = 5, 
                  sampleSize = 1.0, maxFeatures = null,
                  decimalPrecision = 2 } = {}) {
        this.nEstimators = nEstimators;
        this.maxDepth = maxDepth;
        this.minSize = minSize;
        this.sampleSize = sampleSize;
        this.maxFeatures = maxFeatures;
        this.decimalPrecision = decimalPrecision;
        this.trees = [];
    }

    // Helper method to round values to the desired precision
    round(value) {
        return parseFloat(value.toFixed(this.decimalPrecision));
    }

    // Calculate variance for a group
    variance(group) {
        if (group.length === 0) return 0;
        const values = group.map(row => row[row.length - 1]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(x => Math.pow(x - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    // Calculate variance reduction for splits
    varianceReduction(groups) {
        const nInstances = groups.reduce((sum, group) => sum + group.length, 0);
        if (nInstances === 0) return 0;

        const weightedVariance = groups.reduce((sum, group) => {
            return sum + (group.length / nInstances) * this.variance(group);
        }, 0);

        return this.round(weightedVariance);
    }

    // Helper method to split dataset
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

    // Get random features for split consideration
    getRandomFeatures(nFeatures) {
        let maxFeatures = this.maxFeatures;
        if (!maxFeatures) {
            maxFeatures = Math.max(1, Math.floor(Math.sqrt(nFeatures)));
        }
        maxFeatures = Math.min(maxFeatures, nFeatures);
        const features = [];
        while (features.length < maxFeatures) {
            const index = Math.floor(Math.random() * nFeatures);
            if (!features.includes(index)) {
                features.push(index);
            }
        }
        return features;
    }

    // Find the best split point for a dataset
    getSplit(dataset) {
        let bestIndex, bestValue, bestScore = Infinity, bestGroups;

        const nFeatures = dataset[0].length - 1;
        const features = this.getRandomFeatures(nFeatures);

        for (const index of features) {
            for (const row of dataset) {
                const groups = this.testSplit(index, row[index], dataset);
                const variance = this.varianceReduction(groups);
                if (variance < bestScore) {
                    bestIndex = index;
                    bestValue = row[index];
                    bestScore = variance;
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
            variance: bestScore,
            groups: bestGroups
        };
    }

    // Create a terminal node value - average for regression
    toTerminal(group) {
        const outcomes = group.map(row => row[row.length - 1]);
        const mean = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
        return { isTerminal: true, value: this.round(mean) };
    }

    // Create child splits for a node or make terminal
    split(node, maxDepth, minSize, depth) {
        if (node.isTerminal) {
            return;
        }

        const [left, right] = node.groups;
        delete node.groups;

        if (!left.length || !right.length) {
            node.left = node.right = this.toTerminal(left.concat(right));
            return;
        }

        if (depth >= maxDepth) {
            node.left = this.toTerminal(left);
            node.right = this.toTerminal(right);
            return;
        }

        if (left.length <= minSize) {
            node.left = this.toTerminal(left);
        } else {
            node.left = this.getSplit(left);
            this.split(node.left, maxDepth, minSize, depth + 1);
        }

        if (right.length <= minSize) {
            node.right = this.toTerminal(right);
        } else {
            node.right = this.getSplit(right);
            this.split(node.right, maxDepth, minSize, depth + 1);
        }
    }

    // Build a decision tree
    buildTree(train) {
        const root = this.getSplit(train);
        this.split(root, this.maxDepth, this.minSize, 1);
        return root;
    }

    // Make a prediction with a decision tree
    predictTree(node, row, plotPath = false, depth = 0) {
        if (node.isTerminal) {
            if (plotPath) console.log(`${'|  '.repeat(depth)}Leaf: Predict ${node.value}`);
            return node.value;
        }

        if (plotPath) {
            console.log(`${'|  '.repeat(depth)}Node: X${node.index} < ${node.value} (Variance: ${node.variance})`);
        }

        if (row[node.index] < node.value) {
            return this.predictTree(node.left, row, plotPath, depth + 1);
        } else {
            return this.predictTree(node.right, row, plotPath, depth + 1);
        }
    }

    // Create a bootstrap sample
    subsample(dataset, ratio) {
        const nSample = Math.round(dataset.length * ratio);
        const sample = [];
        for (let i = 0; i < nSample; i++) {
            const index = Math.floor(Math.random() * dataset.length);
            sample.push(dataset[index]);
        }
        return sample;
    }

    // Fit the random forest regressor
    fit(X, y) {
        const dataset = X.map((row, idx) => [...row, y[idx]]);
        for (let i = 0; i < this.nEstimators; i++) {
            const sample = this.subsample(dataset, this.sampleSize);
            const tree = this.buildTree(sample);
            this.trees.push(tree);
        }
    }

    // Make predictions with the random forest
    predict(X, plotPath = false) {
        return X.map(row => {
            const predictions = this.trees.map(tree => this.predictTree(tree, row, plotPath));
            const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length;
            return this.round(mean);
        });
    }

    // Save the model to a JSON string
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

    // Load the model from a JSON string
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

    // Print a single tree
    printTree(node, depth = 0) {
        if (node.isTerminal) {
            console.log(`${'|  '.repeat(depth)}[Leaf] Predict: ${node.value}`);
        } else {
            console.log(`${'|  '.repeat(depth)}[X${node.index} < ${node.value}]`);
            this.printTree(node.left, depth + 1);
            this.printTree(node.right, depth + 1);
        }
    }

    // Convert tree to hierarchy format for visualization
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

    // Convert forest to hierarchy format
    convertForestToHierarchy() {
        return this.trees.map((tree, index) => ({
            name: `Tree ${index + 1}`,
            children: [this.convertToHierarchy(tree)]
        }));
    }

    // Calculate Mean Squared Error
    mseScore(yTrue, yPred) {
        const errors = yTrue.map((actual, index) => 
            Math.pow(actual - yPred[index], 2));
        return this.round(errors.reduce((a, b) => a + b, 0) / yTrue.length);
    }

    // Calculate Root Mean Squared Error
    rmseScore(yTrue, yPred) {
        return this.round(Math.sqrt(this.mseScore(yTrue, yPred)));
    }

    // Calculate R-squared score
    r2Score(yTrue, yPred) {
        const mean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
        const totalSum = yTrue.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
        const residualSum = yTrue.reduce((a, b, i) => 
            a + Math.pow(b - yPred[i], 2), 0);
        return this.round(1 - (residualSum / totalSum));
    }

    // Calculate Mean Absolute Error
    maeScore(yTrue, yPred) {
        const errors = yTrue.map((actual, index) => 
            Math.abs(actual - yPred[index]));
        return this.round(errors.reduce((a, b) => a + b, 0) / yTrue.length);
    }
}