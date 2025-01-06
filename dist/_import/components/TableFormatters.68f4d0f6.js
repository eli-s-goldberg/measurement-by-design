import { html } from "../../_npm/htl@0.3.1/063eb405.js";

export function sparkbar(max) {
  return (x) => html`<div
    style="
    background: lightblue;
    color: black;
    width: ${(100 * x) / max}%;
    float: left;
    padding-right: 3px;
    padding-left: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: start;"
  >
    ${x.toLocaleString("en-US")}
  </div>`;
}

export function formatTextBold(text, charLimit = 50) {
  return (x) => {
    const str = x.toLocaleString("en-US");
    const wrapped = str.replace(new RegExp(`(.{${charLimit}})`, "g"), "$1\n");
    return html`<div
      style="
      color: black;
      font-weight: 500;
      float: left;
      box-sizing: border-box;
      white-space: wrap;
      display: flex;
      align-items: top;
      justify-content: start;"
    >
      ${wrapped}
    </div>`;
  };
}

export function formatStatus(status) {
  return html`<div
    style="
    display: inline-block;
    border-radius: 4px;
    white-space: wrap;
    background: ${status === "Deprecated" ? "#fee2e2" : "#dcfce7"};
    color: ${status === "Deprecated" ? "#991b1b" : "#166534"};
    font-size: 0.9em;"
  >
    ${status}
  </div>`;
}
export function formatTwoLevel(charLimit = 25) {
  return (value) => {
    if (value && value.header) {
      const wrappedDesc = value.description.replace(
        new RegExp(`(.{${charLimit}})`, "g"),
        "$1\n"
      );

      return html`<div
        style="
          float: left;
          margin: 0;
          padding: 0;"
      >
        <div
          style="
            font-weight: bold;
            float: left;
            margin: 0;
            white-space: wrap;
            margin-bottom: 10px"
        >
          ${value.header}
        </div>
        <div
          style="
            font-size: 0.9em;
            color: #666;
            float: left;
      
            white-space: wrap;"
        >
          ${wrappedDesc}
        </div>
      </div>`;
    }
    return String(value);
  };
}

export function formatWrappedText(charLimit = 50) {
  return (x) => {
    const str = String(x);
    const wrapped = str.replace(new RegExp(`(.{${charLimit}})`, "g"), "$1\n");
    return html`<div
      style="
        color: black;
        float: left;
        box-sizing: border-box;
        white-space: wrap;
        display: flex;
        align-items: top;
        justify-content: start;"
    >
      ${wrapped}
    </div>`;
  };
}

export function withRowHeight(height = "40px", verticalAlign = "center") {
  return (formatter) => (x) => {
    // If no formatter is provided, use a basic text formatter
    const defaultFormatter = (val) => html`<div>${String(val)}</div>`;
    const formattedContent = (formatter || defaultFormatter)(x);

    // Map alignment keywords to flex alignment values
    const alignmentMap = {
      top: "flex-start",
      center: "center",
      bottom: "flex-end",
    };

    // Get the alignment value or default to center if invalid value provided
    const alignItems = alignmentMap[verticalAlign] || "center";

    return html`<div
      style="
        min-height: ${height};
        display: flex;
        align-items: ${alignItems};
        width: 100%;
      "
    >
      ${formattedContent}
    </div>`;
  };
}

export function formatText(text, charLimit = 50) {
  return (x) => {
    const str = x.toLocaleString("en-US");
    const wrapped = str.replace(new RegExp(`(.{${charLimit}})`, "g"), "$1\n");
    return htl.html`<div style="
      color: black;
      min-height: 40px;
      float: left;
      padding: 3px;
      box-sizing: border-box;
      white-space: pre-wrap;
      display: flex;
      align-items: center;
      justify-content: start;">${wrapped}</div>`;
  };
}
// font: 52px/1.5 "ITC Charter Com", serif;

export const withTooltip =
  (tooltipContent) =>
  (formatter = (d) => d) => {
    return (value, row) => {
      const formattedValue = formatter(value, row);
      const tooltip =
        typeof tooltipContent === "function"
          ? tooltipContent(row)
          : tooltipContent;

      return html`
        <div
          style="position: relative; display: inline-block;"
          title="${tooltip}"
        >
          ${formattedValue}
        </div>
      `;
    };
  };

// Example version tooltips mapping
export const versionTooltips = {
  v3: "Version 3: Latest production release with enhanced targeting",
  vs3: "Version S3: Special release with experimental features",
  // Add more version mappings as needed
};
