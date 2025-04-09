import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { jsPDF } from "https://cdn.skypack.dev/jspdf"
import { require } from "d3-require"
import * as Plot from "npm:@observablehq/plot"
export function tufteBoxPlot(
  data,
  {
    // Data column specifications
    categoryColumn = "Site of Care",
    valueColumn = "Absolute Prevalence DiD",
    lowerColumn = "Absolute Prevalence DiD - Lower Bound",
    upperColumn = "Absolute Prevalence DiD - Upper Bound",
    pValueColumn = "P Value",
    relativeColumn = "Relative DiD",
    leftLabelCategories = [],

    // Basic parameters
    title = "",
    subtitle = "95% Confidence Intervals",
    width = 900,
    height = data.length * 25 + marginTop + marginBottom,
    marginTop = 20,
    marginRight = 100,
    marginBottom = 30,
    marginLeft = 200,

    // Axis configurations
    xLabel = "",
    yLabel = "",
    showReferenceLine = true,
    referenceLineStyle = "2,2",
    tickSize = 4,
    leftTickCount = 6,
    rightTickCount = 4,
    continuousTickCount = 5,
    tickFormat = "percent", // New parameter: 'percent', 'number', or 'currency'

    // Break configuration
    break: useBreak = false,
    xScaleRange = [-0.1, 0.4],
    xScaleLeftRange = [-0.1, 0.025],
    xScaleRightRange = [0.3, 0.4],
    leftSectionWidth = 0.85,
    breakGap = 20,
    showBreakLines = true,
    breakLineColor = "#e0e0e0",
    breakLineWidth = 1,

    // Styling parameters remain the same...
    fontFamily = "serif",
    titleFontSize = 14,
    subtitleFontSize = 10,
    axisLabelFontSize = 12,
    tickLabelFontSize = 10,
    annotationFontSize = 10,
    xAxisTickFontSize = 8,
    fill = "#ccc",
    fillOpacity = 1,
    stroke = "currentColor",
    strokeOpacity = 1,
    strokeWidth = 1,
    r = 3,
    axisLineWidth = 0.5,

    // Other options
    sort = null,
    pValueSigFigs = 2,
    showRelative = false,
    relativeFormatter = (x) => (x * 100).toFixed(1) + "%",
  } = {}
) {
  // Helper function to get the appropriate tick format
  function getTickFormatter(formatType) {
    switch (formatType.toLowerCase()) {
      case "percent":
        return d3.format(".0%")
      case "currency":
        return d3.format("$,.2f")
      case "number":
        return d3.format(",.2f")
      default:
        return d3.format(".0%") // Default to percentage format
    }
  }

  // Rest of the formatting functions remain the same...
  function formatPValue(pValue, sigFigs) {
    if (pValue === null || pValue === undefined) return "N/A"
    const p = Number(pValue)
    if (isNaN(p)) return "N/A"
    if (p < 0.001) return "p < 0.001"
    if (p < 0.05) return "p < 0.05"
    const expStr = p.toExponential(sigFigs - 1)
    return "p = " + Number(expStr).toString()
  }

  let processedData = data.map((d) => ({
    category: d[categoryColumn],
    value: d[valueColumn],
    lowerBound: d[lowerColumn],
    upperBound: d[upperColumn],
    pValue: d[pValueColumn],
    relative: relativeColumn ? d[relativeColumn] : null,
  }))

  if (sort) {
    processedData.sort((a, b) => {
      const comparison = a.value - b.value
      return sort === "ascending" ? comparison : -comparison
    })
  }

  // Create scales and position functions
  let xScale, xScaleLeft, xScaleRight, getX

  if (useBreak) {
    const leftWidth =
      (width - marginLeft - marginRight - breakGap) * leftSectionWidth
    const rightWidth =
      (width - marginLeft - marginRight - breakGap) * (1 - leftSectionWidth)

    xScaleLeft = d3
      .scaleLinear()
      .domain(xScaleLeftRange)
      .range([marginLeft, marginLeft + leftWidth])

    xScaleRight = d3
      .scaleLinear()
      .domain(xScaleRightRange)
      .range([
        marginLeft + leftWidth + breakGap,
        marginLeft + leftWidth + breakGap + rightWidth,
      ])

    getX = (value) => {
      if (value <= xScaleLeftRange[1]) return xScaleLeft(value)
      if (value >= xScaleRightRange[0]) return xScaleRight(value)
      const proportion =
        (value - xScaleLeftRange[1]) /
        (xScaleRightRange[0] - xScaleLeftRange[1])
      return marginLeft + leftWidth + breakGap * proportion
    }
  } else {
    xScale = d3
      .scaleLinear()
      .domain(xScaleRange)
      .range([marginLeft, width - marginRight])

    getX = (value) => xScale(value)
  }

  const yScale = d3
    .scaleBand()
    .domain(processedData.map((d) => d.category))
    .range([marginTop, height - marginBottom])
    .padding(0.5)

  // Create SVG container
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", `max-width: 100%; height: auto; font: 10px ${fontFamily};`)

  // Update the addBrokenAxis function to use the new tick formatter
  function addBrokenAxis(scale, tickCount) {
    const axis = d3
      .axisBottom(scale)
      .tickSize(tickSize)
      .tickFormat(getTickFormatter(tickFormat))
      .ticks(tickCount)

    const axisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(axis)

    axisGroup.select(".domain").attr("stroke-width", axisLineWidth)
    axisGroup.selectAll(".tick line").attr("stroke-width", axisLineWidth)
    axisGroup
      .selectAll("text")
      .style("font-size", `${xAxisTickFontSize}px`)
      .attr("font-family", fontFamily)
  }

  // Add zebra striping
  svg
    .append("g")
    .selectAll("rect")
    .data(processedData)
    .join("rect")
    .attr("x", marginLeft)
    .attr("y", (d) => yScale(d.category))
    .attr("width", width - marginLeft - marginRight)
    .attr("height", yScale.bandwidth())
    .attr("fill", (d, i) => (i % 2 ? "#f8f8f8" : "white"))

  // Add title and subtitle
  if (title) {
    svg
      .append("text")
      .attr("x", marginLeft)
      .attr("y", marginTop - 8)
      .attr("font-weight", "bold")
      .attr("font-size", `${titleFontSize}px`)
      .attr("font-family", fontFamily)
      .text(title)
  }

  if (subtitle) {
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", marginTop)
      .attr("font-size", `${subtitleFontSize}px`)
      .attr("font-family", fontFamily)
      .text(subtitle)
  }

  // Add y-axis
  const yAxis = svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yScale).tickSize(0))

  yAxis.select(".domain").attr("stroke-width", 0)

  yAxis
    .selectAll("text")
    .attr("x", -10)
    .style("text-anchor", "end")
    .style("font-size", `${tickLabelFontSize}px`)
    .attr("font-weight", "bold")
    .attr("font-family", fontFamily)

  // Add x-axis/axes with updated tick formatting
  if (useBreak) {
    addBrokenAxis(xScaleLeft, leftTickCount)
    addBrokenAxis(xScaleRight, rightTickCount)

    if (showBreakLines) {
      const breakX =
        marginLeft +
        (width - marginLeft - marginRight) * leftSectionWidth +
        breakGap / 2
      ;[-1, 1].forEach((offset) => {
        svg
          .append("line")
          .attr("x1", breakX + offset * 2)
          .attr("x2", breakX + offset * 2)
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
          .attr("stroke", breakLineColor)
          .attr("stroke-width", breakLineWidth)
      })
    }
  } else {
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(tickSize)
          .tickFormat(getTickFormatter(tickFormat))
          .ticks(continuousTickCount)
      )

    xAxis.select(".domain").attr("stroke-width", axisLineWidth)
    xAxis.selectAll(".tick line").attr("stroke-width", axisLineWidth)
    xAxis
      .selectAll("text")
      .style("font-size", `${tickLabelFontSize}px`)
      .attr("font-family", fontFamily)
  }

  // Rest of the visualization code remains the same...
  if (xLabel) {
    svg
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", (width + marginLeft - marginRight) / 2)
      .attr("y", height - 5)
      .attr("font-size", `${axisLabelFontSize}px`)
      .attr("font-family", fontFamily)
      .text(xLabel)
  }

  if (yLabel) {
    svg
      .append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -(height + marginTop - marginBottom) / 2)
      .attr("y", marginLeft / 2)
      .attr("font-size", `${axisLabelFontSize}px`)
      .attr("font-family", fontFamily)
      .text(yLabel)
  }

  if (showReferenceLine) {
    if (!useBreak && xScaleRange[0] <= 0 && xScaleRange[1] >= 0) {
      svg
        .append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom)
        .attr("stroke", "#777")
        .attr("stroke-dasharray", referenceLineStyle)
        .attr("stroke-opacity", 0.5)
    } else if (useBreak) {
      if (xScaleLeftRange[0] <= 0 && xScaleLeftRange[1] >= 0) {
        svg
          .append("line")
          .attr("x1", xScaleLeft(0))
          .attr("x2", xScaleLeft(0))
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
          .attr("stroke", "#777")
          .attr("stroke-dasharray", referenceLineStyle)
          .attr("stroke-opacity", 0.5)
      } else if (xScaleRightRange[0] <= 0 && xScaleRightRange[1] >= 0) {
        svg
          .append("line")
          .attr("x1", xScaleRight(0))
          .attr("x2", xScaleRight(0))
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
          .attr("stroke", "#777")
          .attr("stroke-dasharray", referenceLineStyle)
          .attr("stroke-opacity", 0.5)
      }
    }
  }

  // Add confidence intervals
  const ciGroups = svg.append("g").selectAll("g").data(processedData).join("g")

  ciGroups
    .append("line")
    .attr("x1", (d) => getX(d.lowerBound))
    .attr("x2", (d) => getX(d.upperBound))
    .attr("y1", (d) => yScale(d.category) + yScale.bandwidth() / 2)
    .attr("y2", (d) => yScale(d.category) + yScale.bandwidth() / 2)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)

  ciGroups
    .append("circle")
    .attr("cx", (d) => getX(d.value))
    .attr("cy", (d) => yScale(d.category) + yScale.bandwidth() / 2)
    .attr("r", r)
    .attr("fill", "black")
    .attr("stroke", "white")
    .attr("stroke-width", 1)

  // Add p-values & relative text
  ciGroups
    .append("text")
    .attr("x", (d) => {
      const isLeftLabel = leftLabelCategories.includes(d.category)
      return isLeftLabel ? getX(d.lowerBound) - 5 : getX(d.upperBound) + 5
    })
    .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) =>
      leftLabelCategories.includes(d.category) ? "end" : "start"
    )
    .attr("font-size", `${annotationFontSize}px`)
    .attr("font-family", fontFamily)
    .text((d) => {
      const pValueText = formatPValue(d.pValue, pValueSigFigs)
      if (!showRelative || d.relative === null) {
        return d.relative === null ? "" : pValueText
      }
      const relativeText = `(${d.relative < 0 ? "" : "+"}${relativeFormatter(
        d.relative
      )})`
      return `${pValueText} ${relativeText}`
    })

  return svg.node()
}

export function createVisualizationWithDownload(
  plotFunction, // The visualization function to use
  data, // Data for the visualization
  options = {}, // Visualization options
  downloadOptions = {
    filename: "visualization", // Base filename without extension
    buttonStyle: "px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded", // CSS classes for buttons
    containerStyle: "flex flex-col gap-4", // CSS classes for container
    buttonContainerStyle: "flex gap-2", // CSS classes for button container
    formats: ["svg", "png", "pdf"], // Enabled download formats
    scale: 2, // Scale factor for PNG and PDF export
  }
) {
  // Create container div
  const container = document.createElement("div")
  container.className = downloadOptions.containerStyle

  // Create and render visualization
  const plot = plotFunction(data, options)
  const plotContainer = document.createElement("div")
  plotContainer.appendChild(plot)
  container.appendChild(plotContainer)

  // Create button container
  const buttonContainer = document.createElement("div")
  buttonContainer.className = downloadOptions.buttonContainerStyle

  // Define download handlers
  const handlers = {
    svg: {
      text: "Download SVG",
      handler: function downloadSVG(svg) {
        const serializer = new XMLSerializer()
        const svgStr = serializer.serializeToString(svg)
        const blob = new Blob([svgStr], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${downloadOptions.filename}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      },
    },
    png: {
      text: "Download PNG",
      handler: function downloadPNG(svg) {
        const serializer = new XMLSerializer()
        const svgStr = serializer.serializeToString(svg)

        const canvas = document.createElement("canvas")
        const scale = downloadOptions.scale
        canvas.width = svg.width.baseVal.value * scale
        canvas.height = svg.height.baseVal.value * scale
        const ctx = canvas.getContext("2d")
        ctx.scale(scale, scale)

        const img = new Image()
        const blob = new Blob([svgStr], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)

        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          const pngUrl = canvas.toDataURL("image/png")
          const link = document.createElement("a")
          link.href = pngUrl
          link.download = `${downloadOptions.filename}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }

        img.src = url
      },
    },
    pdf: {
      text: "Download PDF",
      handler: function downloadPDF(svg) {
        const serializer = new XMLSerializer()
        const svgStr = serializer.serializeToString(svg)

        const canvas = document.createElement("canvas")
        const scale = downloadOptions.scale
        const width = svg.width.baseVal.value
        const height = svg.height.baseVal.value

        canvas.width = width * scale
        canvas.height = height * scale
        const ctx = canvas.getContext("2d")
        ctx.scale(scale, scale)

        const img = new Image()
        const blob = new Blob([svgStr], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)

        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          const imgData = canvas.toDataURL("image/png")

          const pdfWidth = width * 0.75
          const pdfHeight = height * 0.75

          const pdf = new jsPDF({
            orientation: width > height ? "landscape" : "portrait",
            unit: "pt",
            format: [pdfWidth, pdfHeight],
          })

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

          pdf.save(`${downloadOptions.filename}.pdf`)
          URL.revokeObjectURL(url)
        }

        img.src = url
      },
    },
  }

  // Create enabled download buttons
  downloadOptions.formats.forEach((format) => {
    if (handlers[format]) {
      const button = document.createElement("button")
      button.textContent = handlers[format].text
      button.className = downloadOptions.buttonStyle
      button.onclick = () => handlers[format].handler(plot)
      buttonContainer.appendChild(button)
    }
  })

  container.appendChild(buttonContainer)
  return container
}
