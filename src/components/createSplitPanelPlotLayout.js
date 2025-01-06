import { html } from "htl";

export function createSplitPanelPlotLayout(config) {
  const {
    title = "",
    subtitle = "",
    description = {
      initialText: "",
      highlightedText: "",
      finalText: "",
    },
    plot = null,
    cards = [],
    gridSplit = { left: 80, right: 20 },
    subheader = "",
  } = config;

  const element = html`
    <style>
      .spp-layout-grid {
        display: grid;
        grid-template-columns: ${gridSplit.left}fr ${gridSplit.right}fr;
        gap: 20px;
        align-items: start;
      }

      .spp-full-width-section-left {
        position: relative;
        background-color: transparent;
        padding: 1.5rem 0;
      }

      .spp-full-width-section-left::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 100vw;
        height: 100%;
        background-color: #fff;
        transform: translateX(-50%);
        z-index: -1;
      }

      .spp-content-container {
        max-width: var(--observablehq-max-width);
        margin: 0 auto;
        padding: 0 0rem;
        box-sizing: border-box;
      }

      .spp-text-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .spp-page-sub-title {
        font-size: 1.25rem;
        color: #666;
        margin-bottom: 1.5rem;
      }

      .spp-plot-container {
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 24px;
        border: 1px solid #e0e0e0;
      }

      .spp-cards-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .spp-card {
        background: #ffffff;
        border-radius: 10px;
        padding: 24px;
        border: 1px solid #e0e0e0;
      }

      .spp-card-yellow {
        background: #f9b84d;
      }

      .spp-text-header {
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #1a1a1a;
      }

      .spp-horizontal-line {
        height: 1px;
        background: rgba(0, 0, 0, 0.1);
        margin: 8px 0;
      }

      .spp-grid-value {
        font-size: 2rem;
        font-weight: 500;
        color: #1a1a1a;
        margin: 0.5rem 0;
      }

      .spp-grid-subtitle {
        font-size: 0.875rem;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      .spp-grid-description {
        font-size: 0.875rem;
        line-height: 1.4;
        color: #1a1a1a;
      }

      .spp-special-note {
        margin-bottom: 20px;
      }

      .spp-text-subheader-pullquote {
        font-size: 1.25rem;
        line-height: 1.6;
        color: #666;
      }

      .spp-text-subheader-pullquote-highlight {
        color: #1a1a1a;
        font-weight: 600;
      }

      .spp-text-subheader {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
      }
    </style>

    <div class="spp-full-width-section-left">
      <div class="spp-content-container">
        ${title ? html`<div class="text-title">${title}</div>` : ""}
        ${subtitle ? html`<div class="page-sub-title">${subtitle}</div>` : ""}
        ${description.initialText ||
        description.highlightedText ||
        description.finalText
          ? html`
              <div class="description-container">
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

        <div class="spp-layout-grid">
          <div class="spp-plot-container">${plot || ""}</div>
          <div class="spp-cards-container">
            ${cards.map((card) => {
              if (!card) return "";
              return html`
                <div class="card card-yellow">
                  <div class="text-header">${card.title || ""}</div>
                  <div class="horizontal-line"></div>
                  <div class="grid-value">${card.value || ""}</div>
                  <div class="grid-subtitle">${card.subtitle || ""}</div>
                  ${card.description
                    ? html`<div class="grid-description">
                        ${card.description}
                      </div>`
                    : ""}
                </div>
              `;
            })}
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
