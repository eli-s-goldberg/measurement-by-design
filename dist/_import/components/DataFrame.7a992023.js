import * as Plot from "../../_npm/@observablehq/plot@0.6.16/b55d4b20.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.45152b81.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");
import * as Inputs from "../../_observablehq/stdlib/inputs.7b5fa90e.js";

export const DATE_FORMATS = {
  ISO: "yyyy-mm-dd",
  US: "mm/dd/yyyy",
  EU: "dd/mm/yyyy",
  OBSERVABLE: "%d/%m/%Y",
};

export class DataFrame {
  constructor(data, options = {}) {
    // Handle array of objects (CSV-like data)
    if (Array.isArray(data)) {
      // Get column names from first row's keys
      this._columns = Object.keys(data[0]);
      this._length = data.length;
      this._data = {};
      this._types = {};

      // Initialize arrays for each column
      this._columns.forEach((col) => {
        const values = data.map((row) => row[col]);

        // Check if numeric by testing first non-null value
        const firstNonNull = values.find((v) => v !== null && v !== undefined);
        const isNumeric =
          typeof firstNonNull === "number" &&
          values.every(
            (v) => v === null || v === undefined || typeof v === "number"
          );

        this._types[col] = isNumeric ? "number" : "string";

        if (isNumeric) {
          this._data[col] = new Float64Array(
            values.map((v) => (v === null || v === undefined ? NaN : v))
          );
        } else {
          this._data[col] = values.map((v) =>
            v === null || v === undefined ? "" : String(v)
          );
        }
      });
    } else {
      // Handle column-based object format
      this._columns = Object.keys(data);
      this._length = Array.isArray(data[this._columns[0]])
        ? data[this._columns[0]].length
        : data[this._columns[0]].length;
      this._data = {};
      this._types = {};

      this._columns.forEach((col) => {
        const colArray = Array.from(data[col]);
        const firstNonNull = colArray.find(
          (v) => v !== null && v !== undefined
        );
        const isNumeric =
          typeof firstNonNull === "number" &&
          colArray.every(
            (v) => v === null || v === undefined || typeof v === "number"
          );

        this._types[col] = isNumeric ? "number" : "string";

        if (isNumeric) {
          this._data[col] = new Float64Array(
            colArray.map((v) => (v === null || v === undefined ? NaN : v))
          );
        } else {
          this._data[col] = colArray.map((v) =>
            v === null || v === undefined ? "" : String(v)
          );
        }
      });
    }

    // Concurrency settings
    this._maxWorkers =
      typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
    this._workers = [];
  }

  append(row) {
    // Validate row matches columns
    if (Object.keys(row).length !== this._columns.length) {
      throw new Error("Row must contain values for all columns");
    }

    this._length++;

    // Extend each column with the new value
    this._columns.forEach((col) => {
      const value = row[col];

      if (this._types[col] === "number") {
        // Extend Float64Array for numeric columns
        const newArr = new Float64Array(this._data[col].length + 1);
        newArr.set(this._data[col]);
        newArr[this._data[col].length] = Number(value);
        this._data[col] = newArr;
      } else {
        // For non-numeric columns
        this._data[col].push(value);
      }
    });

    return this;
  }

  // Pythonic extend method
  extend(rows) {
    rows.forEach((row) => this.append(row));
    return this;
  }

  _initWorkerPool() {
    const workerScript = `
    onmessage = function(e) {
      const { data, groupColumns, aggregations } = e.data;
      const dataLength = data[Object.keys(data)[0]].length;
      
      console.log('Worker received data:', {
        dataLength,
        groupColumns,
        aggregationKeys: Object.keys(aggregations)
      });
  
      // Pre-allocate typed arrays for numeric operations
      const keyFuncs = new Array(groupColumns.length);
      const keyData = new Array(groupColumns.length);
      groupColumns.forEach((col, i) => {
        keyData[i] = data[col];
        keyFuncs[i] = typeof keyData[i][0] === 'number' ? 
          (idx) => keyData[i][idx].toFixed(8) : // Handle numeric keys
          (idx) => keyData[i][idx];
      });
    
      // Pre-compute aggregation columns and their configurations
      const aggCols = Object.keys(aggregations);
      const aggData = new Array(aggCols.length);
      const aggTypes = new Array(aggCols.length);
      
      aggCols.forEach((col, i) => {
        aggData[i] = data[col];
        aggTypes[i] = Array.isArray(aggregations[col]) ? aggregations[col] : [aggregations[col]];
      });
    
      // Use Map for group tracking
      const groupMap = new Map();
      
      // Process data in small chunks to avoid GC pauses
      const CHUNK_SIZE = 50000;
      const keyParts = new Array(keyFuncs.length);
      
      for (let start = 0; start < dataLength; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE, dataLength);
        
        for (let i = start; i < end; i++) {
          // Fast key generation
          for (let k = 0; k < keyFuncs.length; k++) {
            keyParts[k] = keyFuncs[k](i);
          }
          const key = keyParts.join('|');
          
          let group = groupMap.get(key);
          if (!group) {
            // Initialize new group
            group = {
              keys: Object.fromEntries(groupColumns.map((col, idx) => [col, keyData[idx][i]])),
              sums: new Float64Array(aggCols.length),
              counts: new Uint32Array(aggCols.length),
              mins: new Float64Array(aggCols.length).fill(Infinity),
              maxs: new Float64Array(aggCols.length).fill(-Infinity)
            };
            groupMap.set(key, group);
          }
          
          // Update aggregations
          for (let j = 0; j < aggCols.length; j++) {
            const val = aggData[j][i];
            if (typeof val === 'number' && !isNaN(val)) {
              group.sums[j] += val;
              group.counts[j]++;
              if (val < group.mins[j]) group.mins[j] = val;
              if (val > group.maxs[j]) group.maxs[j] = val;
            }
          }
        }
      }
  
      console.log('Worker processed groups:', {
        numGroups: groupMap.size,
        sampleKey: Array.from(groupMap.keys())[0],
        sampleGroup: Array.from(groupMap.values())[0]
      });
      
      // Convert results efficiently
      const results = Array.from(groupMap.values(), group => {
        const result = { ...group.keys };
        
        // Add aggregation results
        aggCols.forEach((col, i) => {
          const types = aggTypes[i];
          const count = group.counts[i];
          
          types.forEach(type => {
            switch(type) {
              case 'min':
                result[\`\${col}_min\`] = group.mins[i] !== Infinity ? group.mins[i] : null;
                break;
              case 'max':
                result[\`\${col}_max\`] = group.maxs[i] !== -Infinity ? group.maxs[i] : null;
                break;
              case 'mean':
                result[\`\${col}_mean\`] = count > 0 ? group.sums[i] / count : null;
                result[\`\${col}_count\`] = count;
                result[\`\${col}_sum\`] = group.sums[i];
                break;
              case 'sum':
                result[\`\${col}_sum\`] = group.sums[i];
                break;
            }
          });
        });
        
        return result;
      });
  
      console.log('Worker sending results:', {
        numResults: results.length,
        sampleResult: results[0]
      });
      
      postMessage({ type: 'complete', results });
    };`;

    // Create worker blob
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);

    // Initialize worker pool
    this._workers = Array.from(
      { length: this._maxWorkers },
      () => new Worker(workerUrl)
    );

    // Revoke URL to free memory
    URL.revokeObjectURL(workerUrl);
  }

  async concurrentGroupBy(groupColumns, aggregations) {
    try {
      if (this._workers.length === 0) {
        this._initWorkerPool();
      }

      // Calculate optimal chunk distribution
      const CHUNKS_PER_WORKER = 2;
      const TARGET_CHUNK_SIZE = Math.max(
        100000,
        Math.ceil(this._length / (this._maxWorkers * CHUNKS_PER_WORKER))
      );

      // Pre-allocate chunks array
      const chunks = [];
      const requiredColumns = [
        ...new Set([...groupColumns, ...Object.keys(aggregations)]),
      ];

      // Create chunks
      for (let i = 0; i < this._length; i += TARGET_CHUNK_SIZE) {
        const end = Math.min(i + TARGET_CHUNK_SIZE, this._length);
        const chunk = {};

        requiredColumns.forEach((col) => {
          chunk[col] = this._data[col].slice(i, end);
        });

        chunks.push(chunk);
      }

      console.log(`Processing ${chunks.length} chunks...`);

      // Process chunks sequentially in batches
      const BATCH_SIZE = Math.min(4, this._maxWorkers);
      const results = [];
      const mergedMap = new Map();

      // Process chunks in batches
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(
          i,
          Math.min(i + BATCH_SIZE, chunks.length)
        );
        console.log(
          `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
            chunks.length / BATCH_SIZE
          )}`
        );

        // Process batch
        const batchPromises = batchChunks.map((chunk, index) => {
          return new Promise((resolve, reject) => {
            const worker = this._workers[index % this._maxWorkers];
            const timeoutId = setTimeout(() => {
              worker.terminate();
              reject(
                new Error(
                  `Worker timeout - chunk ${i + index + 1}/${chunks.length}`
                )
              );
            }, 300000);

            worker.onmessage = (e) => {
              if (e.data.type === "complete") {
                clearTimeout(timeoutId);
                console.log(
                  `Completed chunk ${i + index + 1}/${chunks.length}`
                );
                resolve(e.data.results);
              }
            };

            worker.onerror = (error) => {
              clearTimeout(timeoutId);
              reject(error);
            };

            worker.postMessage({ data: chunk, groupColumns, aggregations });
          });
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        console.log(
          `Batch ${
            Math.floor(i / BATCH_SIZE) + 1
          } completed, merging results...`
        );

        // Merge batch results
        for (const chunkResults of batchResults) {
          for (const result of chunkResults) {
            const key = groupColumns.map((col) => result[col]).join("|");

            if (!mergedMap.has(key)) {
              mergedMap.set(key, { ...result });
              continue;
            }

            const existing = mergedMap.get(key);

            // Merge aggregations
            Object.entries(aggregations).forEach(([col, aggs]) => {
              const aggTypes = Array.isArray(aggs) ? aggs : [aggs];

              aggTypes.forEach((agg) => {
                const aggKey = `${col}_${agg}`;
                switch (agg) {
                  case "sum":
                    existing[aggKey] =
                      (existing[aggKey] || 0) + (result[aggKey] || 0);
                    break;
                  case "mean": {
                    const eSum = existing[`${col}_sum`] || 0;
                    const eCount = existing[`${col}_count`] || 0;
                    const rSum = result[`${col}_sum`] || 0;
                    const rCount = result[`${col}_count`] || 0;
                    const totalCount = eCount + rCount;

                    if (totalCount > 0) {
                      existing[`${col}_sum`] = eSum + rSum;
                      existing[`${col}_count`] = totalCount;
                      existing[aggKey] = (eSum + rSum) / totalCount;
                    }
                    break;
                  }
                  case "min":
                    existing[aggKey] = Math.min(
                      existing[aggKey] !== null ? existing[aggKey] : Infinity,
                      result[aggKey] !== null ? result[aggKey] : Infinity
                    );
                    if (existing[aggKey] === Infinity) existing[aggKey] = null;
                    break;
                  case "max":
                    existing[aggKey] = Math.max(
                      existing[aggKey] !== null ? existing[aggKey] : -Infinity,
                      result[aggKey] !== null ? result[aggKey] : -Infinity
                    );
                    if (existing[aggKey] === -Infinity) existing[aggKey] = null;
                    break;
                }
              });
            });
          }
        }

        console.log(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1} merge complete: ${
            mergedMap.size
          } groups`
        );

        // Short delay between batches
        if (i + BATCH_SIZE < chunks.length) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      const finalResults = Array.from(mergedMap.values());
      console.log(`GroupBy complete! ${finalResults.length} total groups`);

      // Debug first few results
      console.log("Sample results:", finalResults.slice(0, 3));

      return new DataFrame(finalResults);
    } catch (error) {
      console.error("Error in concurrentGroupBy:", error);
      throw error;
    } finally {
      this.terminate();
    }
  }

  // Merge results from workers
  _mergeResults(workerResults, groupColumns, aggregations) {
    const mergedGroups = new Map();

    // Combine results from all workers
    workerResults.forEach((workerResult) => {
      workerResult.forEach((result) => {
        const key = groupColumns.map((col) => result[col]).join("_");

        if (!mergedGroups.has(key)) {
          mergedGroups.set(key, result);
        } else {
          const existingResult = mergedGroups.get(key);

          // Merge aggregation columns
          for (const col of Object.keys(aggregations)) {
            ["sum", "mean", "min", "max"].forEach((aggType) => {
              const fullKey = `${col}_${aggType}`;
              this._mergeAggregationValue(
                existingResult,
                result,
                fullKey,
                aggType
              );
            });
          }
        }
      });
    });

    // Convert to array and return
    return Array.from(mergedGroups.values());
  }

  // Smart aggregation value merger
  _mergeAggregationValue(existing, incoming, key, aggType) {
    switch (aggType) {
      case "sum":
        existing[key] += incoming[key];
        break;
      case "mean":
        existing[key] = (existing[key] + incoming[key]) / 2;
        break;
      case "min":
        existing[key] = Math.min(existing[key], incoming[key]);
        break;
      case "max":
        existing[key] = Math.max(existing[key], incoming[key]);
        break;
    }
  }

  head(n = 5) {
    const newData = {};
    const limit = Math.min(n, this._length);

    this._columns.forEach((col) => {
      newData[col] = this._data[col].slice(0, limit);
    });

    return new DataFrame(newData);
  }

  tail(n = 5) {
    const newData = {};
    const start = Math.max(0, this._length - n);

    this._columns.forEach((col) => {
      newData[col] = this._data[col].slice(start);
    });

    return new DataFrame(newData);
  }

  // Select specific columns
  select(columns) {
    if (typeof columns === "string") columns = [columns];

    const newData = {};
    columns.forEach((col) => {
      if (!this._data[col]) {
        throw new Error(`Column ${col} not found`);
      }
      newData[col] = this._data[col];
    });

    return new DataFrame(newData);
  }

  // Filtering with more pandas-like syntax
  loc(condition) {
    const indices = [];

    for (let i = 0; i < this._length; i++) {
      const row = {};
      this._columns.forEach((col) => {
        row[col] = this._data[col][i];
      });

      if (condition(row)) {
        indices.push(i);
      }
    }

    const filteredData = {};
    this._columns.forEach((col) => {
      if (this._types[col] === "number") {
        // For numeric columns, preserve Float64Array and NaN values
        const newArray = new Float64Array(indices.length);
        indices.forEach((idx, i) => {
          newArray[i] = this._data[col][idx];
        });
        filteredData[col] = newArray;
      } else {
        // For non-numeric columns, use regular arrays
        filteredData[col] = indices.map((idx) => this._data[col][idx]);
      }
    });

    return new DataFrame(filteredData);
  }

  // Query method similar to pandas
  query(expr) {
    // Create a function from the expression string
    const conditionFunc = new Function("row", `return ${expr}`);

    return this.loc((row) => conditionFunc(row));
  }

  // Groupby method
  groupby(columns, options = { iterable: false }) {
    if (typeof columns === "string") columns = [columns];

    // If iterable is true, use the IterableGroupBy implementation
    if (options.iterable) {
      class IterableGroupBy {
        constructor(df, groups) {
          this.df = df;
          this.groups = groups;
          this.groupKeys = Array.from(groups.keys());
        }

        *[Symbol.iterator]() {
          for (const key of this.groupKeys) {
            const indices = this.groups.get(key).indices;
            const groupData = {};

            // Create subset of data for this group
            this.df._columns.forEach((col) => {
              if (this.df._types[col] === "number") {
                // For numeric columns, create new Float64Array
                groupData[col] = new Float64Array(
                  indices.map((i) => this.df._data[col][i])
                );
              } else {
                // For non-numeric columns, keep as regular array
                groupData[col] = indices.map((i) => this.df._data[col][i]);
              }
            });

            // Create new DataFrame for group and parse key
            const groupDf = new DataFrame(groupData);
            const keyObj = {};
            const keyParts = key.split("_");
            columns.forEach((col, i) => {
              keyObj[col] =
                this.df._types[col] === "number"
                  ? Number(keyParts[i])
                  : keyParts[i];
            });

            yield [keyObj, groupDf];
          }
        }

        agg(aggSpec) {
          return this.df._performAggregation(this.groups, columns, aggSpec);
        }
      }

      // Create groups Map for iterable version
      const groups = new Map();
      for (let i = 0; i < this._length; i++) {
        const key = columns.map((col) => this._data[col][i]).join("_");

        if (!groups.has(key)) {
          groups.set(key, {
            indices: [],
          });
        }

        groups.get(key).indices.push(i);
      }

      return new IterableGroupBy(this, groups);
    }

    // Original non-iterable implementation
    const groups = new Map();
    for (let i = 0; i < this._length; i++) {
      const key = columns.map((col) => this._data[col][i]).join("_");

      if (!groups.has(key)) {
        groups.set(key, {
          indices: [],
          key: columns.reduce(
            (acc, col) => ({
              ...acc,
              [col]: this._data[col][i],
            }),
            {}
          ),
        });
      }

      groups.get(key).indices.push(i);
    }

    return {
      agg: (aggSpec) => this._performAggregation(groups, columns, aggSpec),
    };
  }

  // Helper method to perform aggregation (shared by both implementations)
  _performAggregation(groups, columns, aggSpec) {
    const newGroups = new Map();

    // Iterate through all rows
    for (let i = 0; i < this._length; i++) {
      const key = columns.map((col) => this._data[col][i]).join("_");

      if (!newGroups.has(key)) {
        newGroups.set(key, {
          keys: Object.fromEntries(
            columns.map((col) => [col, this._data[col][i]])
          ),
          aggs: {},
        });

        // Initialize aggregation objects for all columns, including `first`
        Object.entries(aggSpec).forEach(([col, aggs]) => {
          if (!Array.isArray(aggs)) aggs = [aggs];
          newGroups.get(key).aggs[col] = {
            count: 0,
            sum: 0,
            min: this._types[col] === "number" ? Infinity : null,
            max: this._types[col] === "number" ? -Infinity : null,
            values: [],
            firstValue: null,
            lastValue: null,
            lastIndex: -1,
          };
        });
      }

      Object.entries(aggSpec).forEach(([col, aggs]) => {
        if (!Array.isArray(aggs)) aggs = [aggs];
        const value = this._data[col][i];
        const agg = newGroups.get(key).aggs[col];

        // Set first value if not already set
        if (agg.firstValue === null) {
          agg.firstValue = value;
        }

        // Update last value
        agg.lastValue = value;
        agg.lastIndex = i;

        // Only perform numeric aggregations for number type columns
        if (
          this._types[col] === "number" &&
          typeof value === "number" &&
          !isNaN(value)
        ) {
          agg.count++;
          agg.sum += value;
          agg.min = Math.min(agg.min, value);
          agg.max = Math.max(agg.max, value);
        }
        agg.values.push(value);
      });
    }

    const results = Array.from(newGroups.values()).map((group) => {
      const result = { ...group.keys };

      Object.entries(aggSpec).forEach(([col, aggs]) => {
        if (!Array.isArray(aggs)) aggs = [aggs];
        const agg = group.aggs[col];

        aggs.forEach((aggType) => {
          switch (aggType) {
            case "min":
              if (this._types[col] === "number") {
                result[`${col}_min`] = agg.min !== Infinity ? agg.min : null;
              }
              break;
            case "max":
              if (this._types[col] === "number") {
                result[`${col}_max`] = agg.max !== -Infinity ? agg.max : null;
              }
              break;
            case "mean":
              if (this._types[col] === "number") {
                result[`${col}_mean`] =
                  agg.count > 0 ? agg.sum / agg.count : null;
              }
              break;
            case "sum":
              if (this._types[col] === "number") {
                result[`${col}_sum`] = agg.sum;
              }
              break;
            case "first":
              result[`${col}_first`] = agg.firstValue;
              break;
            case "last":
              result[`${col}_last`] = agg.lastValue;
              break;
          }
        });
      });

      return result;
    });

    return new DataFrame(results);
  }

  _isArrayLike(obj) {
    return (
      Array.isArray(obj) ||
      (ArrayBuffer.isView(obj) && !(obj instanceof DataView))
    );
  }

  _validateArrayObject(obj) {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Input must be an object containing arrays");
    }

    const lengths = new Set(
      Object.values(obj)
        .filter((val) => this._isArrayLike(val))
        .map((arr) => arr.length)
    );

    if (lengths.size === 0) {
      throw new Error("Object must contain at least one array");
    }

    if (lengths.size > 1) {
      throw new Error("All arrays must be of equal length");
    }

    return true;
  }

  _arrayObjectToTable(obj) {
    // Validate input
    this._validateArrayObject(obj);

    // Get array keys and length
    const keys = Object.keys(obj).filter((key) => this._isArrayLike(obj[key]));
    const length = obj[keys[0]].length;

    // Create array of objects
    return Array.from({ length }, (_, i) => {
      return keys.reduce((acc, key) => {
        // Convert TypedArray elements to regular numbers if they're finite
        acc[key] = Number.isFinite(obj[key][i])
          ? Number(obj[key][i])
          : obj[key][i];
        return acc;
      }, {});
    });
  }

  table(options = {}) {
    // Use the existing print method to get formatted data
    const tableData = this._arrayObjectToTable(this._data);
    return Inputs.table(tableData, options);
  }

  // Sorting method
  sort_values(column, ascending = true) {
    // Create index array and sort
    const indices = Array.from({ length: this._length }, (_, i) => i).sort(
      (a, b) => {
        const valA = this._data[column][a];
        const valB = this._data[column][b];
        return ascending ? valA - valB : valB - valA;
      }
    );

    // Reorder all columns based on sorted indices
    const sortedData = {};
    this._columns.forEach((col) => {
      sortedData[col] = indices.map((idx) => this._data[col][idx]);
    });

    return new DataFrame(sortedData);
  }

  // Correlation method
  corr(col1, col2) {
    // Check if columns exist
    if (!this._data[col1] || !this._data[col2]) {
      throw new Error(`One or both columns not found: ${col1}, ${col2}`);
    }

    // Get arrays
    let x = Array.from(this._data[col1]);
    let y = Array.from(this._data[col2]);

    // Ensure arrays are the same length
    if (x.length !== y.length) {
      throw new Error("Arrays must be of equal length");
    }

    // Convert values to numbers and handle NaN/null/undefined
    x = x.map((val) => Number(val));
    y = y.map((val) => Number(val));

    // Get pairs where both values are valid numbers
    const pairs = x
      .map((val, idx) => [val, y[idx]])
      .filter(
        ([a, b]) =>
          !isNaN(a) &&
          !isNaN(b) &&
          a !== null &&
          b !== null &&
          typeof a === "number" &&
          typeof b === "number"
      );

    // Need at least 2 pairs for correlation
    if (pairs.length < 2) {
      return NaN;
    }

    // Unzip the pairs
    const validX = pairs.map((p) => p[0]);
    const validY = pairs.map((p) => p[1]);

    // Calculate means
    const meanX = validX.reduce((sum, val) => sum + val, 0) / validX.length;
    const meanY = validY.reduce((sum, val) => sum + val, 0) / validY.length;

    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    // Calculate sums for correlation
    for (let i = 0; i < validX.length; i++) {
      const dx = validX[i] - meanX;
      const dy = validY[i] - meanY;
      sumXY += dx * dy;
      sumXX += dx * dx;
      sumYY += dy * dy;
    }

    // Check for zero variance
    if (sumXX === 0 || sumYY === 0) {
      return NaN;
    }

    // Return correlation coefficient
    return sumXY / Math.sqrt(sumXX * sumYY);
  }

  // correlation matrix
  corrMatrix() {
    // Get numeric columns
    const numericCols = this._columns.filter(
      (col) => this._types[col] === "number"
    );

    if (numericCols.length === 0) {
      throw new Error("No numeric columns found for correlation matrix");
    }

    // Initialize result object
    const correlations = {};

    // Calculate correlations for each pair of columns
    numericCols.forEach((col1) => {
      correlations[col1] = {};

      numericCols.forEach((col2) => {
        // For matching columns, correlation is 1
        if (col1 === col2) {
          correlations[col1][col2] = 1;
        } else {
          // Use existing corr method for other pairs
          correlations[col1][col2] = this.corr(col1, col2);
        }
      });
    });

    // Convert to DataFrame format
    const matrixData = {};
    numericCols.forEach((col) => {
      matrixData[col] = numericCols.map(
        (otherCol) => correlations[col][otherCol]
      );
    });

    return new DataFrame(matrixData);
  }

  describe() {
    const describeData = {
      column: [],
      count: [],
      mean: [],
      std: [],
      min: [],
      "25%": [],
      "50%": [],
      "75%": [],
      max: [],
      mode: [],
      unique: [], // New field for number of unique values
      top: [], // New field for most common value
      freq: [], // New field for frequency of most common value
      categories: [], // Now will be a string summary instead of nested DataFrame
    };

    // Get numeric columns
    const numericColumns = this._columns.filter(
      (col) => this._types[col] === "number"
    );

    // Calculate percentiles once for efficiency
    const percentiles = {
      "25%": this.percentile(0.25, numericColumns),
      "50%": this.percentile(0.5, numericColumns),
      "75%": this.percentile(0.75, numericColumns),
    };

    numericColumns.forEach((col) => {
      const values = Array.from(this._data[col])
        .filter((v) => typeof v === "number" && !isNaN(v))
        .sort((a, b) => a - b);

      if (values.length > 0) {
        // Calculate mean
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        // Calculate standard deviation
        const std = Math.sqrt(
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            values.length
        );

        describeData.column.push(col);
        describeData.count.push(values.length);
        describeData.mean.push(mean);
        describeData.std.push(std);
        describeData.min.push(values[0]);
        describeData["25%"].push(percentiles["25%"][col]);
        describeData["50%"].push(percentiles["50%"][col]);
        describeData["75%"].push(percentiles["75%"][col]);
        describeData.max.push(values[values.length - 1]);

        // For numeric columns, these are less relevant but included for consistency
        describeData.unique.push(new Set(values).size);
        describeData.top.push(null);
        describeData.freq.push(null);
        describeData.categories.push(null);

        // Mode calculation remains the same
        const valueCounts = new Map();
        values.forEach((val) => {
          valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
        });
        const mode = Array.from(valueCounts.entries()).reduce((a, b) =>
          b[1] > a[1] ? b : a
        )[0];
        describeData.mode.push(mode);
      }
    });

    // Handle non-numeric columns
    const nonNumericColumns = this._columns.filter(
      (col) => this._types[col] !== "number"
    );

    nonNumericColumns.forEach((col) => {
      const validValues = Array.from(this._data[col]).filter((v) => v != null);

      const valueCounts = new Map();
      validValues.forEach((val) => {
        valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
      });

      // Sort value counts
      const sortedValCounts = Array.from(valueCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      if (sortedValCounts.length > 0) {
        const topValue = sortedValCounts[0];
        const uniqueCount = valueCounts.size;

        // Create a summary of top categories (limit to top 5)
        const topCategories = sortedValCounts
          .slice(0, 5)
          .map(
            ([category, count]) =>
              `${category}: ${((count / validValues.length) * 100).toFixed(1)}%`
          )
          .join(", ");

        describeData.column.push(col);
        describeData.count.push(validValues.length);
        describeData.mean.push(null);
        describeData.std.push(null);
        describeData.min.push(null);
        describeData["25%"].push(null);
        describeData["50%"].push(null);
        describeData["75%"].push(null);
        describeData.max.push(null);
        describeData.mode.push(topValue[0]); // Most frequent value
        describeData.unique.push(uniqueCount);
        describeData.top.push(topValue[0]);
        describeData.freq.push(topValue[1]);
        describeData.categories.push(topCategories);
      }
    });

    return new DataFrame(describeData);
  }
  setType(column, type) {
    if (!this._data[column]) {
      throw new Error(`Column ${column} not found`);
    }

    this._types[column] = type;
    this._castColumn(column);
    return this;
  }

  _castColumn(column) {
    const type = this._types[column];
    const values = this._data[column];

    if (type === "date") {
      const parseTime = d3.isoParse;
      const formatTime = d3.timeFormat("%Y-%m-%d");
      this._data[column] = values.map((v) => formatTime(parseTime(v)));
    } else if (type === "number") {
      this._data[column] = new Float64Array(values.map(Number));
    } else {
      this._data[column] = values.map(String);
    }
  }

  setTypes(typeMap) {
    Object.entries(typeMap).forEach(([col, type]) => {
      this.setType(col, type);
    });
    return this;
  }

  corrPlot({
    width = 300,
    height = 300,
    marginRight = 100,
    marginLeft = 100,
    marginBottom = 20,
    marginTop = 20,
    padding = 0,
    scheme = "greens",
    domain = [-1, 1],
    decimals = 2,
    inset = 0.5,
    grid = true,
  } = {}) {
    const corrMatrix = this.corrMatrix();
    const columns = corrMatrix._columns;

    const fillScale = d3
      .scaleSequential(
        scheme === "greens"
          ? d3.interpolateGreens
          : d3[`interpolate${scheme.charAt(0).toUpperCase()}${scheme.slice(1)}`]
      )
      .domain([0, 1]);

    function colorContrastFor(correlation) {
      const normalizedCorr = (correlation + 1) / 2;
      const color = d3.hcl(fillScale(normalizedCorr));
      return color.l > 60 ? "black" : "white";
    }

    const plotData = [];
    columns.forEach((col1, i) => {
      columns.forEach((col2, j) => {
        plotData.push({
          x: col1,
          y: col2,
          correlation: corrMatrix._data[col1][j],
        });
      });
    });

    return Plot.plot({
      width: width,
      height: height,
      padding: padding,
      marginLeft: marginLeft,
      marginRight: marginRight,
      marginTop: marginTop,
      marginBottom: marginBottom,
      grid: grid,
      aspectRatio: 1, // Force square aspect ratio
      x: {
        axis: "top",
        label: null,
        tickRotate: -45,
        domain: columns,
      },
      y: {
        label: null,
        tickRotate: 0,
        domain: columns,
      },
      color: {
        type: "linear",
        scheme,
        domain,
        legend: true,
      },
      marks: [
        Plot.cell(plotData, {
          x: "x",
          y: "y",
          fill: "correlation",
          inset: inset,
        }),
        Plot.text(plotData, {
          x: "x",
          y: "y",
          text: (d) => d.correlation.toFixed(decimals),
          fill: (d) => colorContrastFor(d.correlation),
        }),
      ],
    });
  }

  // Ensure the percentile method is correct
  percentile(p, columns = null) {
    // If no specific columns provided, use all numeric columns
    if (columns === null) {
      columns = this._columns.filter((col) => this._types[col] === "number");
    }

    // Ensure columns is an array
    if (typeof columns === "string") {
      columns = [columns];
    }

    // Validate input
    columns.forEach((col) => {
      if (this._types[col] !== "number") {
        throw new Error(`Column '${col}' is not numeric`);
      }
    });

    // If calculating for a single column, return a single value
    if (columns.length === 1) {
      const col = columns[0];
      const values = Array.from(this._data[col])
        .filter((v) => typeof v === "number" && !isNaN(v))
        .sort((a, b) => a - b);

      if (values.length === 0) return null;
      if (values.length === 1) return values[0];

      const position = (values.length - 1) * p;
      const base = Math.floor(position);
      const rest = position - base;

      if (base + 1 < values.length) {
        return values[base] + rest * (values[base + 1] - values[base]);
      }

      return values[base];
    }

    // If multiple columns, return an object with results
    const results = {};
    columns.forEach((col) => {
      const values = Array.from(this._data[col])
        .filter((v) => typeof v === "number" && !isNaN(v))
        .sort((a, b) => a - b);

      if (values.length === 0) {
        results[col] = null;
        return;
      }

      if (values.length === 1) {
        results[col] = values[0];
        return;
      }

      const position = (values.length - 1) * p;
      const base = Math.floor(position);
      const rest = position - base;

      if (base + 1 < values.length) {
        results[col] = values[base] + rest * (values[base + 1] - values[base]);
      } else {
        results[col] = values[base];
      }
    });

    return results;
  }

  // Normalize aggregation specification
  _normalizeAggSpec(spec) {
    const normalized = {};

    if (typeof spec === "string") {
      this._columns.forEach((col) => {
        if (this._types[col] === "number") {
          normalized[col] = [{ name: spec, func: spec }];
        }
      });
    } else if (Array.isArray(spec)) {
      this._columns.forEach((col) => {
        if (this._types[col] === "number") {
          normalized[col] = spec.map((f) => ({ name: f, func: f }));
        }
      });
    } else if (typeof spec === "object") {
      Object.entries(spec).forEach(([key, value]) => {
        if (typeof value === "string") {
          normalized[key] = [{ name: value, func: value }];
        } else if (Array.isArray(value)) {
          normalized[key] = value.map((f) =>
            typeof f === "string"
              ? { name: f, func: f }
              : { name: `agg_${key}`, func: f.toString(), isCustom: true }
          );
        } else if (typeof value === "function") {
          normalized[key] = [
            {
              name: `agg_${key}`,
              func: value.toString(),
              isCustom: true,
            },
          ];
        }
      });
    }

    return normalized;
  }

  // Performant group by implementation
  _performGroupBy(groupByColumns, aggregations) {
    const groups = new Map();

    for (let i = 0; i < this._length; i++) {
      const key = groupByColumns.map((col) => this._data[col][i]).join("_");

      if (!groups.has(key)) {
        groups.set(key, {
          count: 0,
          aggregates: {},
        });
      }

      const group = groups.get(key);
      group.count++;

      for (const [col, funcs] of Object.entries(aggregations)) {
        const val = this._data[col][i];

        if (!group.aggregates[col]) {
          group.aggregates[col] = {
            sum: 0,
            sumSq: 0,
            min: val,
            max: val,
          };
        }

        const agg = group.aggregates[col];
        agg.sum += val;
        agg.sumSq += val * val;
        agg.min = Math.min(agg.min, val);
        agg.max = Math.max(agg.max, val);
      }
    }

    return Array.from(groups.entries()).map(([key, groupData]) => {
      const result = {};
      const keyValues = key.split("_");

      groupByColumns.forEach((col, i) => {
        result[col] =
          this._types[col] === "number" ? Number(keyValues[i]) : keyValues[i];
      });

      for (const [col, agg] of Object.entries(groupData.aggregates)) {
        result[`${col}_sum`] = agg.sum;
        result[`${col}_mean`] = agg.sum / groupData.count;
        result[`${col}_min`] = agg.min;
        result[`${col}_max`] = agg.max;
      }

      return result;
    });
  }

  // Basic iteration methods
  *[Symbol.iterator]() {
    for (let i = 0; i < this._length; i++) {
      const row = {};
      this._columns.forEach((col) => {
        row[col] = this._data[col][i];
      });
      yield row;
    }
  }

  // Improved iterrows - yields [index, row] pairs like pandas
  *iterrows() {
    for (let i = 0; i < this._length; i++) {
      const row = {};
      this._columns.forEach((col) => {
        row[col] = this._data[col][i];
      });
      yield [i, row];
    }
  }

  // Improved itertuples - similar to pandas namedtuples
  *itertuples(name = "Row") {
    for (let i = 0; i < this._length; i++) {
      const tuple = { Index: i };
      this._columns.forEach((col) => {
        // Remove special characters and spaces from column names
        const safeName = col.replace(/[^a-zA-Z0-9]/g, "_");
        tuple[safeName] = this._data[col][i];
      });
      yield tuple;
    }
  }

  // Add items() like pandas - yields [column, values] pairs
  *items() {
    for (const col of this._columns) {
      yield [col, this._data[col]];
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this._length; i++) {
      const row = {};
      this._columns.forEach((col) => {
        row[col] = this._data[col][i];
      });
      yield row;
    }
  }

  // Python's itertuples() equivalent
  *itertuples(name = "Row") {
    for (let i = 0; i < this._length; i++) {
      const tuple = { index: i };
      this._columns.forEach((col) => {
        tuple[col] = this._data[col][i];
      });

      // Add a name property that doesn't show up in iteration
      Object.defineProperty(tuple, "name", {
        value: name,
        enumerable: false,
      });

      yield tuple;
    }
  }

  // Print method
  print(options = {}) {
    const { max_rows = 10, max_cols = null, precision = 2 } = options;

    const columns = max_cols ? this._columns.slice(0, max_cols) : this._columns;
    const rows = [];

    const displayRows = Math.min(this._length, max_rows);

    for (let i = 0; i < displayRows; i++) {
      const row = {};
      columns.forEach((col) => {
        const value = this._data[col][i];
        row[col] =
          typeof value === "number" ? Number(value.toFixed(precision)) : value;
      });
      rows.push(row);
    }

    if (this._length > max_rows) {
      rows.push({
        _note: `... ${this._length - max_rows} more rows ...`,
      });
    }

    return rows;
  }

  // Cleanup method to terminate workers
  terminate() {
    this._workers.forEach((worker) => worker.terminate());
    this._workers = [];
  }

  // Merge two DataFrames
  merge(
    other,
    { on = null, how = "inner", left_on = null, right_on = null } = {}
  ) {
    // Determine join columns
    const leftCols = left_on || on;
    const rightCols = right_on || on;

    if (!leftCols || !rightCols) {
      throw new Error("Must specify merge columns");
    }

    // Create lookup maps
    const leftMap = new Map();
    const rightMap = new Map();

    // Helper to create key from multiple columns
    const makeKey = (row, cols) =>
      Array.isArray(cols) ? cols.map((c) => row[c]).join("_") : row[cols];

    // Build indices
    for (let i = 0; i < this._length; i++) {
      const leftRow = {};
      this._columns.forEach((col) => (leftRow[col] = this._data[col][i]));
      const key = makeKey(leftRow, leftCols);
      if (!leftMap.has(key)) leftMap.set(key, []);
      leftMap.get(key).push(leftRow);
    }

    for (let i = 0; i < other._length; i++) {
      const rightRow = {};
      other._columns.forEach((col) => (rightRow[col] = other._data[col][i]));
      const key = makeKey(rightRow, rightCols);
      if (!rightMap.has(key)) rightMap.set(key, []);
      rightMap.get(key).push(rightRow);
    }

    // Perform join
    const results = [];
    const processMatch = (leftRow, rightRow) => {
      const result = { ...leftRow, ...rightRow };
      results.push(result);
    };

    switch (how) {
      case "inner":
        leftMap.forEach((leftRows, key) => {
          if (rightMap.has(key)) {
            leftRows.forEach((leftRow) =>
              rightMap
                .get(key)
                .forEach((rightRow) => processMatch(leftRow, rightRow))
            );
          }
        });
        break;

      case "left":
        leftMap.forEach((leftRows, key) => {
          if (rightMap.has(key)) {
            leftRows.forEach((leftRow) =>
              rightMap
                .get(key)
                .forEach((rightRow) => processMatch(leftRow, rightRow))
            );
          } else {
            leftRows.forEach((leftRow) => {
              const emptyRight = {};
              other._columns.forEach((col) => (emptyRight[col] = null));
              processMatch(leftRow, emptyRight);
            });
          }
        });
        break;

      // Add other join types as needed
    }

    return new DataFrame(results);
  }

  // Get column mean
  mean(columns = null) {
    if (!columns)
      columns = this._columns.filter((col) => this._types[col] === "number");
    if (typeof columns === "string") columns = [columns];

    const result = {};
    columns.forEach((col) => {
      if (this._types[col] === "number") {
        const values = Array.from(this._data[col]).filter((v) => !isNaN(v));
        result[col] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });
    return columns.length === 1 ? result[columns[0]] : result;
  }

  // Get column sum
  sum(columns = null) {
    if (!columns)
      columns = this._columns.filter((col) => this._types[col] === "number");
    if (typeof columns === "string") columns = [columns];

    const result = {};
    columns.forEach((col) => {
      if (this._types[col] === "number") {
        result[col] = Array.from(this._data[col])
          .filter((v) => !isNaN(v))
          .reduce((a, b) => a + b, 0);
      }
    });
    return columns.length === 1 ? result[columns[0]] : result;
  }

  // Value counts for a column
  value_counts(column) {
    const counts = new Map();
    this._data[column].forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    // Convert to DataFrame format
    const data = {
      value: Array.from(counts.keys()),
      count: Array.from(counts.values()),
    };
    return new DataFrame(data).sort_values("count", false);
  }

  // Fill missing values
  fillna(value) {
    const newData = {};
    this._columns.forEach((col) => {
      if (this._types[col] === "number") {
        newData[col] = Array.from(this._data[col], (v) =>
          isNaN(v) ? value : v
        );
      } else {
        newData[col] = Array.from(this._data[col], (v) =>
          v === null || v === undefined || v === "" ? value : v
        );
      }
    });
    return new DataFrame(newData);
  }

  // Apply function to column
  apply(column, func) {
    const newData = { ...this._data };
    newData[column] = Array.from(this._data[column], func);
    return new DataFrame(newData);
  }

  // Map values in a column
  map(column, mapper) {
    const newData = { ...this._data };
    newData[column] = Array.from(this._data[column], (v) => mapper[v] || v);
    return new DataFrame(newData);
  }

  // Drop columns
  drop(columns) {
    if (typeof columns === "string") columns = [columns];
    const newData = {};
    this._columns.forEach((col) => {
      if (!columns.includes(col)) {
        newData[col] = this._data[col];
      }
    });
    return new DataFrame(newData);
  }

  // Drop rows or columns with missing values
  dropna({ axis = 0, how = "any", subset = null, thresh = null } = {}) {
    // Validate parameters
    if (![0, 1, "index", "columns"].includes(axis)) {
      throw new Error("axis must be 0/'index' or 1/'columns'");
    }
    if (!["any", "all"].includes(how)) {
      throw new Error("how must be 'any' or 'all'");
    }

    const isRowAxis = axis === 0 || axis === "index";
    let columnsToCheck = subset
      ? Array.isArray(subset)
        ? subset
        : [subset]
      : this._columns;

    // Helper function to check if a value is missing
    const isMissing = (value, type) => {
      if (type === "number") {
        return (
          value === null ||
          value === undefined ||
          value === "" || // Consider empty strings as missing for numeric columns
          (typeof value === "number" && isNaN(value))
        );
      }
      return value === null || value === undefined || value === "";
    };

    if (isRowAxis) {
      // Drop rows
      const validIndices = [];

      for (let i = 0; i < this._length; i++) {
        let missingCount = 0;

        for (const col of columnsToCheck) {
          const value = this._data[col][i];
          if (isMissing(value, this._types[col])) {
            missingCount++;
          }
        }

        const shouldKeep =
          how === "any"
            ? missingCount === 0 // Keep if no missing values
            : missingCount < columnsToCheck.length; // Keep if not all values are missing

        if (shouldKeep) {
          validIndices.push(i);
        }
      }

      // Create new data object with only valid rows
      const newData = {};
      this._columns.forEach((col) => {
        if (this._types[col] === "number") {
          // For numeric columns, convert empty strings to NaN
          const values = validIndices.map((i) => {
            const val = this._data[col][i];
            return val === "" ? NaN : val;
          });
          newData[col] = new Float64Array(values);
        } else {
          newData[col] = validIndices.map((i) => this._data[col][i]);
        }
      });

      this._data = newData;
      this._length = validIndices.length;
    } else {
      // Drop columns
      const columnsToKeep = [];

      for (const col of this._columns) {
        if (!columnsToCheck.includes(col)) {
          columnsToKeep.push(col);
          continue;
        }

        let missingCount = 0;

        for (let i = 0; i < this._length; i++) {
          if (isMissing(this._data[col][i], this._types[col])) {
            missingCount++;
          }
        }

        const shouldKeep =
          how === "any" ? missingCount === 0 : missingCount < this._length;

        if (shouldKeep) {
          columnsToKeep.push(col);
        }
      }

      const newData = {};
      columnsToKeep.forEach((col) => {
        newData[col] = this._data[col];
      });

      this._data = newData;
      this._columns = columnsToKeep;
    }

    return this;
  }

  // Rename columns
  rename(columnMap) {
    const newData = {};
    this._columns.forEach((col) => {
      const newName = columnMap[col] || col;
      newData[newName] = this._data[col];
    });
    return new DataFrame(newData);
  }

  // Add new column
  assign(columnName, values) {
    const newData = { ...this._data };
    if (Array.isArray(values) || values instanceof Float64Array) {
      newData[columnName] = values;
    } else if (typeof values === "function") {
      // Allow function that takes row as input
      newData[columnName] = Array.from({ length: this._length }, (_, i) => {
        const row = {};
        this._columns.forEach((col) => (row[col] = this._data[col][i]));
        return values(row);
      });
    }
    return new DataFrame(newData);
  }

  // Add basic mathematical operations
  add(other) {
    const result = {};
    this._columns.forEach((col) => {
      if (this._types[col] === "number") {
        if (typeof other === "number") {
          // Scalar addition
          result[col] = Array.from(this._data[col], (v) => v + other);
        } else if (other instanceof DataFrame) {
          // DataFrame addition
          result[col] = Array.from(
            this._data[col],
            (v, i) => v + other._data[col][i]
          );
        }
      } else {
        result[col] = this._data[col];
      }
    });
    return new DataFrame(result);
  }

  sub(other) {
    const result = {};
    this._columns.forEach((col) => {
      if (this._types[col] === "number") {
        if (typeof other === "number") {
          result[col] = Array.from(this._data[col], (v) => v - other);
        } else if (other instanceof DataFrame) {
          result[col] = Array.from(
            this._data[col],
            (v, i) => v - other._data[col][i]
          );
        }
      } else {
        result[col] = this._data[col];
      }
    });
    return new DataFrame(result);
  }

  mul(other) {
    const result = {};
    this._columns.forEach((col) => {
      if (this._types[col] === "number") {
        if (typeof other === "number") {
          result[col] = Array.from(this._data[col], (v) => v * other);
        } else if (other instanceof DataFrame) {
          result[col] = Array.from(
            this._data[col],
            (v, i) => v * other._data[col][i]
          );
        }
      } else {
        result[col] = this._data[col];
      }
    });
    return new DataFrame(result);
  }

  div(other) {
    const result = {};
    this._columns.forEach((col) => {
      if (this._types[col] === "number") {
        if (typeof other === "number") {
          result[col] = Array.from(this._data[col], (v) => v / other);
        } else if (other instanceof DataFrame) {
          result[col] = Array.from(
            this._data[col],
            (v, i) => v / other._data[col][i]
          );
        }
      } else {
        result[col] = this._data[col];
      }
    });
    return new DataFrame(result);
  }
}

// Function to generate test data of arbitrary size
export function generateTestData(size) {
  const data = [];
  const regions = ["North", "South", "East", "West", "Central"];
  const names = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Iota",
    "Kappa",
  ];

  for (let i = 0; i < size; i++) {
    data.push({
      name: names[Math.floor(Math.random() * names.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      population: Math.floor(Math.random() * 1000000),
      lifeExpectancy: 60 + Math.random() * 30,
    });
  }

  return data;
}

export async function runTest(size) {
  try {
    // Generate data
    console.log(`Testing with ${size.toLocaleString()} rows...`);
    const data = generateTestData(size);
    const df = new DataFrame(data);
    let regularTime = "--";
    let concurrentTime = "--";
    let speedup = "--";
    let regularError = null;
    let concurrentError = null;

    try {
      // Test regular groupby
      console.log("Running regular groupby...");
      const startRegular = performance.now();
      const regularResult = df.groupby(["name", "region"]).agg({
        population: ["min", "mean", "max"],
        lifeExpectancy: ["mean"],
      });
      regularTime = `${(performance.now() - startRegular).toFixed(2)}ms`;
      console.log(`Regular groupby completed in ${regularTime}`);

      // Validate regular results
      if (!regularResult || !regularResult._data || !regularResult._columns) {
        throw new Error("Invalid regular groupby result structure");
      }
    } catch (error) {
      regularError = error;
      console.error("Regular groupby error:", error);
    }

    try {
      // Test concurrent groupby
      console.log("Running concurrent groupby...");
      const startConcurrent = performance.now();
      const concurrentResult = await df.concurrentGroupBy(["name", "region"], {
        population: ["min", "mean", "max"],
        lifeExpectancy: ["mean"],
      });
      concurrentTime = `${(performance.now() - startConcurrent).toFixed(2)}ms`;
      console.log(`Concurrent groupby completed in ${concurrentTime}`);

      // Validate concurrent results
      if (
        !concurrentResult ||
        !concurrentResult._data ||
        !concurrentResult._columns
      ) {
        throw new Error("Invalid concurrent groupby result structure");
      }

      // Calculate speedup only if both operations succeeded
      if (regularTime !== "--") {
        const regTime = parseFloat(regularTime);
        const concTime = parseFloat(concurrentTime);
        speedup = `${(regTime / concTime).toFixed(2)}x`;
      }
    } catch (error) {
      concurrentError = error;
      console.error("Concurrent groupby error:", error);
    }

    // Return detailed results
    return {
      rows: size.toLocaleString(),
      regularTime,
      concurrentTime,
      speedup,
      regularError: regularError ? regularError.message : null,
      concurrentError: concurrentError ? concurrentError.message : null,
    };
  } catch (error) {
    console.error(`Complete test failure for size ${size}:`, error);
    return {
      rows: size.toLocaleString(),
      regularTime: "--",
      concurrentTime: "--",
      speedup: "--",
      error: error.message,
    };
  }
}

// Modified comparePerformance function
export async function comparePerformance() {
  // Start with smaller sizes for testing
  const sizes = [1000, 10000, 100000, 1e6, 1e7];
  const results = [];

  for (const size of sizes) {
    console.log(`\nStarting test for ${size.toLocaleString()} rows...`);
    const result = await runTest(size);
    results.push(result);
    console.log("Test complete:", result);

    // Add delay between tests to allow cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return new DataFrame(results);
}
