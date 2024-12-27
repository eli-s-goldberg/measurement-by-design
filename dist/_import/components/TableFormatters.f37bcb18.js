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
      min-height: 40px;
      float: left;
      padding: 3px;
      box-sizing: border-box;
      white-space: pre-wrap;
      display: flex;
      align-items: center;
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
    padding: 2px 8px;
    border-radius: 4px;
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
