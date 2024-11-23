import * as Plot from "../../_npm/@observablehq/plot@0.6.15/_esm.js"
import { html, render } from "../../_node/lit-html@3.1.4/index.js"

const chordData = {
  C: [
    { string: "A", fret: 3 },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: null },
  ],
  C7: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: null },
  ],
  Cm: [
    { string: "A", fret: 3 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: null },
  ],
  Cm7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Cdim: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Caug: [
    { string: "A", fret: 3 },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: 1 },
  ],
  C6: [
    { string: "A", fret: null },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: null },
  ],
  Cmaj7: [
    { string: "A", fret: 2 },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: null },
  ],
  C9: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Db: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  Db7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  Dbm: [
    { string: "A", fret: 3 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  Dbm7: [
    { string: "A", fret: 4 },
    { string: "E", fret: 4 },
    { string: "C", fret: 4 },
    { string: "G", fret: 4 },
  ],
  Dbdim: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Dbaug: [
    { string: "A", fret: null },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  Db6: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  Dbmaj7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  Db9: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  D: [
    { string: "A", fret: 5 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  D7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Dm: [
    { string: "A", fret: null },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Dm7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Ddim: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  Daug: [
    { string: "A", fret: 1 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 3 },
  ],
  D6: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Dmaj7: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  D9: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 4 },
    { string: "G", fret: 2 },
  ],
  Eb: [
    { string: "A", fret: 1 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Eb7: [
    { string: "A", fret: 4 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Ebm: [
    { string: "A", fret: 1 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Ebm7: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Ebdim: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Ebaug: [
    { string: "A", fret: 4 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  Eb6: [
    { string: "A", fret: 3 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Ebmaj7: [
    { string: "A", fret: null },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Eb9: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  E: [
    { string: "A", fret: 2 },
    { string: "E", fret: 4 },
    { string: "C", fret: 4 },
    { string: "G", fret: 4 },
  ],
  E7: [
    { string: "A", fret: 2 },
    { string: "E", fret: null },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  Em: [
    { string: "A", fret: 2 },
    { string: "E", fret: 3 },
    { string: "C", fret: 4 },
    { string: "G", fret: null },
  ],
  Em7: [
    { string: "A", fret: 2 },
    { string: "E", fret: null },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Edim: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Eaug: [
    { string: "A", fret: 3 },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: 1 },
  ],
  E6: [
    { string: "A", fret: null },
    { string: "E", fret: 2 },
    { string: "C", fret: null },
    { string: "G", fret: 1 },
  ],
  Emaj7: [
    { string: "A", fret: 2 },
    { string: "E", fret: null },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  E9: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  F: [
    { string: "A", fret: null },
    { string: "E", fret: 1 },
    { string: "C", fret: null },
    { string: "G", fret: 2 },
  ],
  F7: [
    { string: "A", fret: null },
    { string: "E", fret: 1 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Fm: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: null },
    { string: "G", fret: 1 },
  ],
  Fm7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  Fdim: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  Faug: [
    { string: "A", fret: null },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  F6: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Fmaj7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 4 },
    { string: "G", fret: 2 },
  ],
  F9: [
    { string: "A", fret: 3 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Gb: [
    { string: "A", fret: 1 },
    { string: "E", fret: 2 },
    { string: "C", fret: 1 },
    { string: "G", fret: 3 },
  ],
  Gb7: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 4 },
    { string: "G", fret: 3 },
  ],
  Gbm: [
    { string: "A", fret: null },
    { string: "E", fret: 2 },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  Gbm7: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 4 },
    { string: "G", fret: 2 },
  ],
  Gbdim: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Gbaug: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 4 },
  ],
  Gb6: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  Gbmaj7: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Gb9: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  G: [
    { string: "A", fret: 2 },
    { string: "E", fret: 3 },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  G7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Gm: [
    { string: "A", fret: 1 },
    { string: "E", fret: 3 },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Gm7: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Gdim: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Gaug: [
    { string: "A", fret: 2 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 4 },
  ],
  G6: [
    { string: "A", fret: 2 },
    { string: "E", fret: null },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Gmaj7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  G9: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Ab: [
    { string: "A", fret: null },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  Ab7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  Abm: [
    { string: "A", fret: 2 },
    { string: "E", fret: 4 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  Abm7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: null },
  ],
  Abdim: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  Abaug: [
    { string: "A", fret: 3 },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: 1 },
  ],
  Ab6: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  Abmaj7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  Ab9: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  A: [
    { string: "A", fret: null },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  A7: [
    { string: "A", fret: null },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Am: [
    { string: "A", fret: null },
    { string: "E", fret: null },
    { string: "C", fret: null },
    { string: "G", fret: 2 },
  ],
  Am7: [
    { string: "A", fret: 3 },
    { string: "E", fret: 3 },
    { string: "C", fret: 4 },
    { string: "G", fret: null },
  ],
  Adim: [
    { string: "A", fret: 3 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Aaug: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 2 },
  ],
  A6: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 4 },
    { string: "G", fret: 2 },
  ],
  Amaj7: [
    { string: "A", fret: null },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  A9: [
    { string: "A", fret: 2 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Bb: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 3 },
  ],
  Bb7: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  Bbm: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 3 },
  ],
  Bbm7: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 1 },
    { string: "G", fret: 1 },
  ],
  Bbdim: [
    { string: "A", fret: 1 },
    { string: "E", fret: null },
    { string: "C", fret: 1 },
    { string: "G", fret: null },
  ],
  Bbaug: [
    { string: "A", fret: 1 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 3 },
  ],
  Bb6: [
    { string: "A", fret: 1 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: null },
  ],
  Bbmaj7: [
    { string: "A", fret: null },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 3 },
  ],
  Bb9: [
    { string: "A", fret: 3 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  B: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 4 },
  ],
  B7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
  Bm: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 4 },
  ],
  Bm7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 2 },
    { string: "G", fret: 2 },
  ],
  Bdim: [
    { string: "A", fret: 2 },
    { string: "E", fret: 1 },
    { string: "C", fret: 2 },
    { string: "G", fret: 1 },
  ],
  Baug: [
    { string: "A", fret: 2 },
    { string: "E", fret: 3 },
    { string: "C", fret: 3 },
    { string: "G", fret: 4 },
  ],
  B6: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 1 },
  ],
  Bmaj7: [
    { string: "A", fret: 2 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 3 },
  ],
  B9: [
    { string: "A", fret: 4 },
    { string: "E", fret: 2 },
    { string: "C", fret: 3 },
    { string: "G", fret: 2 },
  ],
}

// Function to get chord data by name
function chordmap(chord) {
  return chordData[chord] || []
}

// Function to create the chord plot

export const strings = ["A", "E", "C", "G"]
export const frets = Array.from({ length: 5 }, (_, i) => i)
export function ukuchord(chord) {
  const chordData = chordmap(chord).map((position) => ({
    ...position,
    fret: position.fret === null ? position.fret : position.fret - 0.5,
  }))
  return Plot.plot({
    subtitle: chord,
    // marginTop: 20,
    // marginLeft: 20,
    height: 140,
    width: 100,
    x: {
      domain: ["G", "C", "E", "A"],
      label: "",
      axis: "top",
    },
    y: {
      domain: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
      ticks: [0, 1, 2, 3, 4, 5],
      label: "",
      axis: null,
    },
    marks: [
      Plot.frame(),
      Plot.ruleY([0], { stroke: "red", strokeWidth: 3 }),
      Plot.ruleX(["A", "E", "C", "G"]), // Horizontal lines for strings
      Plot.ruleY([0, 1, 2, 3, 4, 5]), // Vertical lines for frets
      Plot.dot(chordData, { y: "fret", x: "string", r: 4, fill: "black" }), // Plot chord positions
    ],
  })
}

// Function to parse lyrics and extract chords
export function parseLyrics(lyrics) {
  const lines = lyrics.split("\n")
  const parsedLines = lines.map((line) => {
    const regex = /<<([^>>]+)>>/g
    let match
    const parts = []
    let lastIndex = 0
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: line.substring(lastIndex, match.index),
          chord: null,
        })
      }
      parts.push({ text: match[0], chord: match[1] })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < line.length) {
      parts.push({ text: line.substring(lastIndex), chord: null })
    }
    return parts
  })
  return parsedLines
}
