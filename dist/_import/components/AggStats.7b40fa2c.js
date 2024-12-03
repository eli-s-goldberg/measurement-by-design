/* 
 -- EXAMPLE -- 
// Define dimensions
const dimensions = ["Region","PlanType","Diagnosis","SmokingStatus"]

// Create Custom
const metrics = [
  // Sum of all imaging visits
  ...createIntMetric('ImagingVisits', {
    header: 'Total Imaging Visits',
    aggregation: 'sum'
  }),
  
  // Count of patients
  ...createIntMetric('PatientID', {
    header: 'Patient Count',
    aggregation: 'count'
  }),
  
  // Average age (rounded to whole number)
  ...createIntMetric('Age', {
    header: 'Average Age',
    aggregation: 'average'
  }),
  
  // Maximum BMI (to 1 decimal place)
  ...createFloatMetric('BMI', {
    header: 'Max BMI',
    aggregation: 'max',
    precision: 1
  }),
  
  // Sum of costs (to 2 decimal places)
  ...createFloatMetric('Cost', {
    header: 'Total Cost',
    aggregation: 'sum',
    precision: 2,
    format: v => `$${v.toFixed(2)}`
  })
];


// Get results
const results = aggregateData(data, dimensions, metrics)

const headersDict = results.columns.reduce((acc, c) => {
  acc[c.id] = c.name;
  return acc;
}, {});

view(headersDict)

const table = Inputs.table(results.data, {
  columns: results.columns.map(c => c.id), 
  header: headersDict, 
      rows: 18, // Number of rows displayed at once
  maxWidth: 1000, // Maximum width of the table
  multiple: false, // Single row selection
  layout: "auto" // Auto table layout
});

view(table);
*/

export const MetricFactory = {
    multiclass: (field, classes, {label, includeRates = false, format, rateFormat} = {}) => {
      const metrics = classes.map(cls => ({
        name: `${field}_${cls}`.toLowerCase(),
        header: `${label || field} - ${cls}`,
        calculate: rows => rows.filter(r => r[field] === cls).length,
        rollup: 'sum',
        format: format || (v => v.toLocaleString())
      }));
  
      if (includeRates) {
        metrics.push(...classes.map(cls => ({
          name: `${field}_${cls}_rate`.toLowerCase(),
          header: `${label || field} - ${cls} Rate`,
          calculate: rows => rows.filter(r => r[field] === cls).length / (rows.length || 1),
          rollup: 'average',
          format: rateFormat || (v => (v * 100).toFixed(1) + '%')
        })));
      }
      return metrics;
    },
  
    rate: (field, condition, {header, format} = {}) => [{
      name: `${field}_rate`.toLowerCase(),
      header: header || `${field} Rate`,
      calculate: rows => rows.filter(condition).length / (rows.length || 1),
      rollup: 'average',
      format: format || (v => (v * 100).toFixed(1) + '%')
    }]
  };

  function formatText(text) {
    // Convert camelCase or snake_case to Title Case
    return text
      .replace(/([A-Z])/g, ' $1') // handle camelCase
      .split(/[_\s]+/) // split on underscore or space
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
  

  export function createMulticlassMetric(field, classes, {label, includeRates = false, format, rateFormat} = {}) {
    const formattedField = formatText(field);
    const metrics = classes.map(cls => ({
      name: `${field}_${cls}`.toLowerCase(),
      header: `${label || formattedField}: ${formatText(cls)}`,
      calculate: rows => rows.filter(r => r[field] === cls).length,
      rollup: 'sum',
      format: format || (v => v.toLocaleString())
    }));
  
    if (includeRates) {
      metrics.push(...classes.map(cls => ({
        name: `${field}_${cls}_rate`.toLowerCase(),
        header: `${label || formattedField}: ${formatText(cls)} (%)`,
        calculate: rows => rows.filter(r => r[field] === cls).length / (rows.length || 1),
        rollup: 'average',
        format: rateFormat || (v => (v * 100).toFixed(1) + '%')
      })));
    }
    return metrics;
  }
  
  const aggregations = {
    sum: (values) => values.reduce((a, b) => a + b, 0),
    average: (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
    count: (values) => values.length,
    max: (values) => Math.max(...values),
    min: (values) => Math.min(...values)
  };
  
  export function createIntMetric(field, {
    header,
    aggregation = 'average', // can be 'sum', 'average', 'count', 'max', 'min'
    weightedAverage = false,
    format
  } = {}) {
    return [{
      name: `${field}_${aggregation}`.toLowerCase(),
      header: header || `${field} (${aggregation})`,
      calculate: rows => {
        const values = rows.map(r => parseInt(r[field])).filter(v => !isNaN(v));
        const result = aggregations[aggregation](values);
        return aggregation === 'average' ? Math.round(result) : result;
      },
      rollup: weightedAverage ? (children) => {
        const totalCount = children.reduce((sum, child) => sum + child.value, 0);
        const weightedSum = children.reduce(
          (sum, child) => sum + (child[`${field}_${aggregation}`.toLowerCase()] * child.value), 
          0
        );
        return totalCount > 0 ? Math.round(weightedSum / totalCount) : 0;
      } : aggregation,
      format: format || (v => v.toLocaleString())
    }];
  }
  
  export function createFloatMetric(field, {
    header,
    aggregation = 'average', // can be 'sum', 'average', 'count', 'max', 'min'
    precision = 2,
    weightedAverage = false,
    format
  } = {}) {
    return [{
      name: `${field}_${aggregation}`.toLowerCase(),
      header: header || `${field} (${aggregation})`,
      calculate: rows => {
        const values = rows.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
        return aggregations[aggregation](values);
      },
      rollup: weightedAverage ? (children) => {
        const totalCount = children.reduce((sum, child) => sum + child.value, 0);
        const weightedSum = children.reduce(
          (sum, child) => sum + (child[`${field}_${aggregation}`.toLowerCase()] * child.value), 
          0
        );
        return totalCount > 0 ? weightedSum / totalCount : 0;
      } : aggregation,
      format: format || (v => v.toFixed(precision))
    }];
  }

  export function createRateMetric(field, condition, {header, format} = {}) {
    const formattedField = formatText(field);
    return [{
      name: `${field}_rate`.toLowerCase(),
      header: header || `${formattedField} Rate`,
      calculate: rows => rows.filter(condition).length / (rows.length || 1),
      rollup: 'average',
      format: format || (v => (v * 100).toFixed(1) + '%')
    }];
  }
  
  // this will need to be edited to suit your situation, else use custom. 
  export function createDemographicMetrics() {
    return [
      ...createMulticlassMetric("IncomeBracket", ["low", "medium", "high"], {
        label: "Income Level",
        includeRates: true
      }),
      ...createMulticlassMetric("Gender", ["Female", "Male"], {
        includeRates: true
      }),
      ...createRateMetric("PrimaryCareEngagement", 
        row => row.PrimaryCareEngagement === "Yes", 
        { header: "Primary Care Engagement Rate" }
      )
    ];
  }

  // Main aggregation function
  export function aggregateData(data, dimensions, metrics) {
    const hierarchyResult = createHierarchy(data, dimensions, metrics);
    const tableData = hierarchyToTable(hierarchyResult, metrics)
      .sort((a, b) => a.path.localeCompare(b.path));
  
    const columnsConfig = [
      { 
        id: 'path',
        name: 'Path',
        accessor: d => d.path 
      },
      { 
        id: 'value',
        name: 'Count',
        accessor: d => d.value 
      },
      // Metric columns with formatted headers
      ...metrics.map(m => ({
        id: m.name,
        name: m.header || formatText(m.name),
        accessor: d => d[m.name]
      })),
      // Dimension columns with formatted headers
      ...dimensions.map((d, i) => ({
        id: `level${i}`,
        name: formatText(d),
        accessor: row => row[`level${i}`]
      }))
    ];
  
    return {
      data: tableData,
      columns: columnsConfig
    };
  }
  
  export function createDefaultMetrics() {
    return [
      ...MetricFactory.multiclass("IncomeBracket", ["low", "medium", "high"], {
        label: "Income",
        includeRates: true
      }),
      ...MetricFactory.multiclass("Gender", ["Female", "Male"], {
        includeRates: true
      }),
      ...MetricFactory.rate("PrimaryCareEngagement", 
        row => row.PrimaryCareEngagement === "Yes", 
        { header: "PCP Engagement Rate" }
      )
    ];
  }

  // Helper functions
  function createHierarchy(data, dimensions, metrics) {
    const root = { name: "", children: [] };
    
    function addToHierarchy(node, row, depth) {
      if (depth >= dimensions.length) return;
      const value = row[dimensions[depth]];
      if (value === undefined) return;
      
      let child = node.children.find(c => c.name === value);
      if (!child) {
        child = { name: value, children: [], _rows: [] };
        node.children.push(child);
      }
      child._rows.push(row);
      addToHierarchy(child, row, depth + 1);
    }
  
    const validData = data.filter(row => 
      dimensions.every(dim => row[dim] !== undefined)
    );
    
    validData.forEach(row => addToHierarchy(root, row, 0));
    calculateMetrics(root, metrics);
    return root;
  }
  
  function calculateMetrics(node, metrics) {
    if (node._rows) {
      node.value = node._rows.length;
      metrics.forEach(metric => {
        node[metric.name] = metric.calculate(node._rows);
      });
      delete node._rows;
    }
    
    if (node.children?.length) {
      node.children.forEach(child => calculateMetrics(child, metrics));
      if (!node.value) {
        node.value = node.children.reduce((sum, child) => sum + child.value, 0);
        metrics.forEach(metric => {
          if (metric.rollup === 'sum') {
            node[metric.name] = node.children.reduce(
              (sum, child) => sum + (child[metric.name] || 0), 0
            );
          } else if (metric.rollup === 'average') {
            const total = node.children.reduce(
              (sum, child) => sum + (child[metric.name] || 0), 0
            );
            node[metric.name] = total / node.children.length;
          }
        });
      }
    }
  }
  
  function hierarchyToTable(root, metrics, level = 0, parentPath = [], results = []) {
    if (root.name === "" && root.children) {
      root.children.forEach(child => 
        hierarchyToTable(child, metrics, level, parentPath, results)
      );
      return results;
    }
  
    const currentPath = [...parentPath, root.name];
    const row = {
      level,
      path: currentPath.join(" > "),
      name: root.name,
      value: root.value || 0
    };
  
    metrics.forEach(metric => {
      row[metric.name] = metric.format ? 
        metric.format(root[metric.name]) : 
        root[metric.name];
    });
  
    currentPath.forEach((value, index) => {
      row[`level${index}`] = value;
    });
  
    results.push(row);
    
    if (root.children) {
      root.children.forEach(child => 
        hierarchyToTable(child, metrics, level + 1, currentPath, results)
      );
    }
  
    return results;
  }

  // Let's go for more basic EDA stats
// Helper functions for statistics
function calculateStats(values) {
    let sum = 0;
    let min = values[0];
    let max = values[0];
    
    // Single pass for sum, min, max
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      sum += val;
      if (val < min) min = val;
      if (val > max) max = val;
    }
    
    const mean = sum / values.length;
    
    // Sort only once for quartiles
    const sorted = [...values].sort((a, b) => a - b);
    const getPercentile = (p) => sorted[Math.floor(sorted.length * p)];
    
    return {
      count: values.length,
      min,
      max,
      mean,
      median: getPercentile(0.5),
      q1: getPercentile(0.25),
      q3: getPercentile(0.75)
    };
  }
  
  function getCategoryDistribution(data, field) {
    const counts = {};
    const total = data.length;
    
    // Count frequencies
    data.forEach(row => {
      const val = row[field];
      counts[val] = (counts[val] || 0) + 1;
    });
    
    // Convert to array and calculate percentages
    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / total * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.count - a.count);
  }
  
  export function describeData(data) {
    // Early return if no data
    if (!data || data.length === 0) {
      return { error: "No data provided" };
    }
  
    // Basic dataset information
    const sampleRow = data[0];
    const fields = Object.keys(sampleRow);
    
    // Analyze field types and collect unique values in a single pass
    const fieldInfo = {};
    const uniqueValues = {};
    const missingCounts = {};
    
    fields.forEach(field => {
      uniqueValues[field] = new Set();
      missingCounts[field] = 0;
    });
    
    // First pass - collect types and unique values
    data.forEach(row => {
      fields.forEach(field => {
        const value = row[field];
        if (value === null || value === undefined) {
          missingCounts[field]++;
        } else {
          uniqueValues[field].add(value);
        }
      });
    });
    
    // Analyze each field
    const fieldAnalysis = {};
    fields.forEach(field => {
      const uniqueSet = uniqueValues[field];
      const isNumeric = typeof data[0][field] === 'number';
      
      fieldAnalysis[field] = {
        type: isNumeric ? 'numeric' : 'categorical',
        uniqueCount: uniqueSet.size,
        missingCount: missingCounts[field]
      };
      
      if (isNumeric) {
        const values = data.map(d => d[field]).filter(d => !isNaN(d));
        fieldAnalysis[field] = {
          ...fieldAnalysis[field],
          ...calculateStats(values)
        };
      } else {
        fieldAnalysis[field].distribution = getCategoryDistribution(data, field);
      }
    });
  
    return {
      basicInfo: {
        totalRows: data.length,
        totalColumns: fields.length,
        fields: fields
      },
      fieldAnalysis
    };
  }
  
  export function formatDescription(analysisResult) {
    if (!analysisResult || analysisResult.error) {
      return analysisResult?.error || 'Invalid analysis result';
    }
  
    const {basicInfo, fieldAnalysis} = analysisResult;
    
    let description = `Dataset Overview:
  - Total Records: ${basicInfo.totalRows.toLocaleString()}
  - Total Fields: ${basicInfo.totalColumns}
  - Fields: ${basicInfo.fields.join(', ')}
  
  Field Analysis:\n`;
  
    Object.entries(fieldAnalysis).forEach(([field, analysis]) => {
      description += `\n${field}:
  - Type: ${analysis.type}
  - Unique Values: ${analysis.uniqueCount}
  - Missing Values: ${analysis.missingCount}`;
  
      if (analysis.type === 'numeric') {
        description += `
  - Range: ${analysis.min.toLocaleString()} to ${analysis.max.toLocaleString()}
  - Mean: ${analysis.mean.toFixed(2)}
  - Median: ${analysis.median.toLocaleString()}
  - Q1: ${analysis.q1.toLocaleString()}, Q3: ${analysis.q3.toLocaleString()}`;
      } else {
        description += `\nDistribution (top 5):
  ${analysis.distribution
    .slice(0, 5)
    .map(d => `  - ${d.value}: ${d.count.toLocaleString()} (${d.percentage})`)
    .join('\n')}`;
      }
    });
  
    return description;
  }
  function calculateNumericStats(values) {
    let sum = 0;
    let min = values[0];
    let max = values[0];
    
    // First pass for mean
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      if (val < min) min = val;
      if (val > max) max = val;
      sum += val;
    }
    
    const mean = sum / values.length;
    const mid = Math.floor(values.length / 2);
    const median = values[mid];
    
    // Second pass for standard deviation
    let sumSquares = 0;
    for (let i = 0; i < values.length; i++) {
      const diff = values[i] - mean;
      sumSquares += diff * diff;
    }
    const stdDev = Math.sqrt(sumSquares / values.length);
    
    return { min, max, mean, median, stdDev };
  }
  
  function formatTopValues(valueCounts, totalCount) {
    return Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([value, count]) => 
        `${value} (${((count/totalCount)*100).toFixed(1)}%)`
      )
      .join(', ');
  }
  
  function getTableDescription(data) {
    if (!data || data.length === 0) {
      return { error: "No data provided" };
    }
  
    const fields = Object.keys(data[0]);
    const rows = [];
  
    fields.forEach(field => {
      const valueCounts = {};
      let uniqueValues = new Set();
      let missingCount = 0;
      const isNumeric = typeof data[0][field] === 'number';
      const validValues = [];
  
      for (let i = 0; i < data.length; i++) {
        const value = data[i][field];
        
        if (value === null || value === undefined) {
          missingCount++;
          continue;
        }
  
        uniqueValues.add(value);
        
        if (isNumeric) {
          if (!isNaN(value)) {
            validValues.push(value);
          }
        } else {
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        }
      }
  
      let row = {
        field_name: field,
        data_type: isNumeric ? 'numeric' : 'categorical',
        unique_values: uniqueValues.size,
        completeness: `${((1 - missingCount / data.length) * 100).toFixed(1)}%`
      };
  
      if (isNumeric && validValues.length > 0) {
        const stats = calculateNumericStats(validValues);
        row = {
          ...row,
          min_value: stats.min.toLocaleString(),
          max_value: stats.max.toLocaleString(),
          mean_value: stats.mean.toFixed(1),
          median_value: stats.median.toLocaleString(),
          value_distribution: `σ = ${stats.stdDev.toFixed(2)}`
        };
      } else {
        const topValues = formatTopValues(valueCounts, data.length);
        const uniqueCount = uniqueValues.size;
        
        row = {
          ...row,
          min_value: '-',
          max_value: '-',
          mean_value: '-',
          median_value: '-',
          value_distribution: `${topValues}`
        };
      }
  
      rows.push(row);
    });
  
    return rows;
  }
  
  export function createDataSummary(data) {
    return {
      data: getTableDescription(data),
      columns: [
        { field: 'field_name', header: 'Field' },
        { field: 'data_type', header: 'Type' },
        { field: 'unique_values', header: 'Unique Values' },
        { field: 'completeness', header: 'Completeness' },
        { field: 'min_value', header: 'Min' },
        { field: 'max_value', header: 'Max' },
        { field: 'mean_value', header: 'Mean' },
        { field: 'median_value', header: 'Median' },
        { field: 'value_distribution', header: 'Distribution/Top Values' }
      ]
    };
  }