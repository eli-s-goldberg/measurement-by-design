export class CampaignAnalyzer {
  constructor(campaignData) {
    this.rawData = campaignData;
    this.campaigns = campaignData.campaigns;
  }

  /**
   * Formats campaign data for table display
   * @returns {Array} Formatted campaign data
   */
  formatCampaignData() {
    return this.campaigns.map((campaign) => ({
      intervention: campaign.intervention,
      populationDesc: campaign.populationDesc,
      version: campaign.version,
      timeInMarket: campaign.timeInMarket,
      populationSize: campaign.populationSize,
      costPerChange: campaign.costPerChange,
      totalImpact: campaign.totalImpact,
      financialImpact: campaign.financialImpact,
      pValue: campaign.pValue,
      metrics: campaign.metrics,
      funnelData: campaign.funnelData,
      levers: campaign.levers,
      impact: campaign.impact,
      assumptions: campaign.assumptions,
      _original: campaign,
    }));
  }

  /**
   * Transforms campaign metrics into a flat structure
   * @param {Array} selectedCampaigns - Selected campaign objects
   * @param {Array} metricNames - Array of metric names to include (optional)
   * @returns {Array} Transformed metrics
   */
  transformMetrics(selectedCampaigns, metricNames = []) {
    const allValues = [];

    selectedCampaigns.forEach((campaign, index) => {
      if (campaign.metrics && Array.isArray(campaign.metrics)) {
        const metricsToProcess = metricNames.length
          ? campaign.metrics.filter((metric) =>
              metricNames.includes(metric.name)
            )
          : campaign.metrics;

        metricsToProcess.forEach((metric) => {
          allValues.push({
            intervention: campaign.intervention || `Campaign ${index + 1}`,
            name: metric.name,
            value: this._cleanMetricValue(metric.value),
            lift: this._cleanMetricValue(metric.lift, "percentage"),
            pValue: metric.pValue,
            ci_lower: this._cleanMetricValue(metric.ci_lower),
            ci_upper: this._cleanMetricValue(metric.ci_upper),
            stdDev: this._cleanMetricValue(metric.stdDev),
          });
        });
      }
    });

    return allValues;
  }

  /**
   * Creates metric tables grouped by metric name
   * @param {Array} metrics - Transformed metrics
   * @returns {Array} Array of objects with metricName and metricData
   */
  createMetricTables(metrics) {
    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric);
      return acc;
    }, {});

    return Object.keys(groupedMetrics).map((metricName) => ({
      metricName,
      metricData: groupedMetrics[metricName],
    }));
  }

  /**
   * Transforms time series data for visualization
   * @param {Array} selectedCampaigns - Selected campaign objects
   * @returns {Array} Transformed time series data
   */
  transformTimeSeriesData(selectedCampaigns) {
    const allData = [];

    selectedCampaigns.forEach((campaign) => {
      campaign._original.timeSeriesData.forEach((entry) => {
        allData.push({
          month: entry.month,
          changeRate: entry.changeRate,
          engagement: entry.engagement,
          intervention: campaign.intervention,
        });
      });
    });

    return allData;
  }

  /**
   * Extracts and formats funnel data from campaigns using provided steps
   * @param {Array} selectedCampaigns - Selected campaign objects
   * @param {Array} steps - Array of funnel step names (optional)
   * @returns {Array} Formatted funnel data
   */
  getFunnelData(selectedCampaigns, steps) {
    return selectedCampaigns.map((campaign) => {
      const funnelData = { intervention: campaign.intervention };

      // If steps are provided, only include those steps
      if (Array.isArray(steps)) {
        steps.forEach((step) => {
          funnelData[step] = campaign.funnelData[step] || 0;
        });
      } else {
        // Otherwise, include all funnel data
        Object.assign(funnelData, campaign.funnelData);
      }

      return funnelData;
    });
  }

  /**
   * Processes funnel data for visualization
   * @param {Array} data - Funnel data
   * @param {Array} steps - Funnel steps to process
   * @returns {Array} Processed funnel data with absolute and percentage values
   */
  processFunnelData(data, steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error("Steps array is required for funnel data processing");
    }

    return data.map((d) => {
      const absoluteData = steps.map((step) => ({
        intervention: d.intervention,
        step,
        value: d[step] || 0,
      }));

      const percentageData = steps.map((step, i) => ({
        intervention: d.intervention,
        step,
        value:
          i === 0
            ? 100
            : d[step] && d[steps[i - 1]]
            ? (d[step] / d[steps[i - 1]]) * 100
            : 0,
      }));

      return {
        intervention: d.intervention,
        absoluteData,
        percentageData,
      };
    });
  }

  /**
   * Creates bar chart data from selected campaigns
   * @param {Array} selectedCampaigns - Selected campaign objects
   * @returns {Array} Formatted bar chart data
   */
  createBarChartData(selectedCampaigns) {
    return selectedCampaigns.map((campaign) => ({
      intervention: campaign.intervention,
      timeInMarket:
        parseFloat(campaign.timeInMarket.replace(/[^\d.-]/g, "")) || 0,
      populationSize: campaign.populationSize || 0,
      costPerChange: campaign.costPerChange || 0,
      totalImpact:
        parseFloat(campaign.totalImpact.replace(/[^\d.-]/g, "")) || 0,
      pValue: campaign.pValue || 0,
    }));
  }

  /**
   * Private helper method to clean metric values
   * @private
   * @param {string} rawValue - Raw metric value
   * @param {string} type - Value type (percentage or default)
   * @returns {number} Cleaned metric value
   */
  _cleanMetricValue(rawValue, type = "default") {
    if (!rawValue) return null;

    const cleanedValue = rawValue.replace(/[^\d.%K]/g, "");

    if (cleanedValue.includes("%") || type === "percentage") {
      return parseFloat(cleanedValue) / 100;
    }
    if (cleanedValue.includes("K")) {
      return parseFloat(cleanedValue.replace("K", "")) * 1000;
    }
    return parseFloat(cleanedValue);
  }
}
