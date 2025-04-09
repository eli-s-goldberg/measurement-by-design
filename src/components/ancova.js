import { require } from "d3-require"
const jStat = await require("jstat@1.9.4")

function encodeDummies(data, col) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error("Data must be a non-empty array")
  }
  if (!data[0].hasOwnProperty(col)) {
    throw new Error(`Column '${col}' does not exist in data`)
  }

  const processedData = data.map((row) => {
    const val = row[col]
    if (val === undefined || val === null) {
      throw new Error(`Invalid value in column '${col}'`)
    }
    return { ...row, [col]: val.toString() }
  })

  const levels = [...new Set(processedData.map((r) => r[col]))].sort()
  const dummyLevels = levels.slice(1)

  const encodedData = processedData.map((row) => {
    const newRow = { ...row }
    dummyLevels.forEach((lvl) => {
      newRow[`${col}_${lvl}`] = row[col] === lvl ? 1 : 0
    })
    return newRow
  })

  return { encodedData, levels }
}

function buildDesignMatrix(data, predictors, dependentVar) {
  if (!data[0].hasOwnProperty(dependentVar)) {
    throw new Error(`Column '${dependentVar}' does not exist in data`)
  }

  const X = []
  const y = []
  data.forEach((row) => {
    if (row[dependentVar] === undefined) {
      throw new Error(`Missing dependent variable '${dependentVar}' in row`)
    }
    const rowX = [1]
    predictors.forEach((p) => {
      if (!row.hasOwnProperty(p)) {
        throw new Error(`Column '${p}' not found in data`)
      }
      rowX.push(parseFloat(row[p]))
    })
    X.push(rowX)
    y.push(parseFloat(row[dependentVar]))
  })
  return { X, y }
}

function fitModel(X, y) {
  if (!X || !y || X.length !== y.length) {
    throw new Error("Invalid input dimensions")
  }
  const n = X.length
  const p = X[0].length

  // Compute X^T X
  const XtX = Array.from({ length: p }, () => Array(p).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < p; k++) {
        XtX[j][k] += X[i][j] * X[i][k]
      }
    }
  }

  // Check invertibility
  if (Math.abs(jStat.det(XtX)) < 1e-12) {
    throw new Error("X^T X is singular or nearly singular")
  }

  // Compute X^T y
  const XtY = Array(p).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      XtY[j] += X[i][j] * y[i]
    }
  }

  // Invert and solve
  const XtX_inv = jStat.inv(XtX)
  const beta = XtX_inv.map((row) =>
    row.reduce((acc, val, idx) => acc + val * XtY[idx], 0)
  )

  // Fitted values
  const yhat = X.map((row) =>
    row.reduce((acc, val, idx) => acc + val * beta[idx], 0)
  )

  // Residuals
  const residuals = y.map((val, idx) => val - yhat[idx])
  const rss = residuals.reduce((acc, r) => acc + r * r, 0)
  const df = n - p
  const s2 = rss / df

  // Standard errors
  const se = XtX_inv.map((row, i) => Math.sqrt(s2 * row[i]))
  // t-stats and p-values
  const tStats = beta.map((b, i) => b / se[i])
  const pValues = tStats.map(
    (t) => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df))
  )

  return { beta, se, tStats, pValues, yhat, residuals, rss, df, s2, XtX_inv }
}

function partialFTest(
  RSS_reduced,
  RSS_full,
  df_reduced,
  df_full,
  nParamsAdded
) {
  const numerator = (RSS_reduced - RSS_full) / nParamsAdded
  const denominator = RSS_full / df_full
  const fStatistic = numerator / denominator
  const pValue = 1 - jStat.centralF.cdf(fStatistic, nParamsAdded, df_full)
  return { fStatistic, pValue }
}

export function ancovaRegression({ data, dependentVar, covariates, groupVar }) {
  const { encodedData, levels } = encodeDummies(data, groupVar)
  const dummyCols = levels.slice(1).map((lvl) => `${groupVar}_${lvl}`)

  // Reduced model: only covariates
  const { X: X_reduced, y: y_reduced } = buildDesignMatrix(
    encodedData,
    covariates,
    dependentVar
  )
  const reducedModel = fitModel(X_reduced, y_reduced)

  // Full model: covariates + group dummies
  const { X: X_full, y: y_full } = buildDesignMatrix(
    encodedData,
    [...covariates, ...dummyCols],
    dependentVar
  )
  const fullModel = fitModel(X_full, y_full)

  // Partial F-test
  const partialF = partialFTest(
    reducedModel.rss,
    fullModel.rss,
    reducedModel.df,
    fullModel.df,
    dummyCols.length
  )

  return { reducedModel, fullModel, partialF, levels }
}

// Example usage
// const data = [
//   { group: "A", covar1: 2, y: 10 },
//   { group: "A", covar1: 3, y: 12 },
//   { group: "B", covar1: 5, y: 20 },
//   { group: "B", covar1: 6, y: 25 },
// ]
// const result = ancovaRegression({
//   data,
//   dependentVar: "y",
//   covariates: ["covar1"],
//   groupVar: "group",
// })
// console.log(result)
