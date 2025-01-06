import { html } from "../../_node/htl@0.3.1/index.692f28bb.js";
export function createSplitPanelSummaryLayout(config) {
  // Destructure configuration
  const {
    title = "",
    subtitle = "",
    description = {},
    tabs = [],
    cards = [],
  } = config;

  function setupTabListeners(container) {
    if (!container) return;

    const tabElements = container.querySelectorAll(".tab");
    const contentElements = container.querySelectorAll(".tab-content");

    tabElements.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabElements.forEach((t) => t.classList.remove("active"));
        contentElements.forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        contentElements[index].classList.add("active");
      });
    });
  }

  function createTabs(tabs) {
    // Create a unique identifier for this instance
    const containerId = `tab-container-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const tabsContainer = html`
      <div class="container" id="${containerId}">
        <div class="tabs">
          ${tabs.map(
            (tab) => html`
              <div class="tab ${tab.isActive ? "active" : ""}">${tab.name}</div>
            `
          )}
        </div>
        ${tabs.map(
          (tab) => html`
            <div class="tab-content ${tab.isActive ? "active" : ""}">
              <p class="tab-header-style">${tab.title}</p>
              ${tab.subtitle
                ? html`<p class="table-header-style">${tab.subtitle}</p>`
                : ""}
              <div class="table-body-style">${tab.description}</div>
            </div>
          `
        )}
      </div>
    `;

    // Setup the event listeners after the element is mounted
    setTimeout(() => {
      const container = document.getElementById(containerId);
      setupTabListeners(container);
    }, 0);

    return tabsContainer;
  }

  function createCards(cards) {
    return html`
      ${cards.map(
        (card) => html`
          <div class="card card-yellow">
            <div class="text-header">${card.title}</div>
            <div class="horizontal-line"></div>
            <div class="grid-value">${card.value}</div>
            <div class="grid-subtitle">${card.subtitle}</div>
            ${card.description
              ? html`<div class="grid-description">${card.description}</div>`
              : ""}
          </div>
        `
      )}
    `;
  }

  function createDescription(description) {
    const {
      initialText = "",
      highlightedText = "",
      finalText = "",
    } = description;

    if (!initialText && !highlightedText && !finalText) return "";

    return html`
      <div class="special-note">
        <div class="text-subheader-pullquote">
          ${initialText}
          ${highlightedText
            ? html`<a class="text-subheader-pullquote-highlight">
                ${highlightedText}
              </a>`
            : ""}
          ${finalText}
        </div>
      </div>
    `;
  }

  // Main layout
  return html`
    <div class="full-width-section">
      <div class="content-container">
        ${title ? html`<div class="text-title">${title}</div>` : ""}
        ${subtitle ? html`<div class="page-sub-title">${subtitle}</div>` : ""}

        <div class="layout-grid">
          <div>
            ${createDescription(description)}
            ${tabs.length > 0 ? createTabs(tabs) : ""}
          </div>
          <div>${cards.length > 0 ? createCards(cards) : ""}</div>
        </div>
      </div>
    </div>
  `;
}
