---
toc: true
title: Executive Summary Dashboard
---

```js
// import some CSS to keep things well styled
import { defaultStyles } from "./components/styles.js";
const styleElement = html`<style>
  ${defaultStyles}
</style>`;
document.head.appendChild(styleElement);
```

# Measurement by design

Of the subset of things that providers, payers, and people _should_ do to help their members and patients and selves, one can only afford to do a smaller subset... _always_. In order to make this bet, you need to understand how to go from an idea to an intervention design to a business case estimate of the incremental clinical and financial impact to marketing material that will drive behavior change to understanding the degree to which that intervention _credibly_ moves the needle on cost and health.

## Purpose

The purpose of this demo is to clearly articulate and provide an example of how to create, size, sell, optimize, and understand the impact of an intervention on your book.

Let's start with the executive summary.

## Executive Summary Dashboard

```js
import { CampaignDashboard } from "./components/campaigndashboard.js";
const campaignData = [
  {
    id: 3,
    version: "v3",
    timeInMarket: "Sep 2023 - Present",
    deprecated: false,
    intervention: "ML-powered personalized engagement timing",
    description: "All active users with 30+ days history",
    behaviorLevers: [
      "Optimal message timing",
      "Personalized content",
      "Context-aware notifications",
    ],
    fundamentalAssumptions: [
      "Users respond better to personalized timing",
      "Context awareness increases engagement",
    ],
    population: {
      size: 300000,
      description: "All active users with 30+ days history",
    },
    metrics: {
      engagementRate: {
        value: 55.1,
        lift: 25.4,
        pValue: 0.001,
        ci: [52.3, 57.9],
        stdDev: 2.8,
      },
      engagedPopulation: {
        value: 165300,
        lift: 28.7,
        pValue: 0.001,
        ci: [160000, 170000],
        stdDev: 5000,
      },
      behavioralChange: {
        value: 32.4,
        lift: 25.4,
        pValue: 0.001,
        ci: [29.1, 35.7],
        stdDev: 3.2,
      },
      costPerChange: {
        value: 42.5,
        lift: -15.2,
        pValue: 0.002,
        ci: [38.75, 46.25],
        stdDev: 3.75,
      },
      clinicalImpact: {
        value: 18.9,
        lift: 18.9,
        pValue: 0.002,
        ci: [15.4, 22.4],
        stdDev: 2.8,
      },
      financialImpact: {
        value: 12000000,
        lift: 35.2,
        pValue: 0.001,
        ci: [10500000, 13500000],
        stdDev: 1500000,
      },
      totalImpact: {
        value: 15000000,
        lift: 40.5,
        pValue: 0.001,
        ci: [13000000, 17000000],
        stdDev: 2000000,
      },
    },
    priorVersions: [
      {
        version: "2.1",
        timeInMarket: "Jun 2023 - Aug 2023",
        changes: "Added basic personalization",
        metrics: {
          engagementRate: { value: 45.2 },
          totalImpact: { value: 10000000 },
          costPerChange: { value: 50.25 },
        },
      },
    ],
  },
  {
    id: 4,
    version: "v2",
    timeInMarket: "Oct 2023 - Present",
    deprecated: false,
    intervention: "Gamified rewards for engagement",
    description: "Users under age 40 with high digital engagement",
    behaviorLevers: ["Frequent feedback loops", "Achievement badges"],
    fundamentalAssumptions: [
      "Gamification increases retention",
      "Recognition motivates users",
    ],
    population: {
      size: 250000,
      description: "Users under age 40 with high digital engagement",
    },
    metrics: {
      engagementRate: {
        value: 63.4,
        lift: 32.1,
        pValue: 0.001,
        ci: [60.0, 66.8],
        stdDev: 3.1,
      },
      engagedPopulation: {
        value: 158500,
        lift: 30.2,
        pValue: 0.001,
        ci: [155000, 162000],
        stdDev: 4000,
      },
      behavioralChange: {
        value: 28.6,
        lift: 22.5,
        pValue: 0.001,
        ci: [26.1, 31.1],
        stdDev: 2.5,
      },
      costPerChange: {
        value: 37.1,
        lift: -12.3,
        pValue: 0.003,
        ci: [33.5, 40.7],
        stdDev: 3.2,
      },
      financialImpact: {
        value: 8500000,
        lift: 28.0,
        pValue: 0.001,
        ci: [7500000, 9500000],
        stdDev: 1000000,
      },
      totalImpact: {
        value: 11000000,
        lift: 31.5,
        pValue: 0.001,
        ci: [9500000, 12500000],
        stdDev: 1500000,
      },
    },
    priorVersions: [
      {
        version: "1.0",
        timeInMarket: "Jul 2023 - Sep 2023",
        changes: "Initial launch with basic reward tracking",
        metrics: {
          engagementRate: { value: 48.5 },
          totalImpact: { value: 6500000 },
          costPerChange: { value: 43.2 },
        },
      },
    ],
  },
  {
    id: 5,
    version: "v3.2",
    timeInMarket: "Nov 2023 - Present",
    deprecated: false,
    intervention: "AI-driven habit-forming nudges",
    description: "Health-focused users with 7+ days of daily activity",
    behaviorLevers: ["Small frequent prompts", "Goal reinforcement"],
    fundamentalAssumptions: [
      "Consistent nudges sustain habits",
      "Goal setting aligns actions",
    ],
    population: {
      size: 200000,
      description: "Health-focused users with 7+ days of daily activity",
    },
    metrics: {
      engagementRate: {
        value: 58.7,
        lift: 26.3,
        pValue: 0.001,
        ci: [55.4, 62.0],
        stdDev: 3.3,
      },
      engagedPopulation: {
        value: 117400,
        lift: 27.8,
        pValue: 0.001,
        ci: [114000, 121000],
        stdDev: 3500,
      },
      behavioralChange: {
        value: 33.5,
        lift: 29.1,
        pValue: 0.001,
        ci: [30.2, 36.8],
        stdDev: 3.1,
      },
      costPerChange: {
        value: 39.9,
        lift: -10.5,
        pValue: 0.003,
        ci: [36.4, 43.4],
        stdDev: 3.0,
      },
      clinicalImpact: {
        value: 22.5,
        lift: 21.2,
        pValue: 0.002,
        ci: [19.1, 25.9],
        stdDev: 3.4,
      },
      financialImpact: {
        value: 7800000,
        lift: 31.0,
        pValue: 0.001,
        ci: [6700000, 8900000],
        stdDev: 1200000,
      },
      totalImpact: {
        value: 9500000,
        lift: 33.8,
        pValue: 0.001,
        ci: [8200000, 10800000],
        stdDev: 1300000,
      },
    },
    priorVersions: [
      {
        version: "3.0",
        timeInMarket: "Aug 2023 - Oct 2023",
        changes: "Added reinforcement messaging",
        metrics: {
          engagementRate: { value: 50.6 },
          totalImpact: { value: 5800000 },
          costPerChange: { value: 45.7 },
        },
      },
      {
        version: "2.0",
        timeInMarket: "May 2023 - Jul 2023",
        changes: "Initial AI integration for habit formation",
        metrics: {
          engagementRate: { value: 42.1 },
          totalImpact: { value: 4500000 },
          costPerChange: { value: 48.95 },
        },
      },
    ],
  },
  {
    id: 6,
    version: "v1.5",
    timeInMarket: "Oct 2023 - Present",
    deprecated: false,
    intervention: "Social proof motivational messaging",
    description: "New users in first 90 days",
    behaviorLevers: [
      "Peer comparisons",
      "Success stories",
      "Community milestones",
    ],
    fundamentalAssumptions: [
      "Social comparison drives behavior change",
      "Peer success stories increase motivation",
    ],
    population: {
      size: 175000,
      description: "New users in first 90 days",
    },
    metrics: {
      engagementRate: {
        value: 51.2,
        lift: 22.8,
        pValue: 0.001,
        ci: [48.5, 53.9],
        stdDev: 2.7,
      },
      engagedPopulation: {
        value: 89600,
        lift: 24.1,
        pValue: 0.001,
        ci: [86000, 93200],
        stdDev: 3600,
      },
      behavioralChange: {
        value: 28.9,
        lift: 20.4,
        pValue: 0.002,
        ci: [26.1, 31.7],
        stdDev: 2.8,
      },
      costPerChange: {
        value: 44.75,
        lift: -8.2,
        pValue: 0.004,
        ci: [41.2, 48.3],
        stdDev: 3.5,
      },
      financialImpact: {
        value: 6200000,
        lift: 25.5,
        pValue: 0.001,
        ci: [5400000, 7000000],
        stdDev: 800000,
      },
      totalImpact: {
        value: 7800000,
        lift: 27.2,
        pValue: 0.001,
        ci: [6800000, 8800000],
        stdDev: 1000000,
      },
    },
    priorVersions: [
      {
        version: "1.0",
        timeInMarket: "Jul 2023 - Sep 2023",
        changes: "Initial social proof implementation",
        metrics: {
          engagementRate: { value: 41.8 },
          totalImpact: { value: 4900000 },
          costPerChange: { value: 48.75 },
        },
      },
    ],
  },
  {
    id: 7,
    version: "v2.3",
    timeInMarket: "Nov 2023 - Present",
    deprecated: false,
    intervention: "Micro-goals progression system",
    description: "Users with moderate to high health risk scores",
    behaviorLevers: [
      "Milestone tracking",
      "Progressive challenges",
      "Achievement unlocks",
    ],
    fundamentalAssumptions: [
      "Small wins build momentum",
      "Progressive difficulty maintains engagement",
    ],
    population: {
      size: 225000,
      description: "Users with moderate to high health risk scores",
    },
    metrics: {
      engagementRate: {
        value: 59.8,
        lift: 28.5,
        pValue: 0.001,
        ci: [56.9, 62.7],
        stdDev: 2.9,
      },
      engagedPopulation: {
        value: 134550,
        lift: 29.8,
        pValue: 0.001,
        ci: [130000, 139000],
        stdDev: 4500,
      },
      behavioralChange: {
        value: 35.2,
        lift: 27.3,
        pValue: 0.001,
        ci: [32.4, 38.0],
        stdDev: 2.8,
      },
      costPerChange: {
        value: 38.2,
        lift: -13.6,
        pValue: 0.002,
        ci: [35.1, 41.3],
        stdDev: 3.1,
      },
      clinicalImpact: {
        value: 21.3,
        lift: 19.8,
        pValue: 0.002,
        ci: [18.6, 24.0],
        stdDev: 2.7,
      },
      financialImpact: {
        value: 8900000,
        lift: 32.8,
        pValue: 0.001,
        ci: [7800000, 10000000],
        stdDev: 1100000,
      },
      totalImpact: {
        value: 11200000,
        lift: 34.5,
        pValue: 0.001,
        ci: [9800000, 12600000],
        stdDev: 1400000,
      },
    },
    priorVersions: [
      {
        version: "2.2",
        timeInMarket: "Aug 2023 - Oct 2023",
        changes: "Enhanced progression algorithm",
        metrics: {
          engagementRate: { value: 52.4 },
          totalImpact: { value: 6700000 },
          costPerChange: { value: 44.2 },
        },
      },
    ],
  },
  {
    id: 8,
    version: "v1.8",
    timeInMarket: "Sep 2023 - Present",
    deprecated: false,
    intervention: "Behavioral economics choice architecture",
    description: "High-cost medical condition population",
    behaviorLevers: [
      "Default option optimization",
      "Choice framing",
      "Decision simplification",
    ],
    fundamentalAssumptions: [
      "Choice architecture influences decisions",
      "Simplified decisions improve follow-through",
    ],
    population: {
      size: 150000,
      description: "High-cost medical condition population",
    },
    metrics: {
      engagementRate: {
        value: 54.5,
        lift: 23.9,
        pValue: 0.001,
        ci: [51.8, 57.2],
        stdDev: 2.7,
      },
      engagedPopulation: {
        value: 81750,
        lift: 25.2,
        pValue: 0.001,
        ci: [78000, 85500],
        stdDev: 3750,
      },
      behavioralChange: {
        value: 31.8,
        lift: 24.7,
        pValue: 0.001,
        ci: [29.0, 34.6],
        stdDev: 2.8,
      },
      costPerChange: {
        value: 41.3,
        lift: -11.2,
        pValue: 0.003,
        ci: [38.2, 44.4],
        stdDev: 3.1,
      },
      clinicalImpact: {
        value: 19.7,
        lift: 17.5,
        pValue: 0.002,
        ci: [17.1, 22.3],
        stdDev: 2.6,
      },
      financialImpact: {
        value: 7100000,
        lift: 29.1,
        pValue: 0.001,
        ci: [6200000, 8000000],
        stdDev: 900000,
      },
      totalImpact: {
        value: 8900000,
        lift: 31.2,
        pValue: 0.001,
        ci: [7700000, 10100000],
        stdDev: 1200000,
      },
    },
    priorVersions: [
      {
        version: "1.7",
        timeInMarket: "Jun 2023 - Aug 2023",
        changes: "Refined choice architecture",
        metrics: {
          engagementRate: { value: 47.2 },
          totalImpact: { value: 5500000 },
          costPerChange: { value: 46.5 },
        },
      },
    ],
  },
];
const dd = CampaignDashboard(campaignData);
```

```js
view(dd);
```
