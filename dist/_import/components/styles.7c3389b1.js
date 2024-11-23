// styles.js

export const defaultStyles = `
  body {
    font: 13.5px/1.5 var(--serif);
    margin: 0;
    max-width: 90%;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two equal columns */
    gap: 10px; /* Space between the columns */
    max-width: 1000px;
    margin: 0 auto;
  }

  .body-grid {
    padding: 10px;
    margin: 0;
    font-family: Arial, sans-serif;
    font-size: 0.9em;
    line-height: 1.5;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    height: 20%;
    font: 13.5px/1.5 var(--serif);
  }

  th {
    font: 13.5px/1.5 var(--serif);
    font-weight: bold;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }

  tr:last-child td {
    border-bottom: 1px solid black;
  }

  td, th {
    text-align: left;
    border-collapse: collapse;
    padding: 2px;
    font-size: 0.8em;
  }

  .horizontal-line {
    border-top: 0.5px solid #d3d3d3;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .katex { font-size: 1em; }

  p { max-width: 90%; }

  /* Style for code blocks */
  pre code {
    background-color: #f5f5f5;
    padding: 10px;
    display: block;
    overflow-x: auto;
    border-radius: 5px;
  }

  /* Style for inline code */
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.8em;
  }

  /* Ensure images are the same width as text (90%) */
  img {
    max-width: 90%;
    height: auto;
    display: block;
    margin: 10px 0;
  }

  .quote-box {
    border-left: 4px solid #4CAF50;
    background-color: #f9f9f9;
    padding: 10px 20px;
    margin: 20px 0;
    font-family: "Georgia", serif;
    font-style: italic;
    color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .quote-text {
    font-size: 1em;
    margin: 0;
    line-height: 1.5;
  }

  .quote-author {
    text-align: right;
    font-size: 1em;
    margin-top: 10px;
    color: #555;
  }

  .bibliography {
    margin-top: 20px;
    font-family: "Arial", sans-serif;
    font-size: 0.9em;
    color: #333;
  }

  .bibliography p {
    margin: 5px 0;
  }

  .figure-container {
    padding: 15px;
  }

  figure {
    margin: 0;
    padding: 0;
  }

  figcaption {
    margin-top: 10px;
    font-size: 0.85em;
    color: #555;
    font-family: 'Arial', sans-serif;
    line-height: 1.4;
  }
`;