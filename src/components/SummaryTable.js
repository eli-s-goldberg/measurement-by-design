import * as Inputs from "npm:@observablehq/inputs";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import _ from "lodash";
import { html } from "htl";

const colorMap = new Map(
  [
    ["ordinal", "rgba(78, 121, 167, 1)"],
    ["continuous", "rgba(242, 142, 44, 1)"],
    ["date", "rgba(225,87,89, 1)"],
  ].map((d) => {
    const col = d3.color(d[1]);
    const color_copy = _.clone(col);
    color_copy.opacity = 0.6;
    return [d[0], { color: col.formatRgb(), brighter: color_copy.formatRgb() }];
  })
);

function getType(data, column) {
  for (const d of data) {
    const value = d[column];
    if (value == null) continue;
    if (typeof value === "number") return "continuous";
    if (value instanceof Date) return "date";
    return "ordinal";
  }
  return "ordinal";
}

function hover(tip, pos, text) {
  const side_padding = 10;
  const vertical_padding = 5;
  const vertical_offset = 15;

  tip.selectAll("*").remove();

  // Add text elements first to calculate size
  const textGroup = tip
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("transform", `translate(${pos[0]}, ${pos[1] + 7})`)
    .selectAll("text")
    .data(text)
    .join("text")
    .style("dominant-baseline", "ideographic")
    .text((d) => d)
    .attr("y", (d, i) => (i - (text.length - 1)) * 15 - vertical_offset)
    .style("font-weight", (d, i) => (i === 0 ? "bold" : "normal"));

  // Get bounding box after adding text
  const bbox = tip.node().getBBox();

  // Add background rectangle
  tip
    .insert("rect", "text")
    .attr("y", bbox.y - vertical_padding)
    .attr("x", bbox.x - side_padding)
    .attr("width", bbox.width + side_padding * 2)
    .attr("height", bbox.height + vertical_padding * 2)
    .style("fill", "white")
    .style("stroke", "#d3d3d3");
}

function addTooltips(chart, styles) {
  const stroke_styles = { stroke: "blue", "stroke-width": 3 };
  const fill_styles = { fill: "blue", opacity: 0.5 };

  const type = d3.select(chart).node().tagName;
  let wrapper =
    type === "FIGURE" ? d3.select(chart).select("svg") : d3.select(chart);

  const svgs = d3.select(chart).selectAll("svg");
  if (svgs.size() > 1) wrapper = d3.select([...svgs].pop());

  // Set wrapper styles to allow tooltips to overflow
  wrapper.style("overflow", "visible").style("position", "relative");

  // Ensure parent containers allow overflow; force set absolute to allow overflow
  d3.select(chart).style("overflow", "visible").style("position", "absolute");

  wrapper.selectAll("path").each(function () {
    if (
      d3.select(this).attr("fill") === null ||
      d3.select(this).attr("fill") === "none"
    ) {
      d3.select(this).style("pointer-events", "visibleStroke");
      if (styles === undefined) styles = stroke_styles;
    }
  });

  if (styles === undefined) styles = fill_styles;

  const tip = wrapper
    .selectAll(".hover")
    .data([1])
    .join("g")
    .attr("class", "hover")
    .style("pointer-events", "none")
    .style("text-anchor", "middle");

  const id = id_generator();

  d3.select(chart).classed(id, true);

  wrapper.selectAll("title").each(function () {
    const title = d3.select(this);
    const parent = d3.select(this.parentNode);
    const t = title.text();
    if (t) {
      parent.attr("__title", t).classed("has-title", true);
      title.remove();
    }

    parent
      .on("pointerenter pointermove", function (event) {
        const text = d3.select(this).attr("__title");
        if (!text) {
          tip.selectAll("*").remove();
          return;
        }

        const pointer = d3.pointer(event, wrapper.node());
        const bbox = wrapper.node().getBoundingClientRect();
        const chartWidth = bbox.width;

        // Update tooltip content
        tip.call(hover, pointer, text.split("\n"));

        // Get tooltip dimensions after update
        const tipBBox = tip.node().getBBox();

        // Adjust horizontal position to keep tooltip within bounds
        let xPos = pointer[0];
        if (xPos - tipBBox.width / 2 < 0) {
          xPos = tipBBox.width / 2;
        } else if (xPos + tipBBox.width / 2 > chartWidth) {
          xPos = chartWidth - tipBBox.width / 2;
        }

        // Position tooltip with adjusted coordinates
        tip.attr("transform", `translate(${xPos}, ${pointer[1] + 7})`);

        d3.select(this).raise();
      })
      .on("pointerout", function () {
        tip.selectAll("*").remove();
        d3.select(this).lower();
      });
  });

  wrapper.on("touchstart", () => tip.selectAll("*").remove());

  // Add styles that ensure tooltip visibility
  chart.appendChild(html`<style>
    .${id} .has-title { cursor: pointer; pointer-events: all; }
    .${id} .has-title:hover { ${Object.entries(styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ")} }
    .hover { position: relative; }
    .hover rect { background: white; }
    .hover text { fill: black; }

    /* Ensure parent containers allow overflow */
    .${id} {
      overflow: visible !important;
    }
    .${id} svg {
      overflow: visible !important;
    }
    .${id} figure {
      overflow: visible !important;
    }
  </style>`);

  return chart;
}

function id_generator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return "a" + S4() + S4();
}

function createHistogram(data, col, type = "continuous") {
  const barColor = colorMap.get(type).brighter;
  const mean = d3.mean(data, (d) => d[col]);

  const extent = d3.extent(data, (d) => d[col]);
  const format =
    type === "date"
      ? getDateFormat(extent)
      : Math.floor(extent[0]) === Math.floor(extent[1])
      ? d3.format(",.2f")
      : d3.format(",.0f");

  return addTooltips(
    Plot.plot({
      height: 55,
      width: 120,
      x: {
        label: "",
        ticks: extent,
        tickFormat: format,
      },
      y: { axis: null },
      marks: [
        Plot.rectY(
          data,
          Plot.binX(
            {
              y: "count",
              title: (elems) => {
                const [start, end] = d3.extent(elems, (d) => d[col]);
                return `${elems.length} rows\n[${format(start)} to ${format(
                  end
                )}]`;
              },
            },
            { x: col, fill: barColor }
          )
        ),
        Plot.ruleY([0]),
        Plot.ruleX([{ value: mean }], {
          strokeWidth: 2,
          title: () => `mean ${col}: ${format(mean)}`,
        }),
      ],
      style: {
        marginLeft: -17,
        background: "none",
        overflow: "visible",
      },
    }),
    { opacity: 1, fill: colorMap.get(type).color }
  );
}

function createStackChart(categoryData, col, maxCategories = 100) {
  let chartData = categoryData;
  if (chartData.length > maxCategories) {
    chartData = categoryData.slice(0, maxCategories);
    const total = d3.sum(categoryData, (d) => d.count);
    const otherCount = total - d3.sum(chartData, (d) => d.count);
    chartData.push({
      [col]: "Other categories...",
      count: otherCount,
      pct: otherCount / total,
    });
  }

  const pct_format = d3.format(".1%");
  return addTooltips(
    Plot.plot({
      height: 30,
      width: 120,
      x: { axis: null },
      color: {
        scheme: "blues",
        reverse: true,
      },
      marks: [
        Plot.barX(chartData, {
          x: "count",
          fill: col,
          title: (d) => `${d[col]}\n${pct_format(d.pct)}`,
        }),
        Plot.text([0, 0], {
          x: 0,
          frameAnchor: "bottom",
          dy: 10,
          text: () => `${d3.format(",.0f")(chartData.length)} categories`,
        }),
      ],
      style: {
        paddingTop: "0px",
        paddingBottom: "15px",
        textAnchor: "start",
        overflow: "visible",
      },
      y: {
        axis: null,
        range: [30, 3],
      },
    }),
    { fill: "darkblue" }
  );
}

function formatSnapshot(type, data, col) {
  return (x) => {
    let visualization;
    if (type === "ordinal") {
      const categories = d3
        .rollups(
          data,
          (v) => ({ count: v.length, pct: v.length / data.length }),
          (d) => d[col]
        )
        .sort((a, b) => b[1].count - a[1].count)
        .map((d) => ({
          [col]: d[0] === null || d[0] === "" ? "(missing)" : d[0],
          count: d[1].count,
          pct: d[1].pct,
        }));

      visualization = createStackChart(categories, col);
    } else {
      visualization = createHistogram(data, col, type);
    }

    return html`<div style="padding: 8px 12px; min-width: 250px;">
      ${visualization}
    </div>`;
  };
}

function formatColumn(type) {
  return (x) => html`<div style="padding: 8px 12px;">
    ${icon_fns[type]()}
    <span style="vertical-align: middle;">${x}</span>
  </div>`;
}

function formatMetric(type) {
  return (x) => {
    if (x === "-" || x === null || x === undefined) {
      return html`<div style="text-align: right; padding: 8px 12px;">-</div>`;
    }

    let formatted;
    if (type === "percent") {
      formatted = d3.format(".1%")(x);
    } else {
      const sd = d3.deviation([x]);
      if (Number.isFinite(sd)) {
        const finiteFormat = d3.format(",." + d3.precisionFixed(sd / 10) + "f");
        formatted = Number.isFinite(x) ? finiteFormat(x) : d3.format(",.0f")(x);
      } else {
        formatted = d3.format(",.0f")(x);
      }
    }

    return html`<div
      style="
      text-align: right;
      padding: 8px 12px;
    "
    >
      ${formatted}
    </div>`;
  };
}

export function SummaryTable(
  dataObj,
  { label = "Summary", width = 800, tableStyles = {} } = {}
) {
  const data =
    typeof dataObj.numRows === "function"
      ? dataObj.objects()
      : typeof dataObj.toArray === "function"
      ? dataObj.toArray().map((r) => Object.fromEntries(r))
      : dataObj;

  const summaryData = Object.keys(data[0] || {}).map((col) => {
    const type = getType(data, col);
    const values = data.map((d) => d[col]).filter((v) => v != null);
    const pctMissing = (data.length - values.length) / data.length;

    let stats = {
      column: col,
      type: type,
      snapshot: "",
      missing: pctMissing,
    };

    if (type === "continuous") {
      stats.mean = values.length ? d3.mean(values) : "-";
      stats.median = values.length ? d3.median(values) : "-";
      stats.sd = values.length ? d3.deviation(values) : "-";
    } else {
      stats.mean = "-";
      stats.median = "-";
      stats.sd = "-";
    }

    return stats;
  });

  // Base cell styling
  const cellStyle = {
    height: tableStyles.rowHeight || "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "8px 12px",
    boxSizing: "border-box",
  };

  // Specific styles for different cell types
  const columnCellStyle = {
    ...cellStyle,
    justifyContent: "flex-start", // Left-align column names
  };

  const numericCellStyle = {
    ...cellStyle,
    justifyContent: "flex-end", // Right-align numeric values
  };

  // Custom styles for the table
  const customStyles = html`
    <style>
      .summary-table {
        border-collapse: separate !important;
        border-spacing: 0;
        border-radius: ${tableStyles.tableBorderRadius || "18px"} !important;
        overflow: hidden;
      }
      .summary-table thead th {
        background-color: ${tableStyles.headerBackground ||
        "#333333"} !important;
        color: ${tableStyles.headerTextColor || "#ffffff"} !important;
        height: ${tableStyles.headerHeight || "50px"};
        padding: 0 !important;
      }
      .summary-table tbody td {
        padding: 0 !important;
      }
      .summary-table th:first-child {
        border-top-left-radius: ${tableStyles.tableBorderRadius || "18px"};
      }
      .summary-table th:last-child {
        border-top-right-radius: ${tableStyles.tableBorderRadius || "18px"};
      }
    </style>
  `;

  return html`
    ${customStyles}
    ${Inputs.table(summaryData, {
      format: {
        column: (x, i) => html`<div style=${columnCellStyle}>
          ${formatColumn(summaryData[i].type)(x)}
        </div>`,
        type: (x) => html`<div style=${columnCellStyle}>${x}</div>`,
        snapshot: (x, i) => html`<div class="snapshot-cell">
          ${formatSnapshot(summaryData[i].type, data, summaryData[i].column)(x)}
        </div>`,
        missing: (x) => html`<div style=${numericCellStyle}>
          ${formatMetric("percent")(x)}
        </div>`,
        mean: (x) => html`<div style=${numericCellStyle}>
          ${formatMetric("number")(x)}
        </div>`,
        median: (x) => html`<div style=${numericCellStyle}>
          ${formatMetric("number")(x)}
        </div>`,
        sd: (x) => html`<div style=${numericCellStyle}>
          ${formatMetric("number")(x)}
        </div>`,
      },
      header: {
        column: "Column",
        snapshot: "Snapshot",
        missing: "Missing",
        mean: "Mean",
        median: "Median",
        sd: "SD",
      },
      width,
      class: "summary-table",
      style: {
        table: {
          borderRadius: tableStyles.tableBorderRadius || "18px",
          overflow: "hidden",
        },
      },
    })}
  `;
}
// Icon definitions from original code
const icon_fns = {
  ordinal: () => html`<div
    style="display:inline-block; border-radius:100%; width: 16px; height: 16px; background-color: ${colorMap.get(
      "ordinal"
    )
      .color}; transform: scale(1.3); vertical-align: middle; align-items: center; margin-right:8px;"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="2" height="2" fill="white" />
      <rect x="7" y="4" width="6" height="2" fill="white" />
      <rect x="4" y="7" width="2" height="2" fill="white" />
      <rect x="7" y="7" width="6" height="2" fill="white" />
      <rect x="4" y="10" width="2" height="2" fill="white" />
      <rect x="7" y="10" width="6" height="2" fill="white" />
    </svg>
  </div>`,

  date: () => html`<div
    style="display:inline-block; border-radius:100%; width: 16px; height: 16px; background-color: ${colorMap.get(
      "date"
    )
      .color}; transform: scale(1.3); vertical-align: middle; align-items: center; margin-right:8px;"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="5" width="8" height="1" fill="white" />
      <rect x="5" y="4" width="2" height="1" fill="white" />
      <rect x="9" y="4" width="2" height="1" fill="white" />
      <rect x="4" y="7" width="8" height="5" fill="white" />
    </svg>
  </div>`,

  continuous: () => html`<div
    style="display:inline-block; border-radius:100%; width: 16px; height: 16px; background-color: ${colorMap.get(
      "continuous"
    )
      .color}; transform: scale(1.3); vertical-align: middle; align-items: center; margin-right:8px;"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="12"
        width="4"
        height="2"
        transform="rotate(-90 4 12)"
        fill="white"
      />
      <rect
        x="7"
        y="12"
        width="6"
        height="2"
        transform="rotate(-90 7 12)"
        fill="white"
      />
      <rect
        x="10"
        y="12"
        width="8"
        height="2"
        transform="rotate(-90 10 12)"
        fill="white"
      />
    </svg>
  </div>`,
};

// Utility functions from original code
function getDateFormat(extent) {
  const formatMillisecond = d3.utcFormat(".%L"),
    formatSecond = d3.utcFormat(":%S"),
    formatMinute = d3.utcFormat("%I:%M"),
    formatHour = d3.utcFormat("%I %p"),
    formatDay = d3.utcFormat("%a %d"),
    formatWeek = d3.utcFormat("%b %d"),
    formatMonth = d3.utcFormat("%B"),
    formatYear = d3.utcFormat("%Y");

  return extent[1] > d3.utcYear.offset(extent[0], 1)
    ? formatYear
    : extent[1] > d3.utcMonth.offset(extent[0], 1)
    ? formatMonth
    : extent[1] > d3.utcWeek.offset(extent[0], 1)
    ? formatWeek
    : extent[1] > d3.utcDay.offset(extent[0], 1)
    ? formatDay
    : extent[1] > d3.utcHour.offset(extent[0], 1)
    ? formatHour
    : extent[1] > d3.utcMinute.offset(extent[0], 1)
    ? formatMinute
    : extent[1] > d3.utcSecond.offset(extent[0], 1)
    ? formatSecond
    : formatMillisecond;
}
