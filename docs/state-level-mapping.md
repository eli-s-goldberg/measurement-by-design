---
# theme: dashboard
title: State Level Mapping
toc: true
---

# Chronic Disease in America

Chronic disease in America is fairly well tracked by the CDC and the BRFSS. Let's make a little live plot to demonstrate.

```js
// import d3.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { calculateCentroid } from "./components/map-utilities.js"
```

Steps:

1. Pull in geojson data

```js
// Pull in geojson data
const us = FileAttachment("./data/us-counties-10m.json").json()
```

2. Split it up into states and nations to control visibility for both.

```js
const states = topojson.feature(us, us.objects.states)
const nation = topojson.feature(us, us.objects.nation)
```

3. Find the [centroids for each state](https://developers.google.com/public-data/docs/canonical/states_csv). This is common, so google has helped us out a bit.

```js
const state_centers = await FileAttachment("./data/state-centers.csv").csv({
  typed: true,
})
```

3. Bring in the BRFSS Data.

```js
const obesity_data = await FileAttachment(
  "./data/BRFSS__Table_of_Overweight_and_Obesity__BMI__20241118.csv"
).csv({ typed: true })
```

4. Create unique list of breakouts categories, breakouts and years.

```js
// create unique list of breakouts categories.
const uniqueBreak_Out_Category = Array.from(
  new Set(obesity_data.map((d) => d["Break_Out_Category"]))
)
// create unique list of breakouts.
const uniqueBreak_Out = Array.from(
  new Set(obesity_data.map((d) => d["Break_Out"]))
)

// create unique list of years.
const uniqueYear = Array.from(new Set(obesity_data.map((d) => d["Year"])))
```

5. Create selection views to solicit selection of breakout category, breakout, and year to visualize. These will be visualized ensemble with other selections, but calculated here.

6. Based on the selection, dynamically return the responses. Then select response to be visualized.

```js
// function to return response conditional on break out category selection
function getUniqueResponses(selectedBreakOutCategory) {
  return Array.from(
    new Set(
      obesity_data
        .filter((d) => d["Break_Out_Category"] === selectedBreakOutCategory)
        .map((d) => d["Response"])
    )
  )
}

// Initial Responses
const currentResponses = getUniqueResponses(B_O_C)
```

7. Filter the data to _just_ what's needed to visualize. Map and prep data for plotting with conditional selections. Create color scale for choropleth.

```js
const filteredData = obesity_data
  .filter(
    (d) =>
      d["Break_Out_Category"] === B_O_C &&
      d["Year"] === Y_S &&
      d["Response"] === R_S &&
      d["Break_Out"] === B_O
  ) // filter based on selections
  .map((d) => ({
    state: d["Locationdesc"],
    prevalence: parseFloat(d["Data_value"]),
    race: d["Break_Out"],
    response: d["Response"],
  })) // remap data to give common sense categories.
  .map((d) => {
    const geo = state_centers.find(
      (state) => state.name.toLowerCase() === d.state.toLowerCase()
    ) // join state center data and make things uniform to match

    // Log unmatched states
    if (!geo) {
      console.warn(`No geolocation found for state: ${d.state}`)
    }

    // return mapped data with two lat long
    // impute nulls where state data isn't available
    return {
      ...d,
      latitude: geo ? geo.latitude : null,
      longitude: geo ? geo.longitude : null,
    }
  })

// Convert to a map for easier lookup
// this isn't strictly neccessary, but helps with color mapping
const prevalenceByState = new Map(
  filteredData.map((d) => [d.state, d.prevalence])
)

// create color scale
// TODO(harmonize color scale across quantiles instead of extent)
const prevalenceExtent = d3.extent(filteredData, (d) => d.prevalence)
// create quantized colorscale
const colorScale = d3
  .scaleQuantize()
  .domain(prevalenceExtent)
  .range(d3.schemeBlues[9])
```

8. Force simulate to prevent overlaps with some constraints. This isn't strictly neccessary, but is a nice touch. Do it once and you've got a nice template to do it in the future.

```js
// Create projection
const projection = d3.geoAlbersUsa().scale(1300).translate([600, 300])

// Create label data with more realistic text dimensions
const labelData = filteredData
  .map((d) => {
    const projected = projection([d.longitude, d.latitude])
    if (!projected) return null

    // Calculate actual text width based on content
    // Approximate 8px per character
    const textWidth = `${d.prevalence.toFixed(1)}%`.length * 8

    return {
      x: projected[0],
      y: projected[1],
      text: `${d.prevalence.toFixed(1)}%`,
      originalX: projected[0],
      originalY: projected[1],
      state: d.state,
      longitude: d.longitude,
      latitude: d.latitude,
      width: textWidth + 10,
      height: 20,
    }
  })
  .filter((d) => d !== null) // handle nulls

// More precise overlap detection
function checkOverlap(a, b) {
  const buffer = 50 // Additional spacing between labels
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 + buffer &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2 + buffer
  )
}

// Find overlapping labels
const overlappingLabels = new Set()
labelData.forEach((label, i) => {
  labelData.slice(i + 1).forEach((otherLabel) => {
    if (checkOverlap(label, otherLabel)) {
      overlappingLabels.add(label)
      overlappingLabels.add(otherLabel)
    }
  })
})

// Force simulation only for overlapping labels
const simulation = d3
  .forceSimulation([...overlappingLabels])
  .force("x", d3.forceX((d) => d.originalX).strength(x_force))
  .force("y", d3.forceY((d) => d.originalY).strength(y_force))
  .force("collision", d3.forceCollide().radius(radius))
  .stop()

for (let i = 0; i < 50; i++) simulation.tick()

// Update positions
labelData.forEach((label) => {
  if (overlappingLabels.has(label)) {
    label.vx = label.x - label.originalX
    label.vy = label.y - label.originalY
  } else {
    label.vx = 0
    label.vy = 0
  }
})
```

9. View selections.

```js
const B_O_C = view(
  Inputs.select(uniqueBreak_Out_Category, {
    value: "Race/Ethnicity",
    label: "Break Out Category",
  })
)

const B_O = view(
  Inputs.select(uniqueBreak_Out, {
    value: "White, non-Hispanic",
    label: "Break Out",
  })
)

const Y_S = view(
  //[2011,2023]
  Inputs.range(d3.extent(uniqueYear), {
    value: 2023,
    step: 1,
    label: "Year",
    format: (year) => year.toString(),
  })
)
```

```js
// Visualize response
const R_S = view(
  Inputs.select(currentResponses, {
    label: "Response",
  })
)
const radius = view(
  Inputs.range([0, 100], { label: "influence radius", step: 0.1, value: 2 })
)
const x_force = view(Inputs.range([0, 1], { label: "x force ", step: 0.05 }))
const y_force = view(Inputs.range([0, 1], { label: "y force ", step: 0.05 }))
const toggle_on = view(Inputs.select([0, 1], { label: "Toggle Labels " }))
```

10. Plot!

```js
const chart = Plot.plot({
  projection: projection,
  height: 600,
  width: 1200,
  style: {
    fontSize: 12,
  },
  marks: [
    Plot.geo(nation, { stroke: "black", strokeOpacity: 0.5 }),
    Plot.geo(states, {
      stroke: "black",
      strokeOpacity: 0.5,
      fill: (d) => {
        const prevalence = prevalenceByState.get(d.properties.name)
        return prevalence != null ? colorScale(prevalence) : "#ccc"
      },
    }),
    // Plot.dot(labelData, {
    //   x: d => d.longitude + d.vx,
    //   y: d => d.latitude + d.vy,
    //   r: 2,
    //   fill: "red",
    //   title: d => d.state
    // }),
    Plot.text(labelData, {
      x: (d) => d.longitude + d.vx / 1.1,
      y: (d) => d.latitude + d.vy / 1.1,
      text: (d) => d.text,
      fill: "yellow",
      stroke: "black",
      fontSize: 15,
      strokeWidth: 3,
      title: (d) => d.state,
    }),
    Plot.arrow(
      labelData.filter((d) => d.vx !== 0 || d.vy !== 0),
      {
        x2: (d) => d.longitude + d.vx / 1.4,
        y2: (d) => d.latitude + d.vy / 1.4,
        x1: (d) => d.longitude,
        y1: (d) => d.latitude,
        headLength: 2,
        stroke: "orange",
      }
    ),
  ],
})

view(chart)
```

## Time series view

```js
const macMapping = new Map([
  ["Alabama", { mac: "Palmetto GBA", jurisdiction: "J10", abbr: "AL" }],
  [
    "Alaska",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J2", abbr: "AK" },
  ],
  [
    "Arizona",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J3", abbr: "AZ" },
  ],
  ["Arkansas", { mac: "Novitas Solutions", jurisdiction: "J7", abbr: "AR" }],
  [
    "California",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J1", abbr: "CA" },
  ],
  ["Colorado", { mac: "Novitas Solutions", jurisdiction: "J4", abbr: "CO" }],
  [
    "Connecticut",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J13",
      abbr: "CT",
    },
  ],
  ["Delaware", { mac: "Novitas Solutions", jurisdiction: "J12", abbr: "DE" }],
  [
    "District of Columbia",
    { mac: "Novitas Solutions", jurisdiction: "J12", abbr: "DC" },
  ],
  [
    "Florida",
    { mac: "First Coast Service Options", jurisdiction: "J9", abbr: "FL" },
  ],
  ["Georgia", { mac: "Palmetto GBA", jurisdiction: "J10", abbr: "GA" }],
  [
    "Hawaii",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J1", abbr: "HI" },
  ],
  [
    "Idaho",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J2", abbr: "ID" },
  ],
  [
    "Illinois",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J6",
      abbr: "IL",
    },
  ],
  [
    "Indiana",
    {
      mac: "Wisconsin Physicians Service (WPS)",
      jurisdiction: "J8",
      abbr: "IN",
    },
  ],
  [
    "Iowa",
    {
      mac: "Wisconsin Physicians Service (WPS)",
      jurisdiction: "J5",
      abbr: "IA",
    },
  ],
  [
    "Kansas",
    {
      mac: "Wisconsin Physicians Service (WPS)",
      jurisdiction: "J5",
      abbr: "KS",
    },
  ],
  ["Kentucky", { mac: "CGS Administrators", jurisdiction: "J15", abbr: "KY" }],
  ["Louisiana", { mac: "Novitas Solutions", jurisdiction: "J7", abbr: "LA" }],
  [
    "Maine",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J14",
      abbr: "ME",
    },
  ],
  ["Maryland", { mac: "Novitas Solutions", jurisdiction: "J12", abbr: "MD" }],
  [
    "Massachusetts",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J14",
      abbr: "MA",
    },
  ],
  [
    "Michigan",
    {
      mac: "Wisconsin Physicians Service (WPS)",
      jurisdiction: "J8",
      abbr: "MI",
    },
  ],
  [
    "Minnesota",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J6",
      abbr: "MN",
    },
  ],
  ["Mississippi", { mac: "Novitas Solutions", jurisdiction: "J7", abbr: "MS" }],
  [
    "Missouri",
    {
      mac: "Wisconsin Physicians Service (WPS)",
      jurisdiction: "J5",
      abbr: "MO",
    },
  ],
  [
    "Montana",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J3", abbr: "MT" },
  ],
  [
    "Nebraska",
    {
      mac: "Wisconsin Physicians Service (WPS)",
      jurisdiction: "J5",
      abbr: "NE",
    },
  ],
  [
    "Nevada",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J1", abbr: "NV" },
  ],
  [
    "New Hampshire",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J14",
      abbr: "NH",
    },
  ],
  ["New Jersey", { mac: "Novitas Solutions", jurisdiction: "J12", abbr: "NJ" }],
  ["New Mexico", { mac: "Novitas Solutions", jurisdiction: "J4", abbr: "NM" }],
  [
    "New York",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J13",
      abbr: "NY",
    },
  ],
  ["North Carolina", { mac: "Palmetto GBA", jurisdiction: "J11", abbr: "NC" }],
  [
    "North Dakota",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J3", abbr: "ND" },
  ],
  ["Ohio", { mac: "CGS Administrators", jurisdiction: "J15", abbr: "OH" }],
  ["Oklahoma", { mac: "Novitas Solutions", jurisdiction: "J4", abbr: "OK" }],
  [
    "Oregon",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J2", abbr: "OR" },
  ],
  [
    "Pennsylvania",
    { mac: "Novitas Solutions", jurisdiction: "J12", abbr: "PA" },
  ],
  [
    "Rhode Island",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J14",
      abbr: "RI",
    },
  ],
  ["South Carolina", { mac: "Palmetto GBA", jurisdiction: "J11", abbr: "SC" }],
  [
    "South Dakota",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J3", abbr: "SD" },
  ],
  ["Tennessee", { mac: "Palmetto GBA", jurisdiction: "J10", abbr: "TN" }],
  ["Texas", { mac: "Novitas Solutions", jurisdiction: "J4", abbr: "TX" }],
  [
    "Utah",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J3", abbr: "UT" },
  ],
  [
    "Vermont",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J14",
      abbr: "VT",
    },
  ],
  ["Virginia", { mac: "Palmetto GBA", jurisdiction: "J11", abbr: "VA" }],
  [
    "Washington",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J2", abbr: "WA" },
  ],
  ["West Virginia", { mac: "Palmetto GBA", jurisdiction: "J11", abbr: "WV" }],
  [
    "Wisconsin",
    {
      mac: "National Government Services (NGS)",
      jurisdiction: "J6",
      abbr: "WI",
    },
  ],
  [
    "Wyoming",
    { mac: "Noridian Healthcare Solutions", jurisdiction: "J3", abbr: "WY" },
  ],
])

const getMACOptions = () => {
  const jurisdictionStates = {}

  Array.from(macMapping.values()).forEach(({ jurisdiction, abbr }) => {
    if (!jurisdictionStates[jurisdiction]) {
      jurisdictionStates[jurisdiction] = []
    }
    jurisdictionStates[jurisdiction].push(abbr)
  })

  return Object.entries(jurisdictionStates)
    .sort((a, b) => {
      const numA = parseInt(a[0].substring(1))
      const numB = parseInt(b[0].substring(1))
      return numA - numB
    })
    .map(([j, states]) => `${j}: ${states.sort().join(", ")}`)
}

const selectedMACs = view(
  Inputs.select(getMACOptions(), {
    label: "Medicare Administrative Contractors (MACs)",
    value: ["J3: WY, ND, MT, SD"],
    multiple: true,
  })
)

const validData = obesity_data.filter(
  (d) =>
    d.Data_value !== null &&
    !d.Data_Value_Footnote_Symbol &&
    d.Sample_Size >= 50
)

const selectedCategory = view(
  Inputs.select(
    Array.from(new Set(validData.map((d) => d.Break_Out_Category))),
    {
      label: "Break Out Category",
      value: "Overall",
    }
  )
)
```

```js
const selectedBreakouts = view(
  Inputs.select(
    selectedCategory === "Overall"
      ? ["Overall"]
      : Array.from(
          new Set(
            obesity_data
              .filter((d) => d.Break_Out_Category === selectedCategory)
              .map((d) => d.Break_Out)
          )
        ),
    {
      label: "Break Out",
      multiple: true,
      value: selectedCategory === "Overall" ? ["Overall"] : ["18-24", "25-34"],
    }
  )
)
const getUniqueResponses = () => {
  return Array.from(
    new Set(obesity_data.map((d) => d.Response).map((r) => r.toLowerCase()))
  ).map(
    (r) => obesity_data.find((d) => d.Response.toLowerCase() === r).Response
  ) // Get original casing
}

const selectedResponses = view(
  Inputs.select(getUniqueResponses(), {
    label: "Response",
    multiple: true,
    value: ["Obese (BMI 30.0 - 99.8)"],
  })
)
```

```js
// Helper function to extract jurisdiction code from MAC option
const getJurisdictionFromOption = (option) => option.split(":")[0]

// Helper function to extract jurisdictions from selected MAC options
const getSelectedJurisdictions = () =>
  selectedMACs.map((mac) => getJurisdictionFromOption(mac))

const plotData = obesity_data
  .filter((d) => {
    const stateInfo = macMapping.get(d.Locationdesc)
    return (
      stateInfo && getSelectedJurisdictions().includes(stateInfo.jurisdiction)
    )
  })
  .filter((d) => d.Break_Out_Category === selectedCategory)
  .filter(
    (d) =>
      selectedCategory === "Overall" || selectedBreakouts.includes(d.Break_Out)
  )
  .filter((d) => selectedResponses.includes(d.Response))
  .map((d) => ({
    year: d.Year,
    state: d.Locationdesc,
    value: d.Data_value,
    ci_low: d.Confidence_limit_Low,
    ci_high: d.Confidence_limit_High,
    response: d.Response,
    breakout: selectedCategory === "Overall" ? "Overall" : d.Break_Out,
    category: d.Break_Out_Category,
    jurisdiction: macMapping.get(d.Locationdesc).jurisdiction,
    stateAbbr: macMapping.get(d.Locationdesc).abbr,
  }))
  .filter((d) => d.value != null)

const getLegendLabel = (d) => {
  const jurisdictions = Array.from(
    new Set(
      plotData
        .filter((p) => p.breakout === d.breakout && p.response === d.response)
        .map((p) => p.jurisdiction)
    )
  )
    .sort()
    .join(", ")
  return `${d.response}, ${d.breakout} (${jurisdictions})`
}

// Calculate summary statistics
const summaryData = Array.from(
  d3.group(
    plotData,
    (d) => d.year,
    (d) => d.breakout,
    (d) => d.response
  )
)
  .map(([year, breakouts]) =>
    Array.from(breakouts).map(([breakout, responses]) =>
      Array.from(responses).map(([response, values]) => ({
        year: +year,
        breakout,
        response,
        mean: d3.mean(values, (d) => d.value),
        ci_low: d3.mean(values, (d) => d.ci_low),
        ci_high: d3.mean(values, (d) => d.ci_high),
      }))
    )
  )
  .flat(2)

view(summaryData)
// Create ordered unique legend labels
const legendLabels = Array.from(
  new Set(
    plotData.map((d) => {
      const jurisdictions = Array.from(
        new Set(
          plotData
            .filter(
              (p) => p.breakout === d.breakout && p.response === d.response
            )
            .map((p) => p.jurisdiction)
        )
      )
        .sort()
        .join(", ")
      return `${d.response}, ${d.breakout} (${jurisdictions})`
    })
  )
).sort()

const breakoutColors = d3
  .scaleOrdinal()
  .domain(legendLabels)
  .range(d3.schemeTableau10)

const plot = Plot.plot({
  height: 300,
  width: 1000,
  marginLeft: 60,
  grid: true,
  x: {
    label: "Year",
    tickFormat: (d) => d.toString(),
  },
  y: {
    label: "Prevalence (%)",
    domain: [0, 100],
  },
  color: {
    legend: true,
    domain: legendLabels,
  },
  marks: [
    Plot.line(plotData, {
      x: "year",
      y: "value",
      stroke: (d) => breakoutColors(getLegendLabel(d)),
      strokeOpacity: 0.1,
      z: (d) => `${d.state}_${getLegendLabel(d)}`,
    }),
    Plot.ruleY([0]),
    Plot.line(summaryData, {
      x: "year",
      y: "mean",
      stroke: (d) => breakoutColors(getLegendLabel(d)),
      strokeWidth: 2,
      z: (d) => getLegendLabel(d),
    }),
    Plot.areaY(summaryData, {
      x: "year",
      y1: "ci_low",
      y2: "ci_high",
      fill: (d) => breakoutColors(getLegendLabel(d)),
      fillOpacity: 0.2,
      z: (d) => getLegendLabel(d),
    }),
  ],
})

view(plot)
```
