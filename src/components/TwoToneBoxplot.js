import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const defaultTooltipStyles = `
.boxplot-tooltip {
  position: absolute;
  padding: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 4px;
  pointer-events: none;
  font-family: "Helvetica Neue", sans-serif;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: opacity 0.2s;
  max-width: 300px;
}

.boxplot-tooltip.hidden {
  opacity: 0;
}

.boxplot-tooltip-header {
  font-weight: bold;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
  margin-bottom: 5px;
}

.boxplot-tooltip-content {
  display: grid;
  grid-template-columns: auto auto;
  gap: 4px;
}

.boxplot-tooltip-label {
  color: #666;
}

.boxplot-tooltip-value {
  font-weight: 500;
  text-align: right;
}
`;

export function createTwoToneBoxplot(
  data,
  {
    // Basic dimensions
    width = 800,
    height = 400,
    marginTop = 40,
    marginRight = 30,
    marginBottom = 60,
    marginLeft = 60,

    // Labels and basic styling
    yLabel = "Allowed Cost ($)",
    xLabel = "Procedure Category",
    fill1 = "#e57373",
    fill2 = "#81c784",
    stroke1 = "#d32f2f",
    stroke2 = "#388e3c",
    backgroundColor = "#f9f9f9",

    // Box styling
    boxStrokeWidth = 1.5,
    boxStrokeOpacity = 1,
    boxFillOpacity = 0.8,
    boxPadding = 0.2,

    // Median line styling
    medianLineColor = "#666",
    medianLineWidth = 2,
    medianLineDash = [],

    // Whisker styling
    whiskerColor = "#666",
    whiskerWidth = 1,
    whiskerDash = [],
    whiskerCapWidth = 0.5,

    // Outlier styling
    showOutliers = true,
    outlierRadius = 2.5,
    outlierColor = "#666",
    outlierFill = "none",
    outlierStrokeWidth = 1,

    // Grid styling
    showGrid = true,
    gridColor = "#ddd",
    gridOpacity = 0.5,
    gridDash = [2, 2],

    // Axis styling
    xTickRotation = 0,
    xTickSize = 5,
    yTickSize = 5,
    tickFontSize = "12px",
    tickFontFamily = "Helvetica Neue, sans-serif",
    labelFontSize = "14px",
    labelFontFamily = "Helvetica Neue, sans-serif",

    // Scale configuration
    xScale = {
      type: "band",
      padding: 0.2,
      domain: null,
      nice: true,
    },
    yScale = {
      type: "linear",
      domain: null,
      nice: true,
      clamp: false,
    },

    // Tooltip configuration
    tooltipEnabled = true,
    tooltipStyles = defaultTooltipStyles,
    tooltipContent = null,
    tooltipPosition = "auto",
    tooltipOffset = { x: 10, y: 10 },
    tooltipDelay = 200,
    tooltipHideDelay = 100,
    tooltipClassName = "boxplot-tooltip",
    tooltipAnimation = true,
    tooltipAnimationDuration = 200,
    defaultTooltipTemplate = (d) => `
    <div class="${tooltipClassName}-header">${d.group}</div>
    <div class="${tooltipClassName}-content">
      <span class="${tooltipClassName}-label">Maximum:</span>
      <span class="${tooltipClassName}-value">${d.stats.max.toFixed(2)}</span>
      <span class="${tooltipClassName}-label">Q3:</span>
      <span class="${tooltipClassName}-value">${d.stats.q3.toFixed(2)}</span>
      <span class="${tooltipClassName}-label">Median:</span>
      <span class="${tooltipClassName}-value">${d.stats.q2.toFixed(2)}</span>
      <span class="${tooltipClassName}-label">Q1:</span>
      <span class="${tooltipClassName}-value">${d.stats.q1.toFixed(2)}</span>
      <span class="${tooltipClassName}-label">Minimum:</span>
      <span class="${tooltipClassName}-value">${d.stats.min.toFixed(2)}</span>
      <span class="${tooltipClassName}-label">Sample Size:</span>
      <span class="${tooltipClassName}-value">${d.stats.values.length}</span>
    </div>
  `,
    xLabelOffset = {
      x: 0,
      y: 20,
    },
    showAdvDiff = true,
    advDiffData = {},
    advDiffLabel = "Adv. Diff:",
    advDiffPrefix = "$",
    advDiffPadding = 30,
    advDiffBackground = {
      show: true,
      fill: "#f5f5f5",
      height: 40,
    },
    advDiffStyles = {
      label: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#666",
      },
      values: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontWeight: "normal",
        color: "#666",
      },
    },
  } = {}
) {
  // Setup tooltip
  if (!document.querySelector(`#${tooltipClassName}-styles`)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = `${tooltipClassName}-styles`;
    styleSheet.textContent = tooltipStyles;
    document.head.appendChild(styleSheet);
  }

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", tooltipClassName)
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none");

  // Data processing
  const groupedData = d3.group(data, (d) => d.Procedure);
  const summaries = new Map();

  for (const [key, group] of groupedData) {
    const values = group.map((d) => d.AllowedCost).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const q2 = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1;
    const min = q1 - 1.5 * iqr;
    const max = q3 + 1.5 * iqr;
    const outliers = values.filter((v) => v < min || v > max);
    const validMin = d3.min(values.filter((v) => v >= min));
    const validMax = d3.max(values.filter((v) => v <= max));

    summaries.set(key, {
      q1,
      q2,
      q3,
      min: validMin,
      max: validMax,
      outliers,
      values,
    });
  }

  // Create scales
  const x = d3
    .scaleBand()
    .domain(xScale.domain || [...groupedData.keys()])
    .range([marginLeft, width - marginRight])
    .padding(xScale.padding);

  const y =
    yScale.type === "log"
      ? d3.scaleLog()
      : yScale.type === "symlog"
      ? d3.scaleSymlog()
      : d3.scaleLinear();

  y.domain(yScale.domain || [0, d3.max(data, (d) => d.AllowedCost)])
    .nice(yScale.nice)
    .clamp(yScale.clamp)
    .range([height - marginBottom, marginTop]);

  // Create SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Add background
  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", backgroundColor);

  // Add grid
  if (showGrid) {
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + marginLeft + marginRight)
          .tickFormat("")
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", gridColor)
          .attr("stroke-opacity", gridOpacity)
          .attr("stroke-dasharray", gridDash)
      );
  }

  // Tooltip handlers
  let tooltipTimeout;

  function calculateTooltipPosition(event, element) {
    const tooltipNode = tooltip.node();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipRect = tooltipNode.getBoundingClientRect();

    let x = event.pageX + tooltipOffset.x;
    let y = event.pageY + tooltipOffset.y;

    if (tooltipPosition === "auto") {
      if (x + tooltipRect.width > viewportWidth) {
        x = event.pageX - tooltipRect.width - tooltipOffset.x;
      }
      if (y + tooltipRect.height > viewportHeight) {
        y = event.pageY - tooltipRect.height - tooltipOffset.y;
      }
    }

    return { x: Math.max(0, x), y: Math.max(0, y) };
  }

  function showTooltip(event, d) {
    if (!tooltipEnabled) return;

    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      const content = tooltipContent
        ? tooltipContent(d)
        : defaultTooltipTemplate(d);

      tooltip.html(content).classed("hidden", false);

      if (tooltipAnimation) {
        tooltip
          .transition()
          .duration(tooltipAnimationDuration)
          .style("opacity", 1);
      } else {
        tooltip.style("opacity", 1);
      }

      const position = calculateTooltipPosition(event, this);
      tooltip.style("left", `${position.x}px`).style("top", `${position.y}px`);
    }, tooltipDelay);
  }

  function hideTooltip() {
    if (!tooltipEnabled) return;

    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      if (tooltipAnimation) {
        tooltip
          .transition()
          .duration(tooltipAnimationDuration)
          .style("opacity", 0)
          .on("end", () => tooltip.classed("hidden", true));
      } else {
        tooltip.style("opacity", 0).classed("hidden", true);
      }
    }, tooltipHideDelay);
  }

  function moveTooltip(event) {
    if (!tooltipEnabled || tooltip.classed("hidden")) return;

    const position = calculateTooltipPosition(event, this);
    tooltip.style("left", `${position.x}px`).style("top", `${position.y}px`);
  }

  // Draw boxes
  const boxWidth = x.bandwidth();

  const boxGroup = svg
    .append("g")
    .selectAll("g")
    .data([...summaries])
    .join("g")
    .attr("transform", ([key]) => `translate(${x(key)},0)`);

  // Add hover area
  boxGroup
    .append("rect")
    .attr("class", "hover-area")
    .attr("x", 0)
    .attr("y", ([, d]) => y(d3.max([...d.values]))) // Use actual max including outliers
    .attr("width", boxWidth)
    .attr(
      "height",
      ([, d]) => y(d3.min([...d.values])) - y(d3.max([...d.values]))
    ) // Use actual min including outliers
    .attr("fill", "transparent")
    .on("mouseover", function (event, [key, stats]) {
      tooltip
        .html(defaultTooltipTemplate({ group: key, stats }))
        .style("opacity", 1);
    })
    .on("mousemove", function (event) {
      const position = calculateTooltipPosition(event, this);
      tooltip.style("left", `${position.x}px`).style("top", `${position.y}px`);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // Lower half boxes
  boxGroup
    .append("rect")
    .attr("class", "box-lower")
    .attr("x", 0)
    .attr("y", ([, d]) => y(d.q2))
    .attr("width", boxWidth)
    .attr("height", ([, d]) => y(d.q1) - y(d.q2))
    .attr("fill", fill1)
    .attr("stroke", stroke1)
    .attr("stroke-width", boxStrokeWidth)
    .attr("stroke-opacity", boxStrokeOpacity)
    .attr("fill-opacity", boxFillOpacity);

  // Upper half boxes
  boxGroup
    .append("rect")
    .attr("class", "box-upper")
    .attr("x", 0)
    .attr("y", ([, d]) => y(d.q3))
    .attr("width", boxWidth)
    .attr("height", ([, d]) => y(d.q2) - y(d.q3))
    .attr("fill", fill2)
    .attr("stroke", stroke2)
    .attr("stroke-width", boxStrokeWidth)
    .attr("stroke-opacity", boxStrokeOpacity)
    .attr("fill-opacity", boxFillOpacity);

  // Median lines
  boxGroup
    .append("line")
    .attr("class", "median")
    .attr("x1", 0)
    .attr("x2", boxWidth)
    .attr("y1", ([, d]) => y(d.q2))
    .attr("y2", ([, d]) => y(d.q2))
    .attr("stroke", medianLineColor)
    .attr("stroke-width", medianLineWidth)
    .attr("stroke-dasharray", medianLineDash);

  // Whiskers
  const whiskerX1 = boxWidth * (0.5 - whiskerCapWidth / 2);
  const whiskerX2 = boxWidth * (0.5 + whiskerCapWidth / 2);

  // Lower whisker
  boxGroup
    .append("line")
    .attr("class", "whisker-cap-lower")
    .attr("x1", whiskerX1)
    .attr("x2", whiskerX2)
    .attr("y1", ([, d]) => y(d.min))
    .attr("y2", ([, d]) => y(d.min))
    .attr("stroke", whiskerColor)
    .attr("stroke-width", whiskerWidth);

  boxGroup
    .append("line")
    .attr("class", "whisker-line-lower")
    .attr("x1", boxWidth / 2)
    .attr("x2", boxWidth / 2)
    .attr("y1", ([, d]) => y(d.q1))
    .attr("y2", ([, d]) => y(d.min))
    .attr("stroke", whiskerColor)
    .attr("stroke-width", whiskerWidth)
    .attr("stroke-dasharray", whiskerDash);

  boxGroup
    .append("line")
    .attr("class", "whisker-line-upper")
    .attr("x1", boxWidth / 2)
    .attr("x2", boxWidth / 2)
    .attr("y1", ([, d]) => y(d.q3))
    .attr("y2", ([, d]) => y(d.max))
    .attr("stroke", whiskerColor)
    .attr("stroke-width", whiskerWidth)
    .attr("stroke-dasharray", whiskerDash);
  boxGroup
    .append("line")
    .attr("class", "whisker-cap-upper")
    .attr("x1", whiskerX1)
    .attr("x2", whiskerX2)
    .attr("y1", ([, d]) => y(d.max))
    .attr("y2", ([, d]) => y(d.max))
    .attr("stroke", whiskerColor)
    .attr("stroke-width", whiskerWidth);

  // Draw outliers if enabled
  if (showOutliers) {
    boxGroup.each(function ([key, d]) {
      d3.select(this)
        .selectAll("circle.outlier")
        .data(d.outliers)
        .join("circle")
        .attr("class", "outlier")
        .attr("cx", boxWidth / 2)
        .attr("cy", y)
        .attr("r", outlierRadius)
        .attr("fill", outlierFill)
        .attr("stroke", outlierColor)
        .attr("stroke-width", outlierStrokeWidth);
    });
  }

  // Add axes
  const xAxis = svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSize(xTickSize))
    .call((g) => g.select(".domain").attr("stroke", "#666"))
    .call((g) => g.selectAll(".tick line").attr("stroke", "#666"))
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("font-family", tickFontFamily)
        .attr("font-size", tickFontSize)
        .attr("transform", `rotate(${xTickRotation})`)
        .style("text-anchor", xTickRotation ? "start" : "middle")
    );

  if (showAdvDiff) {
    const advDiffGroup = svg.append("g").attr("class", "adv-diff-section");

    const tempText = svg
      .append("text")
      .attr("font-family", advDiffStyles.label.fontFamily)
      .attr("font-size", advDiffStyles.label.fontSize)
      .text(advDiffLabel);
    const labelWidth = tempText.node().getBBox().width;
    tempText.remove();

    // Add background rectangle with extended width
    if (advDiffBackground.show) {
      advDiffGroup
        .append("rect")
        .attr("x", marginLeft + labelWidth - 100) // 20px extra padding
        .attr(
          "y",
          height - marginBottom + advDiffPadding - advDiffBackground.height / 2
        )
        .attr("width", width - marginLeft - marginRight + labelWidth + 100)
        .attr("height", advDiffBackground.height)

        .attr("fill", advDiffBackground.fill);
    }

    // Add advantage difference label with custom styling
    advDiffGroup
      .append("text")
      .attr("class", "adv-diff-label")
      .attr("x", marginLeft - 10)
      .attr("y", height - marginBottom + advDiffPadding)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-family", advDiffStyles.label.fontFamily)
      .attr("font-size", advDiffStyles.label.fontSize)
      .attr("font-weight", advDiffStyles.label.fontWeight)
      .attr("fill", advDiffStyles.label.color)
      .text(advDiffLabel);

    // Add advantage difference values with custom styling
    advDiffGroup
      .selectAll(".adv-diff-value")
      .data([...x.domain()])
      .join("text")
      .attr("class", "adv-diff-value")
      .attr("x", (d) => x(d) + x.bandwidth() / 2)
      .attr("y", height - marginBottom + advDiffPadding)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-family", advDiffStyles.values.fontFamily)
      .attr("font-size", advDiffStyles.values.fontSize)
      .attr("font-weight", advDiffStyles.values.fontWeight)
      .attr("fill", advDiffStyles.values.color)
      .text((d) => {
        const value = advDiffData[d];
        if (value === undefined || value === null) return "";
        return `${advDiffPrefix}${value.toLocaleString()}`;
      });
  }
  const yAxis = svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickSize(yTickSize))
    .call((g) => g.select(".domain").attr("stroke", "#666"))
    .call((g) => g.selectAll(".tick line").attr("stroke", "#666"))
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("font-family", tickFontFamily)
        .attr("font-size", tickFontSize)
    );

  // Add axis labels
  svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${marginLeft / 3},${height / 2}) rotate(-90)`)
    .attr("font-family", labelFontFamily)
    .attr("font-size", labelFontSize)
    .text(yLabel);

  svg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2 + xLabelOffset.x)
    .attr("y", height - marginBottom / 3 + xLabelOffset.y)
    .attr("font-family", labelFontFamily)
    .attr("font-size", labelFontSize)
    .text(xLabel);

  // Cleanup function
  function cleanup() {
    clearTimeout(tooltipTimeout);
    tooltip.remove();
    document.querySelector(`#${tooltipClassName}-styles`)?.remove();
  }

  // Return both the SVG and cleanup function
  return {
    svg: svg.node(),
    cleanup,
  };
}
