import { html } from "../../_node/htl@0.3.1/index.692f28bb.js";

export function createUnifiedSplitPanel(config) {
  const instanceId = `split-panel-${Math.random().toString(36).substr(2, 9)}`;

  // Pull out your other config, plus optional tableStyles
  const {
    title = "",
    subtitle = "",
    description = {
      initialText: "",
      highlightedText: "",
      finalText: "",
    },
    gridSplit = { left: 80, right: 20 },
    // Provide a default card: true if not specified.
    leftContent = {
      type: "none",
      content: null,
      card: true,
      cardBackground: "#ffffff",
    },
    rightContent = {
      type: "none",
      content: null,
      card: true,
      cardBackground: "#ffffff",
    },
    subheader = "",
    theme = "light",
    // If user doesn't provide tableStyles, default to an empty object
    tableStyles = {},
  } = config;

  // Destructure with fallback defaults
  const {
    headerBackground = "black",
    headerTextColor = "white",
    headerHeight = "auto",
    tableBorderRadius = "18px",
  } = tableStyles;

  function createCards(cards) {
    if (!cards || !cards.length) return "";
    return html`
      <div class="${instanceId}-cards-container">
        ${cards.map((card) => {
          const classes = [
            `${instanceId}-card`,
            card.flavor ? `${instanceId}-card-${card.flavor}` : "",
            card.highlight ? `${instanceId}-card-highlight` : "",
          ].filter(Boolean);

          return html`
            <div class="${classes.join(" ")}">
              <div class="${instanceId}-card-header">${card.title ?? ""}</div>
              <div class="horizontal-line"></div>
              <div class="${instanceId}-card-value">${card.value ?? ""}</div>
              ${card.subtitle
                ? html`<div class="${instanceId}-card-subtitle">
                    ${card.subtitle}
                  </div>`
                : ""}
              ${card.description
                ? html`<div class="${instanceId}-card-description">
                    ${card.description}
                  </div>`
                : ""}
            </div>
          `;
        })}
      </div>
    `;
  }

  function renderBodyDescription(bodyDescription) {
    if (!bodyDescription) return "";

    const fontStyles = bodyDescription.fontStyles || {
      fontFamily: '"Helvetica Neue", sans-serif',
      fontSize: "24px",
      fontWeight: "400",
      lineHeight: "31px",
      marginBottom: "2rem",
      letterSpacing: "-0.03em",
    };

    const styleString = Object.entries(fontStyles)
      .map(
        ([key, value]) =>
          `${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${value}`
      )
      .join(";");

    return html`
      <div class="${instanceId}-body-description" style="${styleString}">
        ${bodyDescription.initialText ?? ""}
        ${bodyDescription.highlightedText
          ? html`<span class="${instanceId}-body-highlight">
              ${bodyDescription.highlightedText}
            </span>`
          : ""}
        ${bodyDescription.finalText ?? ""}
      </div>
    `;
  }

  function renderContent(contentConfig) {
    if (!contentConfig) return "";
    const showCard = contentConfig.card !== false;
    const cardBackground = contentConfig.cardBackground || "#ffffff";
    const content = [];

    switch (contentConfig.type) {
      case "plot":
        if (showCard) {
          content.push(html`
            <div
              class="${instanceId}-plot-container"
              style="background-color: ${cardBackground}"
            >
              ${contentConfig.content}
            </div>
          `);
        } else {
          content.push(html`<div>${contentConfig.content}</div>`);
        }
        break;
      case "plots":
        for (const onePlot of contentConfig.content) {
          if (showCard) {
            content.push(html`
              <div
                class="${instanceId}-plot-container"
                style="background-color: ${cardBackground}"
              >
                ${onePlot}
              </div>
            `);
          } else {
            content.push(html`<div>${onePlot}</div>`);
          }
        }
        break;
      case "table":
        if (showCard) {
          content.push(html`
            <div
              class="${instanceId}-table-container"
              style="background-color: ${cardBackground}"
            >
              ${contentConfig.content}
            </div>
          `);
        } else {
          content.push(html`
            <div
              class="table-shadow"
              style="background-color: ${cardBackground}"
            >
              ${contentConfig.content}
            </div>
          `);
        }
        break;
      case "cards":
        // For cards type, we need to handle individual card backgrounds
        content.push(createCards(contentConfig.content));
        break;
      default:
        if (contentConfig.content) {
          if (showCard) {
            content.push(html`
              <div
                class="${instanceId}-card"
                style="background-color: ${cardBackground}"
              >
                ${contentConfig.content}
              </div>
            `);
          } else {
            content.push(contentConfig.content);
          }
        }
    }

    if (contentConfig.bodyDescription) {
      content.push(renderBodyDescription(contentConfig.bodyDescription));
    }
    return html`${content}`;
  }

  const element = html`
    <style>
      /* Theme Variables */
      .${instanceId} {
        --usp-bg-color: ${theme === "dark" ? "#f2f2f2" : "#ffffff"};
        --usp-text-color: ${theme === "dark" ? "#1a1a1a" : "#1a1a1a"};
        --usp-border-color: ${theme === "dark" ? "#e0e0e0" : "#e0e0e0"};
        --usp-highlight-color: #ffb600;
        --key-takeaway-bg: #ffb600;
        --key-takeaway-text: #000000;
        --value-at-stake-bg: rgb(36, 29, 14);
        --value-at-stake-text: #ffffff;
      }

      /* Section Layout */
      .${instanceId}-section {
        position: relative;
        z-index: 0;
        background-color: transparent;
        padding: 1.5rem 0;
      }

      .${instanceId}-section::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 100vw;
        bottom: 0;
        background-color: ${theme === "dark" ? "#f2f2f2" : "#ffffff"};
        transform: translateX(-50%);
        z-index: -1;
      }

      .${instanceId}-section .usp-content {
        position: relative;
        z-index: 1;
      }

      /* Content Layout */
      .${instanceId} .usp-content {
        max-width: var(--observablehq-max-width, 1200px);
        margin: 0 auto;
        padding: 0;
        color: var(--usp-text-color);
      }

      .${instanceId} .usp-grid {
        display: grid;
        grid-template-columns: ${gridSplit.left}fr ${gridSplit.right}fr;
        gap: 20px;
      }

      /* Typography */
      .${instanceId} .usp-title {
        font-family: "Georgia", serif;
        font-weight: 400;
        font-size: 38px;
        letter-spacing: -0.03em;
        margin-bottom: 0.25rem;
        white-space: nowrap;
      }

      .${instanceId} .usp-subtitle {
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 24px;
        letter-spacing: -0.03em;
        margin-bottom: 1rem;
      }

      .${instanceId} .usp-description,
      .${instanceId}-body-description {
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 400;
        font-size: 24px;
        line-height: 31px;
        margin-bottom: 2rem;
      }

      .${instanceId} .usp-highlight,
      .${instanceId}-body-highlight {
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 24px;
        background-color: var(--key-takeaway-bg);
        padding: 0 4px;
      }

      /* Cards Container */
      .${instanceId}-cards-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      /* Base Card */
      .${instanceId}-card {
        background: #ffffff;
        border-radius: 18px;
        padding: 24px;
        border: 1px solid var(--usp-border-color);
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      /* Base Card Typography */
      .${instanceId}-card .${instanceId}-card-header {
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 20px;
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card .${instanceId}-card-value {
        font-family: "Helvetica Neue", sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card .${instanceId}-card-subtitle {
        font-family: "Helvetica Neue", sans-serif;
        font-size: 16px;
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card .${instanceId}-card-description {
        font-family: "Helvetica Neue", sans-serif;
        font-size: 18px;
        line-height: 1.4;
      }

      /* Key Takeaway Card Style */
      .${instanceId}-card.${instanceId}-card-keyTakeaway {
        background-color: var(--key-takeaway-bg);
        border: none;
      }

      .${instanceId}-card.${instanceId}-card-keyTakeaway
        .${instanceId}-card-header {
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 12px;
        line-height: 14.65px;
        letter-spacing: -0.03%;
        color: var(--key-takeaway-text);
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card.${instanceId}-card-keyTakeaway
        .${instanceId}-card-value {
        font-family: "Georgia", serif;
        font-size: 52px;
        font-weight: 500;
        color: var(--key-takeaway-text);
        margin-top: 2rem;
        margin-bottom: -0.5rem;
      }

      .${instanceId}-card.${instanceId}-card-keyTakeaway
        .${instanceId}-card-subtitle {
        font-family: "Helvetica Neue", sans-serif;
        font-size: 18px;
        font-weight: 500;
        line-height: 26px;
        color: var(--key-takeaway-text);
        opacity: 0.9;
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card.${instanceId}-card-keyTakeaway
        .${instanceId}-card-description {
        font-family: "Helvetica Neue", sans-serif;
        font-size: 18px;
        color: var(--key-takeaway-text);
        opacity: 0.9;
      }

      /* Value at Stake Card Style */
      .${instanceId}-card.${instanceId}-card-valueAtStake {
        background-color: var(--value-at-stake-bg);
        border: none;
      }

      .${instanceId}-card.${instanceId}-card-valueAtStake
        .${instanceId}-card-header {
        font-family: "Helvetica Neue", sans-serif;
        font-weight: 700;
        font-size: 12px;
        color: var(--key-takeaway-text);
        margin-bottom: 0.5rem;
      }
      .${instanceId}-card.${instanceId}-card-valueAtStake
        .${instanceId}-card-value {
        font-family: "Georgia", serif;
        font-size: 52px;
        font-weight: 400;
        color: var(--key-takeaway-text);
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card.${instanceId}-card-valueAtStake
        .${instanceId}-card-subtitle {
        font-family: "Helvetica Neue", sans-serif;
        font-size: 16px;
        color: var(--key-takeaway-text);
        opacity: 0.9;
        margin-bottom: 0.5rem;
      }

      .${instanceId}-card.${instanceId}-card-valueAtStake
        .${instanceId}-card-description {
        color: var(--value-at-stake-text);
      }

      .${instanceId}-card.${instanceId}-card-valueAtStake
        .${instanceId}-card-subtitle,
      .${instanceId}-card.${instanceId}-card-valueAtStake
        .${instanceId}-card-description {
        opacity: 0.9;
      }

      /* Card Highlight Override */
      .${instanceId}-card.${instanceId}-card-highlight {
        background-color: var(--usp-highlight-color) !important;
      }

      .${instanceId}-card.${instanceId}-card-highlight
        .${instanceId}-card-header,
      .${instanceId}-card.${instanceId}-card-highlight
        .${instanceId}-card-value,
      .${instanceId}-card.${instanceId}-card-highlight
        .${instanceId}-card-subtitle,
      .${instanceId}-card.${instanceId}-card-highlight
        .${instanceId}-card-description {
        color: #000 !important;
      }

      /* Table Container */
      /* Table Shadow for card: false */
      .table-shadow {
        background: #ffffff;
        border-radius: ${tableBorderRadius};
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12),
          0 12px 24px rgba(0, 0, 0, 0.08);
        padding: 0px;
        border: 1px solid var(--usp-border-color);
        overflow-x: auto;
      }

      .${instanceId}-table-container {
        background: #ffffff;
        border-radius: 18px;
        /* Softer layered shadow */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12),
          0 12px 24px rgba(0, 0, 0, 0.08);
        padding: 24px;
        border: 0;
        overflow-x: auto;
        margin-bottom: 1.5rem;
      }

      /* Use tableStyles here */
      .${instanceId}-table-container table thead tr th {
        background-color: ${headerBackground} !important;
        color: ${headerTextColor} !important;
        height: ${headerHeight};
      }
      .${instanceId}-table-container table {
        border-collapse: separate;
        border-spacing: 0;
        border: 0px solid #ccc;
        border-radius: ${tableBorderRadius};
        overflow: hidden;
      }

      /* Plot Container */
      .${instanceId}-plot-container {
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12),
          0 12px 24px rgba(0, 0, 0, 0.08);
        padding: 24px;
        border: 0;
        margin-bottom: 1.5rem;
      }
    </style>

    <div class="${instanceId}-section">
      <div class="${instanceId}">
        <div class="usp-content">
          ${title ? html`<div class="usp-title">${title}</div>` : ""}
          ${subtitle ? html`<div class="usp-subtitle">${subtitle}</div>` : ""}
          ${(description.initialText ||
            description.highlightedText ||
            description.finalText) &&
          html`
            <div class="usp-description">
              ${description.initialText}
              ${description.highlightedText
                ? html`<span class="usp-highlight">
                    ${description.highlightedText}
                  </span>`
                : ""}
              ${description.finalText}
            </div>
          `}

          <div class="usp-grid">
            <div>${renderContent(leftContent)}</div>
            <div>${renderContent(rightContent)}</div>
          </div>
          ${subheader ? html`<div>${subheader}</div>` : ""}
        </div>
      </div>
    </div>
  `;

  return element;
}
