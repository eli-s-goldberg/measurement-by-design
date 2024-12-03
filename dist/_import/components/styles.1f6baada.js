// styles.js

export const defaultStyles = `

  .variable {
    background-color: #f0f0f0; /* Light gray shade */
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    display: inline-block;
    margin: 2px 0;
  }

  :root {
    --observablehq-max-width: 100%;
}
#observablehq-sidebar {
--observablehq-max-width
    --observablehq-sidebar-padding-left: calc(max(0rem,(100vw - var(--observablehq-max-width)) / 2)); 
    position: fixed;
    background: var(--theme-background-alt);
    color: var(--theme-foreground-muted);
    font: 14px var(--sans-serif);
    visibility: hidden;
    font-weight: 500;
    width: calc(272px + var(--observablehq-sidebar-padding-left));
    z-index: 3;
    top: 0;
    bottom: 0;
    left: -272px;
    box-sizing: border-box;
    padding: 0 0.5rem 1rem calc(var(--observablehq-sidebar-padding-left) + 0.5rem);
    overflow-y: auto;
}
  body {
    font: 15px/1.5 var(--serif);
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    max-width: 93%;
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
    margin: 0px;
    padding: 10px;
    max-width: 100%;
  }

  figcaption {
    margin-top: 10px;
    font-size: 0.85em;
    color: #555;
    font-family: 'Arial', sans-serif;
    line-height: 1.4;
  }

  .note {
    max-width: 90%;
    margin: 0 auto; /* Centers the element */
    padding: 10px; /* Optional: Add padding for spacing */
    background-color: #f9f9f9; /* Optional: Set a background color */
    border: 1px solid #ddd; /* Optional: Add a subtle border */
    border-radius: 4px; /* Optional: Round the corners */
    font-family: Arial, sans-serif; /* Match the body font */
    line-height: 1.5; /* Match the body line height */
}
`;

export const interventionStyles = `
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


  .section {
    margin: 16px 0;
  }
  
  .section-title {
    font: 15px/1.5 var(--serif);
    color: #333;
    margin-bottom: 16px;
    font-weight: bold;
  }

  .collapsible {
      cursor: pointer;
      padding: 10px;
      border: none;
      outline: none;
      background-color: #f1f1f1;
      text-align: left;
      font-size: 16px;
      font-weight: bold;
    }

    .collapsible.active {
      background-color: #ddd;
    }

    .content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
      background-color: #f9f9f9;
      padding: 0 10px;
    }

    .content p {
      margin: 10px 0;
    }

  .formula-table {
    display: grid;
    grid-template-columns: 80px 1fr 80px 1fr 80px 1fr 80px;
    width: fit-content;
    column-gap: 8px;
    row-gap: 12px;
    margin-bottom: 8px;
    font: 14px/1.5 var(--serif);
  }
  
  .box {
    width: 100%;
    min-height: 52px;
    padding: 8px 4px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    font-family: var(--serif);
  }
  
  .box-label {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 3px;
    line-height: 1.2;
  }

  .box-value {
    font-size: 13px;
    line-height: 1.2;
  }
  
  .pink-box {
    background: #ffdbdb;
  }
  
  .gray-box {
    background: #d3d3d3;
  }
  
  .operator {
    font: 14px/1.5 var(--serif);
    font-weight: bold;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    background: transparent;
    width: 16px;
    margin: 0 auto;
  }
  
  .parameters-grid {
    display: grid;
    grid-template-columns: repeat(4, 80px);
    gap: 12px;
    margin-top: 16px;
    font: 14px/1.5 var(--serif);
  }


  /* ... media queries adjusted for new box structure ... */
  
  @media (max-width: 480px) {
    .formula-table {
      grid-template-columns: 70px 1fr 70px 1fr 70px 1fr 70px;
      column-gap: 6px;
      row-gap: 8px;
    }
    
    .box {
      min-height: 46px;
      padding: 6px 2px;
    }
    
    .box-label {
      font-size: 13px;
    }

    .box-value {
      font-size: 12px;
    }
    
    .operator {
      font-size: 13px;
      width: 12px;
    }
    
    .parameters-grid {
      grid-template-columns: repeat(4, 70px);
      gap: 8px;
    }
  }

  @media (max-width: 400px) {
    .formula-table {
      grid-template-columns: 60px 1fr 60px 1fr 60px 1fr 60px;
      column-gap: 4px;
    }
    
    .parameters-grid {
      grid-template-columns: repeat(4, 60px);
    }
    
    .box {
      min-height: 40px;
    }
    
    .box-label {
      font-size: 12px;
    }

    .box-value {
      font-size: 11px;
    }
  }
`;

export const genericInterventionStyle = `
  /* Core Layout Styles */
  .diagram {
    font: 13.5px/1.5 var(--serif);
    margin: 0;
    padding: 16px;
  }

  .section {
    margin: 16px 0;
  }
  
  .section-title {
    font: 15px/1.5 var(--serif);
    color: #333;
    margin-bottom: 16px;
    font-weight: bold;
  }

  /* Formula Table Layout */
  .formula-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .top-formula {
    display: grid;
    grid-template-columns: 80px 30px repeat(6, 80px 30px);
    align-items: center;
    gap: 8px;
  }

  .formula-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .formula-row {
    display: grid;
    grid-template-columns: 80px 30px repeat(6, 80px 30px);
    align-items: center;
    gap: 8px;
  }

  /* Box Styles */
  .box {
    width: 100%;
    min-height: 52px;
    padding: 8px 4px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    font-family: var(--serif);
  }
  
  .box-label {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 3px;
    line-height: 1.2;
    text-align: center;
  }

  .box-value {
    font-size: 13px;
    line-height: 1.2;
    text-align: center;
  }
  
  .pink-box {
    background: #ffdbdb;
  }
  
  .gray-box {
    background: #d3d3d3;
  }

  .empty-box {
    background: transparent;
  }
  
  /* Operator Styles */
  .operator {
    font: 14px/1.5 var(--serif);
    font-weight: bold;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    background: transparent;
    width: 16px;
    margin: 0 auto;
  }
  
  /* Parameters Grid */
  .parameters-grid {
    display: grid;
    grid-template-columns: repeat(4, 80px);
    gap: 12px;
    margin-top: 16px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .formula-row,
    .top-formula {
      grid-template-columns: 70px 25px repeat(6, 70px 25px);
      gap: 6px;
    }
    
    .box {
      min-height: 46px;
      padding: 6px 2px;
    }
    
    .box-label {
      font-size: 13px;
    }

    .box-value {
      font-size: 12px;
    }
    
    .operator {
      font-size: 13px;
      width: 12px;
    }
    
    .parameters-grid {
      grid-template-columns: repeat(4, 70px);
      gap: 8px;
    }
  }

  @media (max-width: 480px) {
    .formula-row,
    .top-formula {
      grid-template-columns: 60px 20px repeat(6, 60px 20px);
      gap: 4px;
    }
    
    .box {
      min-height: 40px;
    }
    
    .box-label {
      font-size: 12px;
    }

    .box-value {
      font-size: 11px;
    }

    .parameters-grid {
      grid-template-columns: repeat(4, 60px);
      gap: 6px;
    }
  }
`;