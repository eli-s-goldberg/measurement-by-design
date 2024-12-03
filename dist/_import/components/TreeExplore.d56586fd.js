
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Scale formatting utility
function formatNumber(value, scale = 'none'){
  const scales = {
    'none': { divisor: 1, suffix: '' },
    'hundreds': { divisor: 100, suffix: 'H' },
    'thousands': { divisor: 1000, suffix: 'K' },
    'millions': { divisor: 1000000, suffix: 'M' },
    'billions': { divisor: 1000000000, suffix: 'B' }
  };

  const { divisor, suffix } = scales[scale] || scales.none;
  const scaledValue = (value / divisor).toLocaleString(undefined, { 
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  
  return `${scaledValue}${suffix}`;
};

export { formatNumber };




export function createTreeWithStats(data, columnOrder, columnMapper, stroke_width_divisor = 100) {

  const columnMap = columnMapper
  const mainContainer = document.createElement('div');
  mainContainer.style.display = 'flex';
  mainContainer.style.flexDirection = 'column';
  mainContainer.style.gap = '20px';
  mainContainer.style.height = '100%';
  mainContainer.style.width = '90%'; // Added to ensure full width
  
  const statsContainer = document.createElement('div');
  statsContainer.style.padding = '10px';
  statsContainer.style.backgroundColor = '#f5f5f5';
  statsContainer.style.borderRadius = '5px';
  statsContainer.style.display = 'none';
  statsContainer.style.width = '100%'; // Added to ensure full width
  
  function updateStats(d) {
    const formatNumber = num => num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const formatPercent = num => (num * 100).toFixed(1) + '%';
    
    statsContainer.style.display = 'block';
    statsContainer.innerHTML = `
      <div style="width: 100%; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 18px; min-width: 600px;">
          <tr style="background-color: #e0e0e0;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd; width: 50%;">Metric</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd; width: 50%;">Value</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Node</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${d.data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Total Patients</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatNumber(d.data.value)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Total Imaging Visits</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatNumber(d.data.totalImagingVisits)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Non-Preferred Visits</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatNumber(d.data.nonPreferredVisits)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Non-Preferred Rate</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatPercent(d.data.nonPreferredRate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Imaging Visits per Patient</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(d.data.totalImagingVisits / d.data.value).toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  function clearStats() {
    statsContainer.style.display = 'none';
  }

  const hierarchicalData = createHierarchy(data, columnOrder, columnMap);
  const treeViz = createCollapsibleTree(hierarchicalData, 800, 1000, updateStats, clearStats, stroke_width_divisor);
  
  mainContainer.appendChild(treeViz);
  mainContainer.appendChild(statsContainer);
  
  return mainContainer;
}

// Create a collapsible tree with highlights in d3. 
function createCollapsibleTree(data, width = 800, height = 1000, updateStats, clearStats, stroke_width_divisor = 100) {
  const treeContainer = document.createElement('div');
  treeContainer.style.overflow = 'auto';
  treeContainer.style.height = '50%';

  // Keep track of selected node
  let selectedNode = null;

  const margin = { top: 10, right: 80, bottom: 10, left: 80 };
  const dx = 30;
  const dy = width / 6;

  const tree = d3.tree()
    .nodeSize([dx, dy])
    .separation((a, b) => (a.parent == b.parent ? 1 : 1.5));

  const diagonal = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const svg = d3.create("svg")
    .attr("viewBox", [-margin.left, -margin.top, width, height])
    // .style("font", "arial 8px sans-serif")
    .style("max-width", "800px")  // Set explicit max-width
    .style("width", "100%")       // Make it responsive
    .style("height", "auto")     // Maintain aspect ratio
    .style("user-select", "none");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 4);

  const gNode = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  const root = d3.hierarchy(data);

  root.x0 = height / 2;
  root.y0 = 0;

  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth > 0) d.children = null;
  });

  function getBranch(node) {
    const branch = [node];
    let current = node;
    while (current.parent) {
      branch.push(current.parent);
      current = current.parent;
    }
    return branch;
  }

  function highlightBranch(d, color = "red") {
    const branch = getBranch(d);
    const branchIds = new Set(branch.map(n => n.id));
    
    gNode.selectAll("g")
      .filter(n => branchIds.has(n.id))
      .select("circle")
      .attr("fill", color)
      .attr("r", 6);
    
    gLink.selectAll("path")
      .filter(l => branchIds.has(l.source.id) && branchIds.has(l.target.id))
      .attr("stroke", color)
      .attr("stroke-opacity", 1);
  }

  function resetHighlights() {
    // Reset visual elements unless they belong to selected node
    gNode.selectAll("circle")
      .attr("fill", d => {
        if (selectedNode && d.id === selectedNode.id) return "red";
        return d._children ? "#555" : "#999";
      })
      .attr("r", d => (selectedNode && d.id === selectedNode.id) ? 6 : 4);
    
    gLink.selectAll("path")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.4);

    // If there's a selected node, maintain its highlight
    if (selectedNode) {
      highlightBranch(selectedNode);
    }
  }

  function update(source) {
    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const height = right.x - left.x + margin.top + margin.bottom;

    const transition = svg.transition()
      .duration(duration)
      .attr("viewBox", [-margin.left, left.x - margin.top, width, height]);

    const node = gNode.selectAll("g")
      .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("g")
      .attr("transform", d => `translate(${source.y0},${source.x0})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", (event, d) => {
        // Always toggle children first
        if (d._children || d.children) {
          d.children = d.children ? null : d._children;
          update(d);
        }
        
        // Then handle selection and stats
        selectedNode = (selectedNode && selectedNode.id === d.id) ? null : d;
        resetHighlights();
        if (selectedNode) {
          updateStats(d);
        } else {
          clearStats();
        }
      })
      .on("mouseover", (event, d) => {
        if (!selectedNode || selectedNode.id !== d.id) {
          highlightBranch(d, "orange");
        }
      })
      .on("mouseout", (event, d) => {
        resetHighlights();
      });

    nodeEnter.append("circle")
      .attr("r", 4)
      .attr("fill", d => d._children ? "#555" : "#999")
      .attr("stroke-width", 10);

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .style("font-size", "12px") 
      .attr("x", d => d._children ? -6 : 6)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .text(d => `${d.data.name} (${d.data.value})`)
      .clone(true).lower()
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .attr("stroke", "white");

    const nodeUpdate = node.merge(nodeEnter).transition(transition)
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    const nodeExit = node.exit().transition(transition).remove()
      .attr("transform", d => `translate(${source.y},${source.x})`);

    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
      .attr("stroke", "#999")
      .attr("d", d => {
        const o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

    link.merge(linkEnter).transition(transition)
      .attr("d", diagonal)
      .attr("stroke-width", d => Math.max(1, d.target.data.value / stroke_width_divisor));

    link.exit().transition(transition).remove()
      .attr("d", d => {
        const o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      });

    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);
  treeContainer.appendChild(svg.node());
  return treeContainer;
}


function createHierarchy(data, columnOrder, columnMapper) {
  const root = {
    name: "",
    children: []
  };
  
  const columnMap = columnMapper
  
  function addToHierarchy(node, row, depth) {
    if (depth >= columnOrder.length) return;
    
    const currentField = columnMap[columnOrder[depth]];
    const value = row[currentField];
    
    if (value === undefined) return;
    
    let child = node.children.find(c => c.name === value);
    if (!child) {
      child = {
        name: value,
        children: [],
        _rows: []
      };
      node.children.push(child);
    }
    
    child._rows.push(row);
    addToHierarchy(child, row, depth + 1);
  }
  
  const validData = data.filter(row => {
    return columnOrder.every(col => row[columnMap[col]] !== undefined);
  });
  
  validData.forEach(row => {
    addToHierarchy(root, row, 0);
  });
  
  function calculateMetrics(node) {
    if (node._rows) {
      node.value = node._rows.length;
      // Calculate imaging metrics
      node.totalImagingVisits = d3.sum(node._rows, d => d.ImagingVisits || 0);
      node.nonPreferredVisits = d3.sum(node._rows, d => d.NonPreferredVisits || 0);
      node.nonPreferredRate = node.totalImagingVisits > 0 ? 
        node.nonPreferredVisits / node.totalImagingVisits : 0;
      delete node._rows;
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(calculateMetrics);
      if (!node.value) {
        node.value = node.children.reduce((sum, child) => sum + child.value, 0);
        node.totalImagingVisits = node.children.reduce((sum, child) => sum + child.totalImagingVisits, 0);
        node.nonPreferredVisits = node.children.reduce((sum, child) => sum + child.nonPreferredVisits, 0);
        node.nonPreferredRate = node.totalImagingVisits > 0 ? 
          node.nonPreferredVisits / node.totalImagingVisits : 0;
      }
    }
  }
  
  calculateMetrics(root);
  return root;
}

export function calculateStats(data, config) {
  const {
    groupBy = [],
    metrics = [],
    filters = {},
  } = config;

  const defaultMetrics = [
    {
      name: 'totalMembers',  // Changed from totalPatients to totalMembers
      type: 'count',
      format: 'number'
    },
    {
      name: 'totalImagingVisits',
      type: 'sum',
      column: 'ImagingVisits',
      format: 'number'
    },
    {
      name: 'nonPreferredVisits',
      type: 'sum',
      column: 'NonPreferredVisits',
      format: 'number'
    },
    {
      name: 'nonPreferredRate',
      type: 'rate',
      numeratorColumn: 'NonPreferredVisits',
      denominatorColumn: 'ImagingVisits',
      format: 'percentage'
    },
    {
      name: 'imagingVisitsPerMember',
      type: 'derived',
      calculation: (metrics) => metrics.totalImagingVisits.raw / metrics.totalMembers.raw,
      format: 'ratio'
    }
  ];

  function applyFilters(data, filters) {
    return data.filter(row => 
      Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          if ('gt' in value) return row[key] > value.gt;
          if ('gte' in value) return row[key] >= value.gte;
          if ('lt' in value) return row[key] < value.lt;
          if ('lte' in value) return row[key] <= value.lte;
        }
        return Array.isArray(value) ? value.includes(row[key]) : row[key] === value;
      })
    );
  }

  function formatValue(value, format) {
    switch (format) {
      case 'percentage':
        return {
          raw: value,
          formatted: `${(value * 100).toFixed(1)}%`
        };
      case 'number':
        return {
          raw: value,
          formatted: value.toLocaleString()
        };
      case 'ratio':
        return {
          raw: value,
          formatted: value.toFixed(2)
        };
      default:
        return {
          raw: value,
          formatted: value.toString()
        };
    }
  }

  function calculateMetric(data, metric, existingMetrics = {}) {
    const {
      type,
      column,
      numeratorColumn,
      denominatorColumn,
      calculation,
      filter,
      format = 'number'
    } = metric;

    let filteredData = filter ? applyFilters(data, filter) : data;
    let value;

    switch (type) {
      case 'count':
        value = filteredData.length;
        break;
      case 'sum':
        value = filteredData.reduce((sum, row) => sum + (row[column] || 0), 0);
        break;
      case 'rate':
        const numerator = filteredData.reduce((sum, row) => sum + (row[numeratorColumn] || 0), 0);
        const denominator = filteredData.reduce((sum, row) => sum + (row[denominatorColumn] || 0), 0);
        value = denominator > 0 ? numerator / denominator : 0;
        break;
      case 'derived':
        value = calculation(existingMetrics);
        break;
      default:
        value = 0;
    }

    return formatValue(value, format);
  }

  function calculateGroupStats(data, groups = [], currentFilters = {}) {
    if (groups.length === 0) {
      const metrics = {};
      // Calculate basic metrics first
      defaultMetrics.forEach(metric => {
        if (metric.type !== 'derived') {
          metrics[metric.name] = calculateMetric(data, metric);
        }
      });
      // Calculate derived metrics that depend on other metrics
      defaultMetrics.forEach(metric => {
        if (metric.type === 'derived') {
          metrics[metric.name] = calculateMetric(data, metric, metrics);
        }
      });

      return [{
        filters: { ...currentFilters },
        metrics: metrics
      }];
    }

    const currentGroup = groups[0];
    const remainingGroups = groups.slice(1);
    const uniqueValues = [...new Set(data.map(d => d[currentGroup]))];

    return uniqueValues.flatMap(value => {
      const filteredData = data.filter(d => d[currentGroup] === value);
      const newFilters = { ...currentFilters, [currentGroup]: value };
      return calculateGroupStats(filteredData, remainingGroups, newFilters);
    });
  }

  const filteredData = filters ? applyFilters(data, filters) : data;
  return calculateGroupStats(filteredData, groupBy);
}

export function createFunnelData(stats, funnelConfig) {
  const {
    groupSequence = [],
    valueMetric = 'totalMembers',
    labelFormat = (row) => `${row.currentGroup} (${row.metrics.totalMembers.formatted}, NP Rate: ${row.metrics.nonPreferredRate.formatted})`
  } = funnelConfig;

  return groupSequence.map((group, i) => {
    const row = stats.find(s => 
      Object.entries(group.filters).every(([key, value]) => s.filters[key] === value)
    );

    return {
      // Display properties
      group: labelFormat({ ...row, currentGroup: group.group }),
      value: (row.metrics[valueMetric].raw / stats[0].metrics[valueMetric].raw) * 100,
      altValue: row.metrics[valueMetric].formatted,
      
      // Detailed metrics
      details: {
        membership: {
          total: row.metrics.totalMembers.raw,
          totalFormatted: row.metrics.totalMembers.formatted
        },
        imaging: {
          totalVisits: row.metrics.totalImagingVisits.raw,
          totalVisitsFormatted: row.metrics.totalImagingVisits.formatted,
          visitsPerMember: row.metrics.imagingVisitsPerMember.raw,
          visitsPerMemberFormatted: row.metrics.imagingVisitsPerMember.formatted
        },
        nonPreferred: {
          visits: row.metrics.nonPreferredVisits.raw,
          visitsFormatted: row.metrics.nonPreferredVisits.formatted,
          rate: row.metrics.nonPreferredRate.raw,
          rateFormatted: row.metrics.nonPreferredRate.formatted
        }
      },
      
      // Original metrics object for reference
      metrics: row.metrics,
      
      // Group information
      level: group.group,
      filters: group.filters
    };
  });
}

