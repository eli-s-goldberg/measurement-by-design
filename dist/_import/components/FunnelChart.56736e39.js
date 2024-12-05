import * as Plot from "../../_npm/@observablehq/plot@0.6.16/e828d8c8.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { require } from "../../_node/d3-require@1.3.0/index.45152b81.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

export function FunnelChart(data, rates = null, config = {}) {
  // Utility functions remain the same
  function getLuminance(r, g, b) {
    let [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function getContrastRatio(l1, l2) {
    let lighter = Math.max(l1, l2);
    let darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function getContrastingColor(bgColor) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);

    const bgLuminance = getLuminance(r, g, b);
    const whiteLuminance = getLuminance(255, 255, 255);
    const blackLuminance = getLuminance(0, 0, 0);

    const whiteContrast = getContrastRatio(whiteLuminance, bgLuminance);
    const blackContrast = getContrastRatio(blackLuminance, bgLuminance);

    return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
  }

  function getLabelText(d) {
    if (!finalConfig.labels.includePercentage) {
      return d.group;
    }

    if (finalConfig.labels.useAltValue && d.altValue !== undefined) {
      return `${d.group} (${d.altValue})`;
    }

    return `${d.group} (${d.value}%)`;
  }

  // Default configuration
  const defaultConfig = {
    width: 800,
    height: 500,
    margin: { top: 40, right: 40, bottom: 40, left: 200 },
    colors: ["#20B2AA", "#48D1CC", "#90EE90", "#BBF7D0", "#FFEC8B", "#FFA07A"],
    labels: {
      fontSize: "12px",
      fontFamily: "sans-serif",
      padding: 10,
      includePercentage: true,
      useAltValue: false, // New option to use alternative value
      offset: {
        x: 0,
        y: 0,
      },
    },
    percentages: {
      fontSize: "12px",
      fontFamily: "sans-serif",
      show: true,
      offset: {
        x: 0,
        y: 0,
      },
    },
    rates: {
      fontSize: "11px",
      fontFamily: "sans-serif",
      padding: 10,
      show: !!rates,
      leftAligned: true,
      offset: {
        x: 0,
        y: 0,
      },
    },
  };

  // Merge configurations properly
  const finalConfig = {
    ...defaultConfig,
    ...config,
    margin: { ...defaultConfig.margin, ...config.margin },
    labels: {
      ...defaultConfig.labels,
      ...config.labels,
      offset: { ...defaultConfig.labels.offset, ...config?.labels?.offset },
    },
    percentages: {
      ...defaultConfig.percentages,
      ...config.percentages,
      offset: {
        ...defaultConfig.percentages.offset,
        ...config?.percentages?.offset,
      },
    },
    rates: {
      ...defaultConfig.rates,
      ...config.rates,
      offset: { ...defaultConfig.rates.offset, ...config?.rates?.offset },
    },
  };

  // Calculate dimensions
  const chartWidth =
    finalConfig.width - finalConfig.margin.left - finalConfig.margin.right;
  const chartHeight =
    finalConfig.height - finalConfig.margin.top - finalConfig.margin.bottom;

  // Create color scale
  const colorScale = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.group))
    .range(finalConfig.colors);

  // Create SVG
  const svg = d3
    .create("svg")
    .attr("width", finalConfig.width)
    .attr("height", finalConfig.height)
    .attr("viewBox", [0, 0, finalConfig.width, finalConfig.height])
    .attr("style", "max-width: 100%; height: auto;");

  // Add chart group
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${finalConfig.margin.left},${finalConfig.margin.top})`
    );

  // Process data and calculate positions
  const section = data.map((d, i) => {
    const sectionHeight = chartHeight / data.length;
    const y = i * sectionHeight;

    const maxWidth = chartWidth;
    const topWidth = (d.value / 100) * maxWidth;
    const nextValue = data[i + 1] ? data[i + 1].value : d.value;
    const bottomWidth = (nextValue / 100) * maxWidth;

    const topLeft = (chartWidth - topWidth) / 2;
    const topRight = topLeft + topWidth;
    const bottomLeft = (chartWidth - bottomWidth) / 2;
    const bottomRight = bottomLeft + bottomWidth;

    const color = colorScale(d.group);
    const textColor = getContrastingColor(color);

    return {
      group: d.group,
      value: d.value,
      altValue: d.altValue, // Pass through the altValue
      path: `M${topLeft},${y} L${topRight},${y} L${bottomRight},${
        y + sectionHeight
      } L${bottomLeft},${y + sectionHeight}Z`,
      labelX: (topLeft + bottomLeft) / 2,
      labelY: y + sectionHeight / 2,
      rateX: finalConfig.rates.leftAligned
        ? bottomLeft
        : (bottomLeft + bottomRight) / 2,
      rateY: y + sectionHeight,
      color: color,
      textColor: textColor,
    };
  });

  // Add trapezoids
  g.selectAll("path")
    .data(section)
    .join("path")
    .attr("d", (d) => d.path)
    .attr("fill", (d) => d.color);

  // Add labels
  g.selectAll("text.label")
    .data(section)
    .join("text")
    .attr("class", "label")
    .attr(
      "x",
      (d) => d.labelX - finalConfig.labels.padding + finalConfig.labels.offset.x
    )
    .attr("y", (d) => d.labelY + finalConfig.labels.offset.y)
    .attr("text-anchor", "end")
    .attr("dy", "0.35em")
    .style("font-size", finalConfig.labels.fontSize)
    .style("font-family", finalConfig.labels.fontFamily)
    .style("fill", (d) => d.textColor)
    .text((d) => getLabelText(d));

  // Add centered percentage labels
  if (finalConfig.percentages.show) {
    g.selectAll(".percentage")
      .data(section)
      .join("text")
      .attr("class", "percentage")
      .attr("x", chartWidth / 2 + finalConfig.percentages.offset.x)
      .attr("y", (d) => d.labelY + finalConfig.percentages.offset.y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", finalConfig.percentages.fontSize)
      .style("font-family", finalConfig.percentages.fontFamily)
      .style("fill", (d) => d.textColor)
      .text((d) => `${d.value}%`);
  }

  // Add conversion rates
  if (Array.isArray(rates) && rates.length > 0 && finalConfig.rates.show) {
    const rateData = rates.slice(0, -1).map((rate, i) => ({
      rate,
      ...section[i],
    }));

    g.selectAll(".rate")
      .data(rateData)
      .join("text")
      .attr("class", "rate")
      .attr("x", (d) =>
        finalConfig.rates.leftAligned
          ? d.rateX - finalConfig.rates.padding + finalConfig.rates.offset.x
          : d.rateX + finalConfig.rates.offset.x
      )
      .attr("y", (d) => d.rateY + finalConfig.rates.offset.y)
      .attr("text-anchor", finalConfig.rates.leftAligned ? "end" : "middle")
      .attr("dy", "-0.35em")
      .style("font-size", finalConfig.rates.fontSize)
      .style("font-family", finalConfig.rates.fontFamily)
      .style("fill", (d) => d.textColor)
      .text((d) => d.rate);
  }

  return svg.node();
}
