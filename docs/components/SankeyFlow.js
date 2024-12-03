import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {sankey, sankeyLinkHorizontal} from "https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/+esm";

export function createSankeyFlow(rawData, config = {}, onReplay = null) {
  // Default configuration
  const defaultConfig = {
    width: 800,
    height: 300,
    margin: { top: 20, right: 250, bottom: 20, left: 40 },
    nodePadding: 30,
    nodeWidth: 15,
    particleSize: 6,
    particleSpeed: 5,
    particleSpawnRate: 0.4,
    particleVerticalSpread: 0.8,
    showLabels: true,
    hideRootLabel: true,
    counterSpacing: 100,
    terminalBuckets: ['preferred', 'non_preferred'],
    bucketLabels: {
      'preferred': 'Preferred',
      'non_preferred': 'Non-Preferred'
    },
    bucketColors: {
      'preferred': '#FFB600',
      'non_preferred': '#D04A02'
    }
  };

  const cfg = { ...defaultConfig, ...config };
  const cache = {};
  let particles = [];
  let animationFrame = null;

  function processNode(node) {
    if (node[cfg.terminalBuckets[0]] !== undefined) {
      return cfg.terminalBuckets.reduce((sum, bucket) => sum + (node[bucket] || 0), 0);
    }
    return Object.values(node).reduce((sum, child) => sum + processNode(child), 0);
  }

  function extractNodes(data) {
    const nodeSet = new Set(['root']);
    const nodeValues = new Map();
    
    function walk(node, parent = null) {
      Object.entries(node).forEach(([name, childNode]) => {
        nodeSet.add(name);
        const value = processNode(childNode);
        nodeValues.set(name, value);
        
        if (!childNode.hasOwnProperty(cfg.terminalBuckets[0])) {
          walk(childNode, name);
        }
      });
    }
    
    walk(data.root);
    nodeValues.set('root', processNode(data.root));
    
    return Array.from(nodeSet).map(id => ({
      id,
      value: nodeValues.get(id)
    }));
  }

  function createLinks(data) {
    const links = [];
    
    function walk(node, source) {
      Object.entries(node).forEach(([target, targetNode]) => {
        const value = processNode(targetNode);
        const link = { source, target, value };
        
        if (targetNode[cfg.terminalBuckets[0]] !== undefined) {
          cfg.terminalBuckets.forEach(bucket => {
            link[bucket] = targetNode[bucket] || 0;
          });
        }
        
        links.push(link);
        
        if (!targetNode.hasOwnProperty(cfg.terminalBuckets[0])) {
          walk(targetNode, target);
        }
      });
    }
    
    walk(data.root, 'root');
    return links;
  }

  const nodes = extractNodes(rawData);
  const links = createLinks(rawData);

  const sankeyGenerator = sankey()
    .nodeId(d => d.id)
    .nodeWidth(cfg.nodeWidth)
    .nodePadding(cfg.nodePadding)
    .extent([[cfg.margin.left, cfg.margin.top], 
            [cfg.width - cfg.margin.right, cfg.height - cfg.margin.bottom]]);

  const graph = sankeyGenerator({
    nodes: nodes,
    links: links
  });

  const particleCounts = {};
  const targetCounts = {};
  graph.nodes.forEach(node => {
    const terminalLink = graph.links.find(l => l.target === node && l[cfg.terminalBuckets[0]] !== undefined);
    if (terminalLink) {
      targetCounts[node.id] = {};
      particleCounts[node.id] = {};
      cfg.terminalBuckets.forEach(bucket => {
        targetCounts[node.id][bucket] = terminalLink[bucket] || 0;
        particleCounts[node.id][bucket] = 0;
      });
    }
  });

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, cfg.width, cfg.height])
    .style("background", "white")
    .style("max-width", "800px")
    .style("width", "100%")
    .style("height", "auto");

  const paths = svg.append("g")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", "#f0f0f0")
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", d => Math.max(1, d.width))
    .each(function(d) {
      const path = this;
      const length = path.getTotalLength();
      const points = [];
      
      for (let i = 0; i <= length; i++) {
        const point = path.getPointAtLength(i);
        points.push({ x: point.x, y: point.y });
      }
      
      const pathKey = `${d.source.id}-${d.target.id}`;
      cache[pathKey] = {
        points,
        length,
        width: d.width,
        ...cfg.terminalBuckets.reduce((acc, bucket) => {
          acc[bucket] = d[bucket] || 0;
          return acc;
        }, {})
      };
    });

  const particlesContainer = svg.append("g")
    .attr("class", "particles");

  if (cfg.showLabels) {
    svg.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .join("text")
      .filter(d => !(cfg.hideRootLabel && d.id === 'root'))
      .attr("x", d => d.x0 < cfg.width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < cfg.width / 2 ? "start" : "end")
      .attr("fill", "#000")
      .style("font-size", "14px")
      .text(d => d.id);
  }

  const counters = svg.append("g")
    .attr("class", "counters")
    .selectAll("g")
    .data(graph.nodes.filter(n => targetCounts[n.id]))
    .join("g")
    .attr("transform", d => `translate(${cfg.width - cfg.margin.right + 50}, ${(d.y0 + d.y1) / 2})`);

  const counterGroups = counters.selectAll(".group")
    .data(d => cfg.terminalBuckets.map(bucket => ({
      type: bucket,
      node: d,
      label: cfg.bucketLabels[bucket],
      count: 0,
      total: targetCounts[d.id].preferred + targetCounts[d.id].non_preferred
    })))
    .join("g")
    .attr("class", "group")
    .attr("transform", (d, i) => `translate(${i * cfg.counterSpacing}, 0)`);

  counterGroups.append("text")
    .attr("class", "label")
    .attr("y", -15)
    .attr("fill", "#000")
    // .style("font-family", "Arial, sans-serif")
    .style("font-size", "12px")
    .text(d => d.label);

  counterGroups.append("text")
    .attr("class", "count")
    .attr("fill", d => cfg.bucketColors[d.type])
    // .style("font-family", "monospace")
    .style("font-size", "16px")
    .text("0");

  counterGroups.append("text")
    .attr("class", "percentage")
    .attr("y", 20)
    .attr("fill", d => cfg.bucketColors[d.type])
    .style("font-family", "monospace")
    .style("font-size", "12px")
    .text("0%");

  function resetAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    particles = [];
    Object.keys(particleCounts).forEach(nodeId => {
      cfg.terminalBuckets.forEach(bucket => {
        particleCounts[nodeId][bucket] = 0;
      });
    });
    counterGroups.select(".count").text("0");
    counterGroups.select(".percentage").text("0%");
    startAnimation();
  }

  function startAnimation() {
    const rootTotals = {
      preferred: 0,
      non_preferred: 0,
      particlesCreated: 0,
      bucketCounts: { preferred: 0, non_preferred: 0 }
    };

    const nodeTargets = new Map();
    Object.entries(targetCounts).forEach(([nodeId, counts]) => {
      nodeTargets.set(nodeId, {
        remaining: { ...counts },
        total: Object.values(counts).reduce((a, b) => a + b, 0)
      });
      Object.entries(counts).forEach(([bucket, count]) => {
        rootTotals[bucket] += count;
      });
    });

    function animate() {
      const allParticlesReleased = rootTotals.particlesCreated >= 
        (rootTotals.preferred + rootTotals.non_preferred);

      const allTargetsReached = Array.from(nodeTargets.values()).every(
        node => Object.values(node.remaining).every(count => count <= 0)
      );

      if (!allParticlesReleased && Math.random() < cfg.particleSpawnRate) {
        const availableTerminals = [];
        const terminalWeights = [];
        
        graph.links
          .filter(l => l[cfg.terminalBuckets[0]] !== undefined)
          .forEach(link => {
            const nodeTarget = nodeTargets.get(link.target.id);
            if (nodeTarget) {
              const remainingTotal = Object.values(nodeTarget.remaining)
                .reduce((a, b) => a + b, 0);
              if (remainingTotal > 0) {
                availableTerminals.push(link);
                terminalWeights.push(remainingTotal / nodeTarget.total);
              }
            }
          });

        if (availableTerminals.length > 0) {
          const totalWeight = terminalWeights.reduce((a, b) => a + b, 0);
          const normalizedWeights = terminalWeights.map(w => w / totalWeight);
          let random = Math.random();
          let selectedIndex = 0;
          let cumWeight = 0;
          
          for (let i = 0; i < normalizedWeights.length; i++) {
            cumWeight += normalizedWeights[i];
            if (random <= cumWeight) {
              selectedIndex = i;
              break;
            }
          }

          const selectedTerminal = availableTerminals[selectedIndex];
          const terminalId = selectedTerminal.target.id;
          const nodeTarget = nodeTargets.get(terminalId);

          const completePath = [];
          let currentLink = selectedTerminal;
          while (currentLink) {
            completePath.unshift(currentLink);
            currentLink = graph.links.find(l => l.target === currentLink.source);
          }

          const bucketWeights = [];
          const availableBuckets = [];
          
          cfg.terminalBuckets.forEach(bucket => {
            const remaining = nodeTarget.remaining[bucket];
            if (remaining > 0) {
              availableBuckets.push(bucket);
              bucketWeights.push(remaining / nodeTarget.total);
            }
          });

          if (availableBuckets.length > 0) {
            const totalBucketWeight = bucketWeights.reduce((a, b) => a + b, 0);
            const normalizedBucketWeights = bucketWeights.map(w => w / totalBucketWeight);
            let bucketRandom = Math.random();
            let selectedBucketIndex = 0;
            let cumBucketWeight = 0;
            
            for (let i = 0; i < normalizedBucketWeights.length; i++) {
              cumBucketWeight += normalizedBucketWeights[i];
              if (bucketRandom <= cumBucketWeight) {
                selectedBucketIndex = i;
                break;
              }
            }

            const bucket = availableBuckets[selectedBucketIndex];
            
            if (nodeTarget.remaining[bucket] > 0) {
              const firstLink = completePath[0];
              const pathKey = `${firstLink.source.id}-${firstLink.target.id}`;
              const pathData = cache[pathKey];

              if (pathData) {
                rootTotals.particlesCreated++;
                rootTotals.bucketCounts[bucket]++;
                nodeTarget.remaining[bucket]--;
                
                particles.push({
                  id: Date.now() + Math.random(),
                  completePath,
                  currentPathIndex: 0,
                  pathKey,
                  pos: 0,
                  length: pathData.length,
                  speed: cfg.particleSpeed,
                  offset: (Math.random() - 0.5) * pathData.width * cfg.particleVerticalSpread,
                  type: bucket,
                  target: terminalId
                });
              }
            }
          }
        }
      }

      particlesContainer.selectAll(".particle")
        .data(particles, d => d.id)
        .join(
          enter => enter.append("rect")
            .attr("class", "particle")
            .attr("width", cfg.particleSize)
            .attr("height", cfg.particleSize)
            .attr("fill", d => cfg.bucketColors[d.type])
            .attr("opacity", 0.6),
          update => update,
          exit => exit.remove()
        )
        .attr("transform", d => {
          const pathData = cache[d.pathKey];
          const index = Math.floor(d.pos);
          if (pathData && index >= 0 && index < pathData.points.length) {
            const point = pathData.points[index];
            return `translate(${point.x - cfg.particleSize/2},${point.y + d.offset - cfg.particleSize/2})`;
          }
          return null;
        });

      particles = particles.filter(d => {
        d.pos += d.speed;
        const currentPathData = cache[d.pathKey];
        
        if (d.pos >= currentPathData.length) {
          if (d.currentPathIndex < d.completePath.length - 1) {
            d.currentPathIndex++;
            const nextLink = d.completePath[d.currentPathIndex];
            d.pathKey = `${nextLink.source.id}-${nextLink.target.id}`;
            d.pos = 0;
            const newPathData = cache[d.pathKey];
            d.offset = (Math.random() - 0.5) * newPathData.width * cfg.particleVerticalSpread;
            return true;
          } else {
            if (particleCounts[d.target][d.type] < targetCounts[d.target][d.type]) {
              particleCounts[d.target][d.type]++;
              
              // Update count and percentage
              const total = targetCounts[d.target].preferred + targetCounts[d.target].non_preferred;
              const currentCount = particleCounts[d.target][d.type];
              const percentage = Math.round((currentCount / total) * 100);
              
              const matchingGroup = counterGroups.filter(g => 
                g.node.id === d.target && g.type === d.type
              );
              
              matchingGroup.select(".count")
                .text(currentCount);
              
              matchingGroup.select(".percentage")
                .text(`${percentage}%`);
            }
            return false;
          }
        }
        return true;
      });

      if (!allTargetsReached || particles.length > 0) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animate();
  }

  startAnimation();

  const replayAnimation = () => {
    resetAnimation();
    if (onReplay) {
      onReplay();
    }
  };

  return {
    node: svg.node(),
    replay: replayAnimation
  };
}