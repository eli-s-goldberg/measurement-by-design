import * as Plot from "../../_npm/@observablehq/plot@0.6.16/e828d8c8.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.45152b81.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

export class Microsite {
  constructor(config) {
    this.config = config;
    this.L = L; // Use the Leaflet instance from the `L` cell
    this.isMapInitialized = false;
  }

  async initialize(container) {
    this.container = container;
    this.addStyles();
    await this.renderSite();
  }

  addStyles() {
    const styleContent = `
      :root {
        --primary-color: #1e40af;
        --secondary-color: #22c55e;
        --danger-color: #dc2626;
        --background-light: #f8fafc;
        --text-primary: #2c3e50;
        --text-secondary: #64748b;
        --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
        --border-radius: 12px;
        --font-main: system-ui, -apple-system, sans-serif;
    }

    body {
        margin: 0;
        padding: 0;
        font-family: var(--font-main);
        color: var(--text-primary);
        background: white;
    }

    .microsite-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .hero-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        padding: 60px 20px;
        background: linear-gradient(to right, var(--background-light), #e2e8f0);
        border-radius: var(--border-radius);
        margin-bottom: 40px;
    }

    .hero-content h1 {
        font-size: 2.5em;
        color: var(--primary-color);
        margin-bottom: 20px;
    }

    .highlight {
        color: var(--danger-color);
        font-weight: 600;
    }

    .location-finder {
        background: white;
        padding: 30px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
    }

    input {
        width: 100%;
        padding: 12px;
        margin: 8px 0;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 1.1em;
    }

    .search-button {
        width: 100%;
        padding: 12px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1.1em;
        cursor: pointer;
        transition: background 0.3s;
    }

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;  /* reduced from 30px */
    margin-bottom: 20px;  /* reduced from 40px */
}


.feature-card {
    text-align: center;
    padding: 15px;  /* reduced from 30px */
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    transition: transform 0.3s;
}

.feature-icon {
    font-size: 1.5em;  /* reduced from 2em */
    margin-bottom: 10px;  /* reduced from 15px */
}

.feature-card h3 {
    margin: 5px 0;  /* added to reduce spacing */
    font-size: 1.1em;  /* reduced font size */
}

.feature-card p {
    margin: 5px 0;  /* reduced margin */
    font-size: 0.9em;  /* slightly smaller text */
}

    .map-section {
        margin-bottom: 40px;
    }

    .map-container {
        position: relative;
        width: 100%;
        height: 500px;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        overflow: hidden;
    }

    .location-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .location-card {
        padding: 20px;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
    }

    .savings-positive {
        color: var(--secondary-color);
        font-weight: 600;
    }

    .savings-negative {
        color: var(--danger-color);
        font-weight: 600;
    }

    .cost-comparison {
        padding: 40px;
        background: var(--background-light);
        border-radius: var(--border-radius);
        margin-bottom: 40px;
    }

    .cost-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }

    .cost-card {
        background: white;
        padding: 20px;
        border-radius: var(--border-radius);
        text-align: center;
    }

    .price {
        font-size: 2em;
        color: var(--primary-color);
        margin: 10px 0;
    }

    .disclaimer {
        font-size: 0.8em;
        color: var(--text-secondary);
        text-align: center;
        padding: 20px;
    }

    @media (max-width: 768px) {
        .hero-section,
        .features-grid,
        .cost-grid {
            grid-template-columns: 1fr;
        }
    }
    `;
    if (!document.getElementById('microsite-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'microsite-styles';
      styleElement.textContent = styleContent;
      document.head.appendChild(styleElement);
    }
  }

  async createMap() {
    const container = this.container.querySelector('#map-container');
    if (!container || this.isMapInitialized) return;

    this.isMapInitialized = true;

    const { current, alternatives } = this.config.locations;

    const map = this.L.map(container).setView(
      current.position,
      this.config.mapCenter.zoom || 14
    );

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.5,
    }).addTo(map);

    // Define icons
    const currentIcon = this.L.divIcon({
      html: `<div class="current-location-marker"></div>`,
      className: 'custom-icon',
      iconSize: [24, 24],
    });

    const alternativeIcon = this.L.divIcon({
      html: `<div class="alternative-location-marker"></div>`,
      className: 'custom-icon',
      iconSize: [24, 24],
    });

    // Add current location marker
    this.L.marker(current.position, { icon: currentIcon })
      .bindPopup(this.createPopupContent(current, 'current'))
      .addTo(map);

    // Add alternative location markers
    alternatives.forEach((location) => {
      this.L.marker(location.position, { icon: alternativeIcon })
        .bindPopup(this.createPopupContent(location, 'alternative'))
        .addTo(map);
    });

    return map;
  }

  createPopupContent(location, type) {
    const color = type === 'current' ? '#dc2626' : '#22c55e';
    const savingsText =
      type === 'current'
        ? `${location.costDetails.differential} more expensive`
        : `Save $${location.savings}`;

    return `
      <div class="map-popup">
        <h3 style="color: ${color}; margin: 0 0 8px 0">${location.name}</h3>
        <p style="margin: 0 0 4px 0">${location.address}</p>
        <p style="margin: 0 0 4px 0">${location.phone}</p>
        <p style="margin: 0; color: ${color}; font-weight: bold">
          ${savingsText}
        </p>
        ${
          location.availability
            ? `<p style="margin: 0">Available: ${location.availability}</p>`
            : ''
        }
      </div>
    `;
  }

  async renderSite() {
    const container = this.container;
    if (!container) return;

    container.innerHTML = `
      ${this.renderHeroSection()}
      ${this.renderMapSection()}
      ${this.renderLocationCards()}
      ${this.renderFooter()}
    `;

    // After rendering, initialize the map
    await this.createMap();
  }


  renderHeroSection() {
    const { title, subtitle, highlights } = this.config.heroSection;

    return `
      <section class="hero-section">
        <div class="hero-content">
          <h1>${title}</h1>
          <p>${subtitle}</p>
          <p>${highlights}</p>
        </div>
        ${this.renderLocationFinder()}
      </section>
    `;
  }

  renderLocationFinder() {
    return `
      <div class="location-finder">
        <h2>Find Affordable Imaging Centers</h2>
        <form id="location-form">
          <input type="text" id="zip" placeholder="Enter ZIP Code" value="${
            this.config.defaultZip || ''
          }"/>
          <input type="text" id="insurance" placeholder="Insurance Provider"/>
          <button type="submit" class="search-button">Find Nearby Centers</button>
        </form>
      </div>
    `;
  }

  renderMapSection() {
    return `
      <section class="map-section">
        <div class="hero-content">
          <h2>${this.config.mapSectionTitle}</h2>
          ${this.renderMapContainer()}
          ${this.renderCostGrid()}
        </div>
      </section>
    `;
  }

  renderMapContainer() {
    return `
      <div id="map-container" class="map-container"></div>
    `;
  }

  renderCostGrid() {
    const { costGrid } = this.config;

    return `
      <div class="cost-grid">
        ${costGrid
          .map(
            (item) => `
          <div class="cost-card">
            <h3>${item.title}</h3>
            <div class="price">${item.price}</div>
            <div class="location">${item.location}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  renderLocationCards() {
    const { current, alternatives } = this.config.locations;

    return `
      <section class="location-cards">
        ${this.renderLocationCard(current, 'current')}
        ${alternatives
          .map((loc) => this.renderLocationCard(loc, 'alternative'))
          .join('')}
      </section>
    `;
  }

  renderLocationCard(location, type) {
    const savingsClass = type === 'current' ? 'savings-negative' : 'savings-positive';
    const savingsText =
      type === 'current'
        ? `${location.costDetails.differential} more than average cost`
        : `Save $${location.savings} on your next scan`;

    return `
      <div class="location-card ${type}">
        <h3>${type === 'current' ? 'Current Location' : 'Alternative Option'}</h3>
        <h4>${location.name}</h4>
        <p>${location.address}</p>
        <p class="phone">${location.phone}</p>
        <p class="${savingsClass}">${savingsText}</p>
        <p class="cost-detail">Total Cost: $${location.costDetails.baseCost}</p>
        ${location.distance ? `<p class="distance">${location.distance} miles away</p>` : ''}
        ${
          location.availability
            ? `<p class="availability">${location.availability}</p>`
            : ''
        }
      </div>
    `;
  }

  renderFooter() {
    return `
      <footer class="disclaimer">
        ${this.config.disclaimer}
      </footer>
    `;
  }
}
