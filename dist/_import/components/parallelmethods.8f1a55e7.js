// Import
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "../../_node/d3-require@1.3.0/index.js";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");

export function calculateSampleSizeForMeans(
  z_alpha_2,
  z_beta,
  sigma,
  mu1,
  mu2
) {
  const numerator = math.pow(z_alpha_2 + z_beta, 2) * 2 * math.pow(sigma, 2);
  const denominator = math.pow(mu1 - mu2, 2);
  return (numerator / denominator).toFixed(2);
}

export function calculateSampleSizeForProportions(z_alpha_2, z_beta, p1, p2) {
  const numerator =
    math.pow(z_alpha_2 + z_beta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
  const denominator = math.pow(p1 - p2, 2);
  return (numerator / denominator).toFixed(2);
}

export function calculateVarianceFormulaIndividualRandomized(sigma, n) {
  return math.pow(sigma, 2) / n;
}

export function calculateVarianceFormulaClusterRandomized(sigma, k, m, rho) {
  return ((sigma * sigma) / (k * m)) * (1 + (m - 1) * rho).toFixed(2);
}

function calculateVarianceFormulaIndividualRandomized_internal(sigma, n) {
  return math.pow(sigma, 2) / n;
}

function calculateVarianceFormulaClusterRandomized_internal(sigma, k, m, rho) {
  return ((sigma * sigma) / (k * m)) * (1 + (m - 1) * rho).toFixed(2);
}

export function generateVarianceData(
  variable,
  variableRange,
  sigma,
  k,
  m,
  rho,
  constantN
) {
  const dataFormula1 = [];
  const dataFormula2 = [];

  variableRange.forEach((value) => {
    if (variable === "n") {
      dataFormula1.push({
        x: value,
        y: calculateVarianceFormulaIndividualRandomized_internal(sigma, value),
        variable: variable,
      });
      dataFormula2.push({
        x: value,
        y: calculateVarianceFormulaClusterRandomized_internal(sigma, k, m, rho),
        variable: variable,
      });
    } else if (variable === "k") {
      dataFormula1.push({
        x: value,
        y: calculateVarianceFormulaIndividualRandomized_internal(
          sigma,
          constantN
        ),
        variable: variable,
      });
      dataFormula2.push({
        x: value,
        y: calculateVarianceFormulaClusterRandomized_internal(
          sigma,
          value,
          m,
          rho
        ),
        variable: variable,
      });
    } else if (variable === "m") {
      dataFormula1.push({
        x: value,
        y: calculateVarianceFormulaIndividualRandomized_internal(
          sigma,
          constantN
        ),
        variable: variable,
      });
      dataFormula2.push({
        x: value,
        y: calculateVarianceFormulaClusterRandomized_internal(
          sigma,
          k,
          value,
          rho
        ),
        variable: variable,
      });
    } else if (variable === "rho") {
      dataFormula1.push({
        x: value,
        y: calculateVarianceFormulaIndividualRandomized_internal(
          sigma,
          constantN
        ),
        variable: variable,
      });
      dataFormula2.push({
        x: value,
        y: calculateVarianceFormulaClusterRandomized_internal(
          sigma,
          k,
          m,
          value
        ),
        variable: variable,
      });
    }
  });

  return { dataFormula1, dataFormula2 };
}

export function generateUnifiedVarianceData(
  variable,
  variableRange,
  sigma,
  k,
  m,
  rho,
  constantN
) {
  const unifiedData = [];

  variableRange.forEach((value) => {
    let variance1, variance2;

    if (variable === "n") {
      variance1 = calculateVarianceFormulaIndividualRandomized_internal(
        sigma,
        value
      );
      variance2 = calculateVarianceFormulaClusterRandomized_internal(
        sigma,
        k,
        m,
        rho
      );
      variable = variable;
    } else if (variable === "k") {
      variance1 = calculateVarianceFormulaIndividualRandomized_internal(
        sigma,
        constantN
      );
      variance2 = calculateVarianceFormulaClusterRandomized_internal(
        sigma,
        value,
        m,
        rho
      );
      variable = variable;
    } else if (variable === "m") {
      variance1 = calculateVarianceFormulaIndividualRandomized_internal(
        sigma,
        constantN
      );
      variance2 = calculateVarianceFormulaClusterRandomized_internal(
        sigma,
        k,
        value,
        rho
      );
      variable = variable;
    } else if (variable === "rho") {
      variance1 = calculateVarianceFormulaIndividualRandomized_internal(
        sigma,
        constantN
      );
      variance2 = calculateVarianceFormulaClusterRandomized_internal(
        sigma,
        k,
        m,
        value
      );
      variable = variable;
    }

    unifiedData.push({
      x: value,
      variance: variance1,
      variance_type: "Individual Variance",
      variable: variable,
    });

    unifiedData.push({
      x: value,
      variance: variance2,
      variance_type: "Cluster Variance",
      variable: variable,
    });

    unifiedData.push({
      x: value,
      variance: variance2 - variance1,
      variance_type: "Variance Delta",
      variable: variable,
    });
  });

  return unifiedData;
}
