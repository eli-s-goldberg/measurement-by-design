import * as Plot from "../../_npm/@observablehq/plot@0.6.16/e828d8c8.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.45152b81.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

export const CONSTANTS = {
  AGE_GROUPS: {
    UNDER_65: [18, 30, 45, 55, 64],
    OVER_65: [65, 70, 75, 80, 85, 90, 95]
  },
  REGIONS: ["Urban", "Suburban", "Rural"],
  INCOME_BRACKETS: ["Low", "Medium", "High"],
  DIAGNOSES: {
    CHRONIC: ["COPD", "Diabetes", "Hypertension"],
    OTHER: "None"
  },
  GENDERS: {
    MALE: { value: "Male", probability: 0.49 },
    FEMALE: { value: "Female", probability: 0.49 },
    OTHER: { value: "Other", probability: 0.02 }
  },
  PLAN_TYPES: {
    MA: {
      name: "MA",
      distribution: 0.50
    },
    MEDIGAP: {
      name: "Medigap",
      distribution: 0.05
    },
    DSNP: {
      name: "D-SNP",
      distribution: 0.09
    },
    CSNP: {
      name: "C-SNP",
      distribution: 0.09
    },
    ISNP: {
      name: "I-SNP",
      distribution: 0.09
    },
    EGWP: {
      name: "EGWP",
      distribution: 0.09
    },
    PACE: {
      name: "PACE",
      distribution: 0.09
    }
  },
  PLAN_DISEASE_DISTRIBUTION: {
    "MA": {
      chronicOnly: false,
      otherRate: 0.11
    },
    "Medigap": {
      chronicOnly: false,
      otherRate: 0.11
    },
    "D-SNP": {
      chronicOnly: false,
      otherRate: 0.04
    },
    "C-SNP": {
      chronicOnly: true,
      otherRate: 0
    },
    "I-SNP": {
      chronicOnly: false,
      otherRate: 0.08
    },
    "EGWP": {
      chronicOnly: false,
      otherRate: 0.11
    },
    "PACE": {
      chronicOnly: false,
      otherRate: 0.09
    }
  }
};

// Utility functions remain the same
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const generateId = () => Math.random().toString(36).substring(7);

function assignGender() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const gender of Object.values(CONSTANTS.GENDERS)) {
    cumulative += gender.probability;
    if (rand <= cumulative) {
      return gender.value;
    }
  }
  return CONSTANTS.GENDERS.MALE.value;
}

function getAge(planType) {
  if (planType === "D-SNP") {
    return Math.random() < 0.08 
      ? pick(CONSTANTS.AGE_GROUPS.UNDER_65)
      : pick(CONSTANTS.AGE_GROUPS.OVER_65);
  }
  return pick(CONSTANTS.AGE_GROUPS.OVER_65);
}

function assignPlanType() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [key, value] of Object.entries(CONSTANTS.PLAN_TYPES)) {
    cumulative += value.distribution;
    if (rand <= cumulative) {
      return value.name;
    }
  }
  return CONSTANTS.PLAN_TYPES.MA.name;
}

function assignDiagnosis(planType, age, smokingStatus) {
  const planDistribution = CONSTANTS.PLAN_DISEASE_DISTRIBUTION[planType];
  
  if (!planDistribution) {
    console.warn(`Unknown plan type: ${planType}`);
    return CONSTANTS.DIAGNOSES.OTHER;
  }

  if (planDistribution.chronicOnly) {
    return pick(CONSTANTS.DIAGNOSES.CHRONIC);
  }

  if (Math.random() < planDistribution.otherRate) {
    return CONSTANTS.DIAGNOSES.OTHER;
  }

  let weights = [1, 1, 1];
  
  if (age > 65) {
    weights[2] *= 1.5;
  }
  if (smokingStatus === "Smoker") {
    weights[0] *= 2;
  }
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => w / totalWeight);
  
  const rand = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      return CONSTANTS.DIAGNOSES.CHRONIC[i];
    }
  }
  
  return CONSTANTS.DIAGNOSES.CHRONIC[0];
}

// Rest of the code (generateHealthcareData, formatDimensionValue, calculateImageUse) remains exactly the same

export function generateHealthcareData(size = 1000) {
  const data = [];
  
  for (let i = 0; i < size; i++) {
    const planType = assignPlanType();
    const age = getAge(planType);
    const region = pick(CONSTANTS.REGIONS);
    const income = pick(CONSTANTS.INCOME_BRACKETS);
    const smokingStatus = Math.random() < 0.3 ? "Smoker" : "Non-Smoker";
    
    const diagnosis = assignDiagnosis(planType, age, smokingStatus);
    
    let primaryCareProb = 0.7;
    if (income === "Low") primaryCareProb *= 0.8;
    if (income === "High") primaryCareProb *= 1.2;
    if (region === "Rural") primaryCareProb *= 0.9;
    if (diagnosis !== "None") primaryCareProb *= 1.2;
    
    const primaryCareEngaged = Math.random() < primaryCareProb ? "Yes" : "No";
    
    let imagingVisits = random(1, 3);
    if (diagnosis !== "None") imagingVisits += random(1, 2);
    if (age > 65) imagingVisits += 1;
    if (region === "Rural") imagingVisits += 1;
    
    if (planType.includes("SNP") || planType === "PACE") {
      imagingVisits += random(1, 2);
    }
    
    let nonPreferredRate = diagnosis === "COPD" && age >= 55 && region === "Rural"
      ? 0.65
      : 0.2;
    
    if (primaryCareEngaged === "No") {
      nonPreferredRate *= 2;
    }
    
    nonPreferredRate = Math.min(nonPreferredRate, 1.0);
    
    const nonPreferredVisits = Math.floor(imagingVisits * nonPreferredRate);
    
    data.push({
      ID: generateId(),
      Age: age,
      Gender: assignGender(),
      Region: region,
      PlanType: planType,
      Diagnosis: diagnosis,
      PrimaryCareEngagement: primaryCareEngaged,
      SmokingStatus: smokingStatus,
      IncomeBracket: income,
      ImagingVisits: imagingVisits,
      NonPreferredVisits: nonPreferredVisits
    });
  }
  
  return data;
}

const formatDimensionValue = (value, dimensionType) => {
  if (dimensionType === "PlanType") {
    switch(value) {
      case "Medicare Advantage":
        return "Medicare\nAdvantage";
      case "Medicare Supplement":
        return "Medicare\nSupplement";
      case "Dual Eligible Special Needs Plan":
        return "Dual Eligible\nSpecial Needs Plan";
      case "Chronic Condition Special Needs Plan":
        return "Chronic Condition\nSpecial Needs Plan";
      case "Institutional Special Needs Plan":
        return "Institutional\nSpecial Needs Plan";
      case "Employer Group Waiver Plan":
        return "Employer Group\nWaiver Plan";
      case "Programs of All-Inclusive Care for the Elderly":
        return "Programs of\nAll-Inclusive Care\nfor the Elderly";
      default:
        return value;
    }
  }
  return value;
};

// export const calculateImageUse = (data, groupingDimension) => {
//   const grouped = d3.rollup(data,
//     v => ({
//       preferred: d3.sum(v, d => d.ImagingVisits - d.NonPreferredVisits),
//       nonPreferred: d3.sum(v, d => d.NonPreferredVisits),
//       total: d3.sum(v, d => d.ImagingVisits)
//     }),
//     d => d.Diagnosis,
//     d => formatDimensionValue(d[groupingDimension], groupingDimension)
//   );

//   const plotData = [];
//   for (const [diagnosis, dimensions] of grouped) {
//     for (const [dimensionValue, visits] of dimensions) {
//       plotData.push({
//         diagnosis: diagnosis,
//         [groupingDimension]: dimensionValue,
//         category: "Preferred",
//         value: (visits.preferred / visits.total) * 100
//       });
//       plotData.push({
//         diagnosis: diagnosis,
//         [groupingDimension]: dimensionValue,
//         category: "Non-Preferred",
//         value: (visits.nonPreferred / visits.total) * 100
//       });
//     }
//   }
  
//   return plotData;
// };
export const calculateImageUse = (data, groupingDimension) => {
  // First, get all unique dimension values and diagnoses to ensure consistent structure
  const allDimensionValues = [...new Set(data.map(d => d[groupingDimension]))];
  const allDiagnoses = ["None", "COPD", "Diabetes", "Hypertension"]; // Explicitly order diagnoses
  
  const grouped = d3.rollup(data,
    v => ({
      preferred: d3.sum(v, d => d.ImagingVisits - d.NonPreferredVisits),
      nonPreferred: d3.sum(v, d => d.NonPreferredVisits),
      total: d3.sum(v, d => d.ImagingVisits)
    }),
    d => d.Diagnosis,
    d => formatDimensionValue(d[groupingDimension], groupingDimension)
  );

  const plotData = [];
  
  // Iterate through all possible combinations to ensure complete data structure
  for (const dimensionValue of allDimensionValues) {
    for (const diagnosis of allDiagnoses) {
      const visits = grouped.get(diagnosis)?.get(dimensionValue) || 
                    { preferred: 0, nonPreferred: 0, total: 1 }; // Use 1 as total to avoid division by zero
      
      // Add both preferred and non-preferred entries
      plotData.push({
        diagnosis: diagnosis,
        [groupingDimension]: dimensionValue,
        category: "Preferred",
        value: visits.total === 0 ? 0 : (visits.preferred / visits.total) * 100
      });
      plotData.push({
        diagnosis: diagnosis,
        [groupingDimension]: dimensionValue,
        category: "Non-Preferred",
        value: visits.total === 0 ? 0 : (visits.nonPreferred / visits.total) * 100
      });
    }
  }
  
  return plotData;
};
