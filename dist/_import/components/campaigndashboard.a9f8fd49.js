import { html } from "../../_node/htl@0.3.1/index.0caf36e7.js";

// Utility functions remain the same as before
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const formatValue = (key, value) => {
  if (!value) return 'N/A';
  if (key.includes('cost')) return `$${value}`;
  if (typeof value === 'number' && value >= 1000) return formatNumber(value);
  return `${value}${key.includes('Rate') ? '%' : ''}`;
};
export function CampaignDashboard(campaigns) {
    const container = html`<div>`;
    let expandedRows = new Set();
  
    function render() {
      container.innerHTML = '';
      container.appendChild(html`
         <style>
          .dashboard-container {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 20px 0;
            width: 100%;
          }
          
          .campaign-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 16px;
            background: white;
          }
  
          .campaign-header {
            display: grid;
            align-items: center;
          }
  
          .campaign-header.main-header {
            grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
          }
  
          .campaign-header.metrics-header {
            grid-template-columns: repeat(6, 1fr);
          }
  
          .campaign-header.prior-header {
            grid-template-columns: repeat(5, 1fr);
          }
  
          .campaign-header.table-header {
            background-color: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
          }
  
          .version-cell, .table-cell {
            padding: 10px 16px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .version-cell {
            font-weight: 600;
            color: #374151;
            display: flex;
            align-items: left;
          }

          .table-cell {
            color: #4b5563;
          }

          /* Dynamic text scaling */
          @media (min-width: 1200px) {
            .version-cell, .table-cell {
              font-size: 0.9rem;
            }
          }

          @media (min-width: 1400px) {
  .version-cell, .table-cell {
    font-size: 0.9rem;
  }
}

@media (max-width: 1399px) {
  .version-cell, .table-cell {
    font-size: 0.85rem;
  }
}

@media (max-width: 1200px) {
  .version-cell, .table-cell {
    font-size: 0.8rem;
  }
}



@media (max-width: px) {
  .table-wrapper {
    overflow-x: auto;
    white-space: wrap;   /* Force single line */
  }
  
  .version-cell, .table-cell {
    font-size: .63rem;
    white-space: nowrap;   /* Ensure cells don't wrap */
  }

  .campaign-header.main-header {
    min-width: 600px;     /* Ensure minimum width before scrolling */
  }
}
          
          .dashboard-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }

          .campaign-content {
            border-top: 1px solid #e5e7eb;
          }
  
          .section {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
          }
  
          .section:last-child {
            border-bottom: none;
          }
  
          .section h4 {
            font-weight: 600;
            margin-bottom: 12px;
            color: #374151;
            font-size: 0.9rem;
          }

          ul {
            list-style-type: disc;
            padding-left: 24px;
            margin: 8px 0;
          }

          li {
            margin: 4px 0;
            color: #4b5563;
            font-size: 0.875rem;
          }

          .chevron {
            display: inline-block;
            margin-right: 8px;
            color: #6b7280;
            font-size: 0.2em;
          }
        </style>
        
        <div class="dashboard-container">
          <h3 class="dashboard-title">Experiment Versions Overview</h3>
  
            <div class="table-wrapper">
  
          <div class="campaign-card">
            <div class="campaign-header main-header table-header">
              <div class="version-cell">Intervention</div>
              <div class="version-cell">Population Description</div>
              <div class="version-cell">Version</div>
              <div class="version-cell">Time in Market</div>
              <div class="version-cell">Population Size</div>
              <div class="version-cell">Cost per Change</div>
              <div class="version-cell">Total Impact</div>
              <div class="version-cell">Financial Impact</div>
              <div class="version-cell">P-value</div>
            </div>
  
            ${campaigns.map(campaign => {
              const isExpanded = expandedRows.has(campaign.id);
              return html`
                <div>
                  <div class="campaign-header main-header" style="cursor: pointer;"
                    onclick=${() => {
                      if (isExpanded) expandedRows.delete(campaign.id);
                      else expandedRows.add(campaign.id);
                      render();
                      container.value = Array.from(expandedRows);
                      container.dispatchEvent(new Event('input'));
                    }}
                  >
                    <div class="table-cell">${campaign.intervention}</div>
                    <div class="table-cell">${campaign.description}</div>
                    <div class="table-cell"></span>              ${campaign.version}                    </div>
                    <div class="table-cell">${campaign.timeInMarket}</div>
                    <div class="table-cell">${formatNumber(campaign.population?.size)}</div>
                    <div class="table-cell">${formatValue('cost', campaign.metrics?.costPerChange?.value || 0)}</div>
                    <div class="table-cell">${formatValue('totalImpact', campaign.metrics?.totalImpact?.value || 0)}</div>
                    <div class="table-cell">${formatValue('financialImpact', campaign.metrics?.financialImpact?.value || 0)}</div>
                    <div class="table-cell">${campaign.metrics?.financialImpact?.pValue || campaign.metrics?.totalImpact?.pValue || 'N/A'}</div>
                  </div>
  
                  ${isExpanded ? html`
                    <div class="campaign-content">
                      <div class="section">
                        <h4>Behavior Change Levers</h4>
                        <ul>
                          ${campaign.behaviorLevers?.map(lever => html`<li>${lever}</li>`)}
                        </ul>
                      </div>
  
                      <div class="section">
                        <h4>Fundamental Assumptions</h4>
                        <ul>
                          ${campaign.fundamentalAssumptions?.map(assumption => html`<li>${assumption}</li>`)}
                        </ul>
                      </div>
  
                      <div class="section">
                        <h4>Metrics</h4>
                        <div class="table-wrapper">
                          <div class="campaign-header metrics-header table-header">
                            <div class="version-cell">Metric</div>
                            <div class="version-cell">Value</div>
                            <div class="version-cell">Lift</div>
                            <div class="version-cell">P-value</div>
                            <div class="version-cell">95% CI</div>
                            <div class="version-cell">Std Dev</div>
                          </div>
                          ${Object.entries(campaign.metrics).map(([key, metric]) => html`
                            <div class="campaign-header metrics-header">
                              <div class="table-cell">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                              <div class="table-cell">${formatValue(key, metric.value)}</div>
                              <div class="table-cell">${metric.lift}%</div>
                              <div class="table-cell">${metric.pValue}</div>
                              <div class="table-cell">${metric.ci ? `[${formatValue(key, metric.ci[0])} - ${formatValue(key, metric.ci[1])}]` : 'N/A'}</div>
                              <div class="table-cell">${formatValue(key, metric.stdDev)}</div>
                            </div>
                          `)}
                        </div>
                      </div>
  
                      ${campaign.priorVersions?.length ? html`
                        <div class="section">
                          <h4>Prior Versions</h4>
                          <div class="table-wrapper">
                            <div class="campaign-header prior-header table-header">
                              <div class="version-cell">Version</div>
                              <div class="version-cell">Time in Market</div>
                              <div class="version-cell">Changes</div>
                              <div class="version-cell">Engagement Rate</div>
                              <div class="version-cell">Total Impact</div>
                            </div>
                            ${campaign.priorVersions.map(prev => html`
                              <div class="campaign-header prior-header">
                                <div class="table-cell">${prev.version}</div>
                                <div class="table-cell">${prev.timeInMarket}</div>
                                <div class="table-cell">${prev.changes}</div>
                                <div class="table-cell">${prev.metrics.engagementRate?.value}%</div>
                                <div class="table-cell">${formatNumber(prev.metrics.totalImpact?.value)}</div>
                              </div>
                            `)}
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              `;
            })}
          </div>
        </div>
        </div>
      `);
    }
  
    render();
    container.value = Array.from(expandedRows);
    return container;
  }