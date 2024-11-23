// Import
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

// Functions
export function calculateSampleSizeWithDesignMatrix(
  expected_effect_size,
  desired_power,
  significance_level,
  treatmentClusters,
  controlClusters,
  designMatrix
) {
  const adjustedFollowUpPeriods = calculateFollowUpPeriods(designMatrix);

  const treatmentICC = calculateICCWithFollowUp(
    treatmentClusters,
    adjustedFollowUpPeriods
  );
  const controlICC = calculateICCWithFollowUp(
    controlClusters,
    adjustedFollowUpPeriods
  );

  const z_alpha = jStat.normal.inv(1 - significance_level / 2, 0, 1);
  const z_beta = jStat.normal.inv(desired_power, 0, 1);

  const treatmentSampleSize =
    (math.pow(z_alpha + z_beta, 2) *
      ((2 * (1 + expected_effect_size * expected_effect_size)) /
        (1 - treatmentICC))) /
    math.pow(expected_effect_size, 2);

  const controlSampleSize =
    (math.pow(z_alpha + z_beta, 2) *
      ((2 * (1 + expected_effect_size * expected_effect_size)) /
        (1 - controlICC))) /
    math.pow(expected_effect_size, 2);

  return {
    treatmentSampleSize,
    controlSampleSize,
    treatmentICC,
    controlICC,
  };
}

function calculateFollowUpPeriods(designMatrix) {
  const studyEndDate = new Date("2025-12-31"); // Assuming study ends on 2025-12-31
  return designMatrix.map(({ cluster, startDate, followUpMonths }) => {
    const actualFollowUpMonths = Math.min(
      followUpMonths,
      (studyEndDate - startDate) / (1000 * 60 * 60 * 24 * 30)
    );
    return { cluster, startDate, followUpMonths: actualFollowUpMonths };
  });
}

function calculateICCWithFollowUp(clusters, followUpPeriods) {
  const totalMean = calculateMean(clusters.flat());

  const clusterMeans = clusters.map((cluster) => calculateMean(cluster));
  const betweenClusterVariance =
    clusterMeans.reduce((acc, mean) => acc + Math.pow(mean - totalMean, 2), 0) /
    (clusterMeans.length - 1);

  let withinClusterVarianceSum = 0;
  let withinClusterCount = 0;
  clusters.forEach((cluster, index) => {
    const clusterMean = calculateMean(cluster);
    const followUpAdjustment = followUpPeriods[index].followUpMonths / 24; // Adjust for follow-up period
    withinClusterVarianceSum +=
      cluster.reduce((acc, val) => acc + Math.pow(val - clusterMean, 2), 0) *
      followUpAdjustment;
    withinClusterCount += cluster.length - 1;
  });
  const withinClusterVariance = withinClusterVarianceSum / withinClusterCount;

  const ICC =
    betweenClusterVariance / (betweenClusterVariance + withinClusterVariance);

  return ICC;
}

function calculateMean(array) {
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}

export function calculateStandardizedMeanDifference(mean1, mean2, sd) {
  return (mean2 - mean1) / sd;
}

export function DesignMatrix(DesType, periods = 1) {
  if (DesType === "Parallel" && periods === 1) {
    return [[0], [1]];
  } else if (DesType === "Before and After") {
    return [
      [0, 0],
      [0, 1],
    ];
  } else if (DesType === "Cross-over") {
    return [
      [0, 1],
      [1, 0],
    ];
  } else if (DesType === "Stepped-wedge") {
    const desmat = Array.from({ length: periods - 1 }, () =>
      Array(periods).fill(0)
    );
    for (let i = 0; i < desmat.length; i++) {
      for (let j = i + 1; j < periods; j++) {
        desmat[i][j] = 1;
      }
    }
    return desmat;
  } else if (DesType === "Parallel" && periods !== 1) {
    return [Array(periods).fill(0), Array(periods).fill(1)];
  } else if (DesType === "Multi cross-over") {
    if (periods % 2 === 1) {
      return [
        Array.from({ length: periods }, (_, i) => i % 2),
        Array.from({ length: periods }, (_, i) => (i + 1) % 2),
      ];
    } else {
      return [
        Array.from({ length: periods }, (_, i) => i % 2),
        Array.from({ length: periods }, (_, i) => (i + 1) % 2),
      ];
    }
  }
  return [];
}

export function DesignMatrixWithDetails(
  DesType,
  periods = 1,
  startDate,
  followUpMonths
) {
  let designMatrix = [];

  if (DesType === "Parallel" && periods === 1) {
    designMatrix = [[0], [1]];
  } else if (DesType === "Before and After") {
    designMatrix = [
      [0, 0],
      [0, 1],
    ];
  } else if (DesType === "Cross-over") {
    designMatrix = [
      [0, 1],
      [1, 0],
    ];
  } else if (DesType === "Stepped-wedge") {
    designMatrix = Array.from({ length: periods - 1 }, () =>
      Array(periods).fill(0)
    );
    for (let i = 0; i < designMatrix.length; i++) {
      for (let j = i + 1; j < periods; j++) {
        designMatrix[i][j] = 1;
      }
    }
  } else if (DesType === "Parallel" && periods !== 1) {
    designMatrix = [Array(periods).fill(0), Array(periods).fill(1)];
  } else if (DesType === "Multi cross-over") {
    if (periods % 2 === 1) {
      designMatrix = [
        Array.from({ length: periods }, (_, i) => i % 2),
        Array.from({ length: periods }, (_, i) => (i + 1) % 2),
      ];
    } else {
      designMatrix = [
        Array.from({ length: periods }, (_, i) => i % 2),
        Array.from({ length: periods }, (_, i) => (i + 1) % 2),
      ];
    }
  }

  const designDetails = designMatrix.map((row, index) => {
    return {
      cluster: index + 1,
      design: row,
      startDate: new Date(
        startDate.getTime() + index * 30 * 24 * 60 * 60 * 1000
      ), // Each cluster starts 1 month after the previous one
      followUpMonths: followUpMonths - index, // Decreasing follow-up period for later clusters
    };
  });

  return designDetails;
}

export function vartheta_m(m, DesType, periods, Krep, icc, cac, iac, sd) {
  // Assume Krep clusters per sequence
  // icc is the within-period ICC
  // cac is the cluster autocorrelation,
  // what I have previously called r: decay between two periods
  // m is the number of clusters per period
  // iac is the individual-level autocorrelation

  const totalvar = Math.pow(sd, 2);
  const sig2CP = icc * totalvar;
  const r = cac;
  let sig2E = (1 - iac) * (totalvar - sig2CP);
  let sig2 = sig2E / m;
  let sigindiv = (sig2E * iac) / ((1 - iac) * m);

  if (iac === 0) {
    sig2E = totalvar - sig2CP;
    sig2 = sig2E / m;
    sigindiv = 0;
  }
  if (iac === 1) {
    sig2E = 0 * (totalvar - sig2CP);
    sig2 = sig2E / m;
    sigindiv = (totalvar - sig2CP) / m;
  }

  const Xmat = DesignMatrix(DesType, periods); // Assumes DesignMatrix function is defined
  const T = Xmat[0].length;
  const K = Xmat.length;
  const Xvec = math.flatten(math.transpose(Xmat));

  // Variance matrix for one cluster, with decay in correlation over time
  let Vi = math.zeros(T, T);
  for (let i = 0; i < T; i++) {
    for (let j = 0; j < T; j++) {
      Vi.set(
        [i, j],
        sigindiv + (i === j ? sig2 : 0) + sig2CP * math.pow(r, math.abs(i - j))
      );
    }
  }

  const Dinv = math.diag(math.ones(K));
  const Vinv = math.inv(Vi);

  let part1 = math.multiply(math.transpose(Xvec), math.kron(Dinv, Vinv));
  let part2 = math.multiply(part1, Xvec);
  let colSumsXmat = math.transpose(math.sum(Xmat, 0));
  let part3 = math.multiply(colSumsXmat, Vinv);
  let part4 = math.multiply(part3, colSumsXmat);
  let vartheta = 1 / (part2 - part4 / K);

  return vartheta / Krep;
}

export function vartheta_Krep(Krep, DesType, periods, m, icc, cac, iac, sd) {
  const totalvar = Math.pow(sd, 2);
  const sig2CP = icc * totalvar;
  const r = cac;
  let sig2E = (1 - iac) * (totalvar - sig2CP);
  let sig2 = sig2E / m;
  let sigindiv = (sig2E * iac) / ((1 - iac) * m);

  if (iac === 0) {
    sig2E = totalvar - sig2CP;
    sig2 = sig2E / m;
    sigindiv = 0;
  }
  if (iac === 1) {
    sig2E = 0 * (totalvar - sig2CP);
    sig2 = sig2E / m;
    sigindiv = (totalvar - sig2CP) / m;
  }

  const Xmat = DesignMatrix(DesType, periods); // Assumes DesignMatrix function is defined
  const T = Xmat[0].length;
  const K = Xmat.length;
  const Xvec = math.flatten(math.transpose(Xmat));

  // Variance matrix for one cluster, with decay in correlation over time
  let Vi = math.zeros(T, T);
  for (let i = 0; i < T; i++) {
    for (let j = 0; j < T; j++) {
      Vi.set(
        [i, j],
        sigindiv + (i === j ? sig2 : 0) + sig2CP * math.pow(r, math.abs(i - j))
      );
    }
  }

  const Dinv = math.diag(math.ones(K));
  const Vinv = math.inv(Vi);

  let part1 = math.multiply(math.transpose(Xvec), math.kron(Dinv, Vinv));
  let part2 = math.multiply(part1, Xvec);
  let colSumsXmat = math.transpose(math.sum(Xmat, 0));
  let part3 = math.multiply(colSumsXmat, Vinv);
  let part4 = math.multiply(part3, colSumsXmat);
  let vartheta = 1 / (part2 - part4 / K);

  return vartheta / Krep;
}

export function assignClustersToDesignMatrix(
  periods,
  clusters,
  designMatrix,
  averageClusterSize = 5
) {
  const treatmentClusters = [];
  const controlClusters = [];

  for (let i = 0; i < clusters; i++) {
    for (let j = 0; j < periods; j++) {
      const size = averageClusterSize; // Cluster size can be adjusted
      const clusterData = Array.from({ length: size }, () =>
        math.randomInt(5, 15)
      ); // Random data
      if (designMatrix[i][j] === 1) {
        treatmentClusters.push(clusterData);
      } else {
        controlClusters.push(clusterData);
      }
    }
  }

  return { designMatrix, treatmentClusters, controlClusters };
}
