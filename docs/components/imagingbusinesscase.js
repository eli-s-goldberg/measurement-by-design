// imagingbusinesscase.js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { DistP, distributions } from "./DistP.js";
// Constants and settings
const imagingSettings = {
  "X-Ray": {
    mean: 150,
    shape: 0.8,
    nonPreferredMultiplier: 1.45,
    lowerBound: 20,
    upperBound: 400,
  },
  CT: {
    mean: 300,
    shape: 1.0,
    nonPreferredMultiplier: 1.55,
    lowerBound: 40,
    upperBound: 100,
  },
  MRI: {
    mean: 500,
    shape: 1.2,
    nonPreferredMultiplier: 1.6,
    lowerBound: 250,
    upperBound: 1000,
  },
  Ultrasound: {
    mean: 100,
    shape: 0.2,
    nonPreferredMultiplier: 1.35,
    lowerBound: 50,
    upperBound: 500,
  },
  "Nuclear Medicine": {
    mean: 350,
    shape: 0.4,
    nonPreferredMultiplier: 1.5,
    lowerBound: 175,
    upperBound: 700,
  },
  Mammography: {
    mean: 200,
    shape: 1.0,
    nonPreferredMultiplier: 1.4,
    lowerBound: 100,
    upperBound: 400,
  },
  Fluoroscopy: {
    mean: 120,
    shape: 0.8,
    nonPreferredMultiplier: 1.45,
    lowerBound: 60,
    upperBound: 240,
  },
  "Interventional Radiology": {
    mean: 800,
    shape: 1.6,
    nonPreferredMultiplier: 1.7,
    lowerBound: 400,
    upperBound: 1600,
  },
};

const baseImagingVolumes = {
  "X-Ray": { annualVolume: 250000, preferredShare: 0.65 },
  CT: { annualVolume: 180000, preferredShare: 0.7 },
  MRI: { annualVolume: 150000, preferredShare: 0.75 },
  Ultrasound: { annualVolume: 200000, preferredShare: 0.6 },
  "Nuclear Medicine": { annualVolume: 50000, preferredShare: 0.7 },
  Mammography: { annualVolume: 160000, preferredShare: 0.8 },
  Fluoroscopy: { annualVolume: 70000, preferredShare: 0.65 },
  "Interventional Radiology": { annualVolume: 40000, preferredShare: 0.75 },
};

// Business case calculation functions
function calculateTotals(imagingVolumes, percentageDecrease) {
  return Object.entries(imagingVolumes).map(([type, volumeData]) => {
    const { annualVolume, preferredShare } = volumeData;
    const { mean, nonPreferredMultiplier } = imagingSettings[type];

    const preferredCostPerUnit = Number(mean);
    const nonPreferredCostPerUnit =
      preferredCostPerUnit * nonPreferredMultiplier;
    const totalNonPreferredVolume = Math.round(
      annualVolume * (1 - preferredShare)
    );
    const savingsPerUnit = nonPreferredCostPerUnit - preferredCostPerUnit;
    const totalSavings =
      totalNonPreferredVolume * savingsPerUnit * (percentageDecrease / 100);

    return {
      imagingType: type,
      totalSavings,
      totalCost: Math.round(
        annualVolume * preferredShare * preferredCostPerUnit +
          totalNonPreferredVolume * nonPreferredCostPerUnit
      ),
    };
  });
}

function appendCostData(imagingVolumes, percentageDecrease) {
  const updatedVolumes = { ...imagingVolumes };
  const costData = calculateTotals(imagingVolumes, percentageDecrease);

  costData.forEach(({ imagingType, totalCost, totalSavings }) => {
    updatedVolumes[imagingType] = {
      ...updatedVolumes[imagingType],
      totalCost,
      totalSavings: Math.round(totalSavings), // Ensure totalSavings is a number
    };
  });

  return updatedVolumes;
}

function prepareUpdatedVolumeData(imagingVolumes, percentageConverted) {
  const volumeData = [];
  Object.entries(imagingVolumes).forEach(([type, data]) => {
    const { annualVolume, preferredShare, totalSavings } = data;
    const preferredVolume = annualVolume * preferredShare;
    const nonPreferredVolume = annualVolume * (1 - preferredShare);
    const convertedVolume = nonPreferredVolume * (percentageConverted / 100);
    const remainingNonPreferredVolume = nonPreferredVolume - convertedVolume;

    volumeData.push({
      imaging_type: type,
      preferredVolume,
      convertedVolume,
      remainingNonPreferredVolume,
      totalVolume:
        preferredVolume + convertedVolume + remainingNonPreferredVolume,
      totalSavings,
    });
  });
  return volumeData;
}

// Visualization functions
function createStackedVolumeChart(volumeData) {
  const stackedData = volumeData.flatMap((d) => [
    {
      imaging_type: d.imaging_type,
      imaging_preference: "Preferred",
      count: d.preferredVolume,
    },
    {
      imaging_type: d.imaging_type,
      imaging_preference: "Converted",
      count: d.convertedVolume,
    },
    {
      imaging_type: d.imaging_type,
      imaging_preference: "Remaining Non-Preferred",
      count: d.remainingNonPreferredVolume,
    },
  ]);

  return Plot.plot({
    marginLeft: 150,
    marginRight: 150,
    height: 200,
    subtitle: "Imaging Costs and Savings by Imaging Type",
    marks: [
      Plot.barX(stackedData, {
        x: "count",
        y: "imaging_type",
        fill: "imaging_preference",
        sort: { y: "x", reverse: true },
        title: (d) => `${d.imaging_preference}: ${d.count.toLocaleString()}`,
      }),
      Plot.text(volumeData, {
        x: "totalVolume",
        y: "imaging_type",
        text: (d) => `Savings: $${(d.totalSavings / 100000).toLocaleString()}M`,
        textAnchor: "start",
        dx: 5,
        fill: "black",
      }),
    ],
    color: {
      domain: ["Preferred", "Converted", "Remaining Non-Preferred"],
      range: ["steelblue", "orange", "red"],
      legend: true,
    },
    x: {
      label: "Total Volume",
      grid: true,
      tickFormat: "~s",
    },
    y: {
      label: "Imaging Type",
      grid: false,
    },
  });
}

// Main function to generate business case analysis
export function generateImagingBusinessCase(percentageDecrease) {
  const updatedVolumes = appendCostData(baseImagingVolumes, percentageDecrease);
  const volumeData = prepareUpdatedVolumeData(
    updatedVolumes,
    percentageDecrease
  );
  const chart = createStackedVolumeChart(volumeData);

  return {
    volumes: updatedVolumes,
    volumeData,
    chart,
    totalSavings: volumeData.reduce((sum, d) => sum + d.totalSavings, 0),
  };
}
