import { html } from "htl";

export function createSplitPanelTableLayout(config) {
  // Destructure configuration with added title
  const {
    title = "", // Add title parameter
    subtitle = "",
    description = {
      initialText: "",
      highlightedText: "",
      finalText: "",
    },
    gridSplit = { left: 80, right: 20 },
    table = null,
    subheader = "",
  } = config;

  const element = html`
    <style>
      .layout-grid {
        display: grid;
        grid-template-columns: ${gridSplit.left}fr ${gridSplit.right}fr;
        gap: 20px;
        align-items: start;
      }

      table thead tr th {
        background-color: black !important;
        color: white !important;
        padding: 12px 16px;
      }

      table {
        border-collapse: separate;
        border-spacing: 0;
        border: 0px solid #ccc;
        border-radius: 16px;
        overflow: hidden;
        width: 100%;
      }

      table td {
        padding: 12px 16px;
      }

      .full-width-section-left {
        position: relative;
        background-color: transparent;
        padding: 1.5rem 0;
      }

      .full-width-section-left::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 100vw;
        height: 100%;
        background-color: #f2f2f2;
        transform: translateX(-50%);
        z-index: -1;
      }

      .full-width-section-left .content-container {
        max-width: var(--observablehq-max-width);
        margin: 0 auto;
        padding: 0 0rem;
        box-sizing: border-box;
      }

      .text-title {
        font-family: "Georgia", serif;
        font-weight: 400;
        font-size: 38px;
        line-height: 43.18px;
        letter-spacing: -3%;

        margin-bottom: 1rem;
      }
    </style>

    <div class="full-width-section-left">
      <div class="content-container">
        ${title ? html`<div class="text-title">${title}</div>` : ""}
        ${subtitle ? html`<div class="page-sub-title">${subtitle}</div>` : ""}
        <div class="layout-grid">
          <div>
            ${description.initialText ||
            description.highlightedText ||
            description.finalText
              ? html`
                  <div class="special-note">
                    <div class="text-subheader-pullquote">
                      ${description.initialText}
                      ${description.highlightedText
                        ? html`<a class="text-subheader-pullquote-highlight">
                            ${description.highlightedText}
                          </a>`
                        : ""}
                      ${description.finalText}
                    </div>
                  </div>
                `
              : ""}
          </div>
          <div>
            ${table ? html`<div id="table-container">${table}</div>` : ""}
          </div>
        </div>
        ${subheader
          ? html`
              <div style="height: 32px;"></div>
              <div class="text-subheader">${subheader}</div>
            `
          : ""}
      </div>
    </div>
  `;

  return element;
}

// Example usage:
/*
const table = view(Inputs.table(version, {
  // ... table configuration
}));

const config = {
  title: "Imaging Facility Analysis",  // New title parameter
  subtitle: "Where are members going for imaging?",
  description: {
    initialText: "We identified ",
    highlightedText: "8 categories of image procedures",
    finalText: " that can be done either at preferred or non-preferred facilities."
  },
  table: table,
  subheader: "Version History"
};

const element = createSplitPanelTableLayout(htl, config);
view(element);
*/
