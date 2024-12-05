import { html } from "htl";

// Example content structure
const defaultContent = {
  title: {
    text: "Personalized Email",
    font: "system-ui",
    color: "white",
    style: "font-weight: bold; line-height: 1.2;",
  },
  subtitle: {
    text: "Agile Navigation Marketing",
    font: "system-ui",
    color: "white",
    style: "font-size: 1.125rem;",
  },
  toplineProse: {
    text: "Could you be overpaying for imaging?",
    font: "system-ui",
    color: "#ffffff",
    style: "font-weight: 500;",
  },
  details: {
    text: "Switch to an outpatient center and save up to $735 on your next imaging visit",
    font: "system-ui",
    color: "#ffffff",
    style: "line-height: 1.4;",
  },
  colorScheme: {
    primary: "#115e59",
    secondary: "#ef4444",
    background: "#ffffff",
    text: "#374151",
    accent: "#f3f4f6",
  },
  mapDataPoints: {
    locationArray: [
      {
        id: 1,
        name: "Mass General Hospital",
        lat: 42.3632,
        long: -71.0686,
        cost: 1200,
        savings: 0,
        label: "Current Provider",
        mark: "current",
      },
      {
        id: 2,
        name: "CareWell Urgent Care",
        lat: 42.3589,
        long: -71.0518,
        cost: 700,
        savings: 500,
        label: "Recommended",
        mark: "alternative",
      },
      {
        id: 3,
        name: "Beth Israel Deaconess",
        lat: 42.3389,
        long: -71.1067,
        cost: 400,
        savings: 800,
        label: "Best Value",
        mark: "alternative",
      },
    ],
    font: "system-ui",
    color: "#374151",
    style: "font-size: 0.875rem;",
  },
  highlights: [
    {
      number: 1,
      title: "Use of Loss Aversion behavioral economics principle",
      description:
        '"are you overpaying?" was tested and predicted to be the most effective for this member',
    },
    {
      number: 2,
      title: "Personalized, member-specific savings estimate",
      description:
        "of $735 is a compelling hook, and presenting alternative locations near the member's home has a clear call to action",
    },
    {
      number: 3,
      title: "Addresses key barrier",
      description:
        "doctor and patient lack of awareness of potential cost savings",
    },
    {
      number: 4,
      title: "Corresponding link to portal",
      description:
        "shows details of the savings, and drives the desired behavior change of member switching to an outpatient imaging provider",
    },
    {
      number: 5,
      title: "Engaging, relevant, and visually appealing",
      description:
        "Overall unsubscribe rates are ~60% lower than transactional / mass marketing emails sent by payers",
    },
  ],
};

export function EmailComparisonView(content = defaultContent) {
  // Function to initialize map and add markers
  function createMap(container, locations) {
    if (!container || typeof L === "undefined") return;

    // Clear any existing map instance
    container.innerHTML = "";

    const map = L.map(container).setView(
      [42.3632, -71.0686], // Default to Boston coordinates
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      opacity: 0.5,
    }).addTo(map);

    // Current location marker (red)
    const currentIcon = L.divIcon({
      html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: rgba(220, 38, 38, 0.2); 
            border-radius: 50%;
            border: 3px solid #dc2626;
            position: absolute;
            top: -12px;
            left: -12px;
          "></div>
        `,
      className: "current-location-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12], // Center the icon on the marker position
    });

    // Alternative location marker (green)
    const alternativeIcon = L.divIcon({
      html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: rgba(34, 197, 94, 0.2); 
            border-radius: 50%;
            border: 3px solid #22c55e;
          "></div>
        `,
      className: "alternative-location-marker",
      iconSize: [24, 24],
    });

    // Add markers
    locations.forEach((location) => {
      const isCurrentLocation = location.type === "current";
      const icon = isCurrentLocation ? currentIcon : alternativeIcon;
      const color = isCurrentLocation ? "#dc2626" : "#22c55e";

      L.marker([location.lat, location.long], { icon })
        .bindPopup(
          `
            <div style="font-family: system-ui, sans-serif; font-size: 14px;">
              <h3 style="color: ${color}; margin: 0 0 8px 0">${
            location.name
          }</h3>
              <p style="margin: 0 0 4px 0">${location.label}</p>
              ${
                location.savings
                  ? `<p style="margin: 0; color: ${color}; font-weight: bold">Save $${location.savings}</p>`
                  : ""
              }
            </div>
          `
        )
        .addTo(map);
    });

    return map;
  }
  const container = html`<div></div>`;

  // Add Leaflet CSS if not already present
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
  }

  // Add Leaflet JS if not already present
  if (!document.querySelector('script[src*="leaflet.js"]')) {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initializeMap();
    document.head.appendChild(script);
  } else {
    setTimeout(initializeMap, 0);
  }

  function initializeMap() {
    const mapContainer = container.querySelector(".map-area");
    if (mapContainer && typeof L !== "undefined") {
      const locations = [
        {
          name: "Mass General Hospital",
          lat: 42.3632,
          long: -71.0686,
          type: "current",
          label: "Current Provider",
        },
        {
          name: "CareWell Urgent Care",
          lat: 42.3589,
          long: -71.0518,
          type: "alternative",
          label: "Recommended Alternative",
          savings: 500,
        },
        {
          name: "Beth Israel Deaconess",
          lat: 42.3389,
          long: -71.1067,
          type: "alternative",
          label: "Best Value Option",
          savings: 800,
        },
      ];
      createMap(mapContainer, locations);
    }
  }

  function render() {
    container.innerHTML = "";
    container.appendChild(html`
      <style>
        .comparison-container {
          font-family: ${content.title.font};
          max-width: 1400px;
          margin: 0 auto;
          color:
        }

        .header {
          background: ${content.colorScheme.primary};
          padding: 2rem;
          border-radius: 0.75rem 0.75rem 0 0;
        }

        .header h1 {
          color: ${content.title.color};
          ${content.title.style}
          margin: 0 0 0.5rem 0;
        }

        .header p {
          color: ${content.subtitle.color};
          ${content.subtitle.style}
          margin: 0;
        }

        .content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          padding: 2rem;
          background: ${content.colorScheme.background};
          border-radius: 0 0 0.75rem 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .mockup-section {
          border: 2px solid ${content.colorScheme.accent};
          border-radius: 0.5rem;
          padding: 1.5rem;
        }

        .map-container {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        .map-placeholder {
          background: ${content.colorScheme.accent};
          height: 300px;
          border-radius: 0.5rem;
        }

        .locations-list {
          background: ${content.colorScheme.background};
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid ${content.colorScheme.accent};
        }

        .location-card {
          padding: 0.75rem;
          border-bottom: 1px solid ${content.colorScheme.accent};
          font-family: ${content.details.font};
          color: ${content.details.color};
        }

        .location-card:last-child {
          border-bottom: none;
        }

        .location-name {
          font-weight: bold;
          margin-bottom: 0.25rem;
          color: ${content.colorScheme.text};
        }

        .location-savings {
          color: #22c55e;
          font-weight: 500;
        }

        .numbered-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          font-family: ${content.toplineProse.font};
        }

        .number {
          width: 1.5rem;
          height: 1.5rem;
          background: ${content.colorScheme.secondary};
          color: ${content.colorScheme.background};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .action-button {
          background: ${content.colorScheme.primary};
          color: ${content.colorScheme.background};
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          text-align: center;
          margin: 1rem 0;
          font-family: ${content.details.font};
        }

        .topline-text {
          ${content.toplineProse.style}
        }

        .details-text {
          ${content.details.style}
        }
      </style>

      <div class="comparison-container">
        <div class="header">
          <h1>${content.title.text}</h1>
          <p>${content.subtitle.text}</p>
        </div>

        <div class="content">
          <div class="mockup-section">
            <div class="numbered-item">
              <div class="number">1</div>
              <div class="topline-text">${content.toplineProse.text}</div>
            </div>

            <div
              style="background: ${content.colorScheme
                .accent}; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;"
            >
              <div class="numbered-item" style="margin-bottom: 0;">
                <div class="number">2</div>
                <div class="details-text">${content.details.text}</div>
                <div class="number">3</div>
              </div>
            </div>

            <div class="action-button">
              View Details
              <span
                class="number"
                style="display: inline-flex; margin-left: 0.5rem;"
                >4</span
              >
            </div>

            <div class="map-container">
              <div class="map-area">
                <!-- Map will be initialized here -->
              </div>

              <div class="locations-list">
                ${content.mapDataPoints.locationArray.map(
                  (location) => html`
                    <div class="location-card">
                      <div class="location-name">${location.name}</div>
                      <div>${location.label}</div>
                      ${location.savings > 0
                        ? html`<div class="location-savings">
                            Save $${location.savings}
                          </div>`
                        : ""}
                    </div>
                  `
                )}
              </div>
            </div>

            <div class="numbered-item">
              <div class="number">5</div>
              <div>
                <div style="font-weight: bold;">
                  How to switch to a lower cost imaging center
                </div>
                <div
                  style="color: ${content.colorScheme
                    .text}; margin-top: 0.5rem;"
                >
                  <div>📍 Find locations near you</div>
                  <div>👥 Get help from our support team</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2
              style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: ${content
                .colorScheme.text};"
            >
              Mockup Highlights
            </h2>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              ${content.highlights.map(
                (highlight) => html`
                  <div class="numbered-item">
                    <div class="number">${highlight.number}</div>
                    <div>
                      <div
                        style="font-weight: bold; margin-bottom: 0.5rem; color: ${content
                          .colorScheme.text};"
                      >
                        ${highlight.title}
                      </div>
                      <div
                        style="color: ${content.colorScheme
                          .text}; font-size: 0.875rem;"
                      >
                        ${highlight.description}
                      </div>
                    </div>
                  </div>
                `
              )}
            </div>
          </div>
        </div>
      </div>
    `);
  }

  render();
  return container;
}

export function CleanEmailView(content = defaultContent) {
  const container = html`<div></div>`;

  // Add Leaflet CSS if not already present
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
  }

  // Add Leaflet JS if not already present
  if (!document.querySelector('script[src*="leaflet.js"]')) {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      render();
      initializeMap();
    };
    document.head.appendChild(script);
  } else {
    render();
    setTimeout(initializeMap, 0);
  }

  function createMap(container, locations) {
    if (!container || typeof L === "undefined") return;

    // Clear any existing map instance
    container.innerHTML = "";

    const map = L.map(container).setView(
      [42.3632, -71.0686], // Default to Boston coordinates
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      opacity: 0.5,
    }).addTo(map);

    // Current location marker (red)
    const currentIcon = L.divIcon({
      html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: rgba(220, 38, 38, 0.2); 
            border-radius: 50%;
            border: 3px solid #dc2626;
            position: absolute;
            top: -12px;
            left: -12px;
          "></div>
        `,
      className: "current-location-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12], // Center the icon on the marker position
    });

    // Alternative location marker (green)
    const alternativeIcon = L.divIcon({
      html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: rgba(34, 197, 94, 0.2); 
            border-radius: 50%;
            border: 3px solid #22c55e;
          "></div>
        `,
      className: "alternative-location-marker",
      iconSize: [24, 24],
    });

    // Add markers
    locations.forEach((location) => {
      const isCurrentLocation = location.type === "current";
      const icon = isCurrentLocation ? currentIcon : alternativeIcon;
      const color = isCurrentLocation ? "#dc2626" : "#22c55e";

      L.marker([location.lat, location.long], { icon })
        .bindPopup(
          `
            <div style="font-family: system-ui, sans-serif; font-size: 14px;">
              <h3 style="color: ${color}; margin: 0 0 8px 0">${
            location.name
          }</h3>
              <p style="margin: 0 0 4px 0">${location.label}</p>
              ${
                location.savings
                  ? `<p style="margin: 0; color: ${color}; font-weight: bold">Save $${location.savings}</p>`
                  : ""
              }
            </div>
          `
        )
        .addTo(map);
    });

    return map;
  }

  function initializeMap() {
    const mapArea = container.querySelector(".map-area");
    if (mapArea && typeof L !== "undefined") {
      const locations = [
        {
          name: "Mass General Hospital",
          lat: 42.3632,
          long: -71.0686,
          type: "current",
          label: "Current Provider",
        },
        {
          name: "CareWell Urgent Care",
          lat: 42.3589,
          long: -71.0518,
          type: "alternative",
          label: "Recommended Alternative",
          savings: 500,
        },
        {
          name: "Beth Israel Deaconess",
          lat: 42.3389,
          long: -71.1067,
          type: "alternative",
          label: "Best Value Option",
          savings: 800,
        },
      ];
      createMap(mapArea, locations);
    }
  }

  function render() {
    container.innerHTML = "";
    container.appendChild(html`
      <style>
        .email-container {
          font-family: system-ui, -apple-system, sans-serif;
          background: #fff;
          min-height: 100vh;
        }

        .header {
          background: #115e59;
          padding: 2rem;
        }

        .header h1 {
          color: #ffffff;
          font-size: 2rem;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
        }

        .header p {
          color: #ffffff;
          font-size: 1.125rem;
          margin: 0;
        }

        .email-content {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 2rem;
        }

        .email-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 2rem;
        }

        .question-text {
          font-size: 1.125rem;
          color: #374151;
          margin-bottom: 1.5rem;
        }

        .savings-box {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .view-details {
          background: #115e59;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .locations-section {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .map-area {
          border-radius: 0.5rem;
          min-height: 400px;
          background: #f3f4f6;
        }

        .location-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .location-item {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .location-item:last-child {
          border-bottom: none;
        }

        .location-name {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .savings-text {
          color: #22c55e;
          font-weight: 500;
        }

        .switch-info {
          margin-top: 2rem;
        }

        .switch-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .help-options {
          display: flex;
          gap: 3rem;
        }

        .help-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
        }

        /* Leaflet specific styles */
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 0.5rem;
        }
      </style>

      <div class="email-container">
        <div class="header">
          <h1>Personalized Email</h1>
          <p>Agile Navigation Marketing</p>
        </div>

        <div class="email-content">
          <div class="email-card">
            <div class="question-text">
              Could you be overpaying for imaging?
            </div>

            <div class="savings-box">
              Switch to an outpatient center and save up to $735 on your next
              imaging visit
            </div>

            <button class="view-details">View Details</button>

            <div class="locations-section">
              <div class="map-area">
                <!-- Map will be initialized here -->
              </div>

              <div class="location-list">
                <div class="location-item">
                  <div class="location-name">Mass General Hospital</div>
                  <div>Current Location</div>
                </div>

                <div class="location-item">
                  <div class="location-name">CareWell Urgent Care</div>
                  <div>Recommended Alternative</div>
                  <div class="savings-text">Save $500</div>
                </div>

                <div class="location-item">
                  <div class="location-name">Beth Israel Deaconess</div>
                  <div>Best Value Option</div>
                  <div class="savings-text">Save $800</div>
                </div>
              </div>
            </div>

            <div class="switch-info">
              <div class="switch-title">
                How to switch to a lower cost imaging center:
              </div>
              <div class="help-options">
                <div class="help-option">📍 Find locations near you</div>
                <div class="help-option">👥 Get help from our support team</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  return container;
}
