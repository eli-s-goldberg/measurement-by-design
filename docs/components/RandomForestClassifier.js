export class RandomForestClassifier {
  constructor({ nEstimators = 1, maxDepth = 3, minSize = 1, 
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

  // Optimized Gini Impurity Calculation
  giniImpurity(groups, classes) {
      const nInstances = groups.reduce((sum, group) => sum + group.length, 0);
      let gini = 0.0;

      for (const group of groups) {
          const size = group.length;
          if (size === 0) continue;
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

  // Corrected getRandomFeatures method
  getRandomFeatures(nFeatures) {
      let maxFeatures = this.maxFeatures;
      if (!maxFeatures) {
          maxFeatures = Math.max(1, Math.floor(Math.sqrt(nFeatures)));
      }
      // Ensure maxFeatures does not exceed nFeatures
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

  // Modify the getSplit method
  getSplit(dataset) {
      const classValues = [...new Set(dataset.map(row => row[row.length - 1]))];
      let bestIndex, bestValue, bestScore = Infinity, bestGroups;

      // Number of features
      const nFeatures = dataset[0].length - 1;

      // Randomly select features to consider at this split
      const features = this.getRandomFeatures(nFeatures);

      // Iterate over the selected features
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

      // If no valid split is found, return a terminal node
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

  // Optimized toTerminal method
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

  // Recursive splitting
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
  buildTree(train, maxDepth, minSize) {
      const root = this.getSplit(train);
      this.split(root, maxDepth, minSize, 1);
      return root;
  }

  // Predict a single row
  predictTree(node, row, plotPath = false, depth = 0) {
    if (node.isTerminal) {
        if (plotPath) console.log(`${'|  '.repeat(depth)}Leaf: Predict ${node.value}`);
        return Number(node.value); // Ensure the returned value is a number
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


  // Bootstrap sample with replacement
  subsample(dataset, ratio) {
      const nSample = Math.round(dataset.length * ratio);
      const sample = [];
      for (let i = 0; i < nSample; i++) {
          const index = Math.floor(Math.random() * dataset.length);
          sample.push(dataset[index]);
      }
      return sample;
  }

  // Fit the random forest classifier
  fit(X, y) {
    const dataset = X.map((row, idx) => [...row, y[idx]]);
    this.classLabels = [...new Set(y.map(label => Number(label)))]; // Store unique class labels as numbers
    for (let i = 0; i < this.nEstimators; i++) {
        const sample = this.subsample(dataset, this.sampleSize);
        const tree = this.buildTree(sample, this.maxDepth, this.minSize);
        this.trees.push(tree);
    }
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

  // Updated printTree method
  printTree(node, depth = 0) {
      if (node.isTerminal) {
          console.log(`${'|  '.repeat(depth)}[Leaf] Predict: ${node.value}`);
      } else {
          console.log(`${'|  '.repeat(depth)}[X${node.index} < ${node.value}]`);
          this.printTree(node.left, depth + 1);
          this.printTree(node.right, depth + 1);
      }
  }

  // Updated convertToHierarchy method
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

  // Convert the whole forest to hierarchical format (list of trees)
  convertForestToHierarchy() {
      return this.trees.map((tree, index) => ({
          name: `Tree ${index + 1}`,
          children: [this.convertToHierarchy(tree)]
      }));
  }

  // Optimized predict method
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
          majorityClass = isNaN(key) ? key : Number(key); // Ensure the label is a number
        }
      }
      return majorityClass;
    });
  }

  // Helper method to recursively get paths
  getPaths(node, path = "") {
      if (node.isTerminal) {
          return [`${path}/Leaf: ${node.value}`];
      }

      const leftPaths = this.getPaths(node.left, `${path}/X${node.index} < ${node.value}`);
      const rightPaths = this.getPaths(node.right, `${path}/X${node.index} >= ${node.value}`);

      return [...leftPaths, ...rightPaths];
  }

  // Method to plot the classification domain
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

  // Convert the entire forest to paths format
  convertForestToPaths() {
      let paths = [];
      this.trees.forEach((tree, index) => {
          const treePaths = this.getPaths(tree, `Tree ${index + 1}`);
          paths = [...paths, ...treePaths];
      });
      return paths;
  }

  // Scoring Methods

  // predict probab method
  predictProba(X) {
    return X.map(row => {
        const predictions = this.trees.map(tree => this.predictTree(tree, row));
        const counts = {};
        for (const pred of predictions) {
            // Ensure pred is a number
            const classLabel = Number(pred);
            counts[classLabel] = (counts[classLabel] || 0) + 1;
        }
        const total = this.trees.length;
        const probabilities = {};
        // Ensure all class labels are included
        for (const classLabel of this.classLabels) {
            probabilities[classLabel] = counts[classLabel] ? counts[classLabel] / total : 0;
        }
        return probabilities;
    });
}

  

  // Accuracy Score
  accuracyScore(yTrue, yPred) {
      let correct = 0;
      for (let i = 0; i < yTrue.length; i++) {
          if (yTrue[i] === yPred[i]) {
              correct += 1;
          }
      }
      return correct / yTrue.length;
  }

  // Precision Score
  precisionScore(yTrue, yPred, positiveClass = 1) {
    let truePositive = 0;
    let falsePositive = 0;
    for (let i = 0; i < yTrue.length; i++) {
        if (yPred[i] === positiveClass) {
            if (yTrue[i] === positiveClass) {
                truePositive += 1;
            } else {
                falsePositive += 1;
            }
        }
    }
    return truePositive / (truePositive + falsePositive);
}

  // Recall Score
  recallScore(yTrue, yPred, positiveClass = 1) {
    let truePositive = 0;
    let falseNegative = 0;
    for (let i = 0; i < yTrue.length; i++) {
        if (yTrue[i] === positiveClass) {
            if (yPred[i] === positiveClass) {
                truePositive += 1;
            } else {
                falseNegative += 1;
            }
        }
    }
    return truePositive / (truePositive + falseNegative);
}

  // Multi-class Confusion Matrix
  confusionMatrix(yTrue, yPred) {
      const labels = Array.from(new Set([...yTrue, ...yPred])).sort();
      const labelIndices = {};
      labels.forEach((label, index) => {
          labelIndices[label] = index;
      });
      const matrix = Array.from({ length: labels.length }, () => Array(labels.length).fill(0));

      for (let i = 0; i < yTrue.length; i++) {
          const trueIndex = labelIndices[yTrue[i]];
          const predIndex = labelIndices[yPred[i]];
          matrix[trueIndex][predIndex] += 1;
      }

      return {
          labels: labels,
          matrix: matrix
      };
  }
}
