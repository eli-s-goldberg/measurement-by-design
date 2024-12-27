// styles.js

export const pwcStyle = `
 /* Sidebar Styles */
  #observablehq-sidebar {
    --observablehq-sidebar-padding-left: calc(max(0rem, (100vw - var(--observablehq-max-width)) / 2));
    position: fixed;
    background: black;
    color: white;
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

  #observablehq-sidebar > ol:first-child::before {
    background: #2b2b2b;
  }

  #observablehq-sidebar summary {
    font-weight: 700;
    color: white;
    background: black;
    cursor: default;
  }

  #observablehq-sidebar details summary {
    background: black;
  }

  #observablehq-sidebar details summary:hover {
    background: #D93954;
  }

  /* Link Styles */
  .observablehq-link a:hover {
    background: #FFB600;
  }

  .observablehq-link-active a {
    background: black;
  }

  .observablehq-link-active::before {
    background: #e64646;
  }

  .observablehq-link-active a {
    color: #ffffff;
    background: black;
  }

  .observablehq-link:not(.observablehq-link-active) a[href]:not(:hover) {
    color: #cccccc;
  }

  /* Search Styles */
  #observablehq-search input {
    background-color: #3d3d3d;
    color: #ffffff;
  }

  #observablehq-search input::placeholder {
    color: #808080;
  }

  /* General Sidebar Styles */
  #observablehq-sidebar > ol,
  #observablehq-sidebar > details,
  #observablehq-sidebar > section {
    border-bottom-color: #404040;
  }

  /* Page Title Styles */
  .page-title {
    font-family: "ITC Charter Com", serif;
    font-weight: 400;
    font-size: 40px;
    line-height: 52px;
    letter-spacing: -0.03em;
  }
  .table-header-style {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    font-size: 18px;
    line-height: 24.42px;
  }

  .page-title-header {
    font: 18px/1.5 "Helvetica Neue", Arial, sans-serif;
    margin: 0;
    max-width: 100%;
    letter-spacing: -0.03em;
    margin-bottom: 100px; 
  }

  /* Card Styles */
  .card {
    background-color: white; 
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
  }

  .card-yellow {
    background-color: #ffb600;
    color: #111827;
  }

  .card-white {
    background-color: #ffffff;
  }

  .card-gray {
    background-color: #ffffff;
  }

  /* Text Styles */
  .text-header {
    font: 13px/1.5 "Helvetica Neue", Arial, sans-serif;
    line-height: 1rem;
    font-weight: 600;
    color: #000000;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .text-title {
    font: 52px/1.5 "ITC Charter Com", serif;
    line-height: 2rem;
    color: #111827;
    margin-bottom: 0.5rem;
    letter-spacing: 0.02em;
  }

  .text-subtext {
    font: 15.4px/1.5 "Helvetica Neue", Arial, sans-serif;
    line-height: 1.25rem;
    color: #000000;
    font-weight: 600;
    margin-top: 1rem;
  }

  .text-subheader {
    font-family: 'Georgia', serif;
    font-weight: 400;
    font-size: 38px;
    line-height: 43.18px;
    letter-spacing: -3%;
    margin-bottom: 1em;
}
    .text-subheader-pullquote {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 400;
    font-size: 24px;
    line-height: 31px;
}

.text-subheader-pullquote-highlight {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    font-size: 24px;
    line-height: 31px;
    background-color: #ffb600; /* Adds the background */
    color: black; /* Ensures text color contrasts well */
}

  /* Grid Layout */
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .grid-vertical-stack {
    display: grid;
    grid-template-rows: auto auto; /* Two rows */
    gap: 1.5rem; /* Spacing between cards */
    width: 100%; /* Full width */
    padding: 1rem; /* Padding for the stack */
}

.grid-card {
    background-color: #ffb600; /* Card background color */
    border-radius: 10px; /* Rounded corners */
    padding: 1.5rem; /* Inner padding */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Shadow for a clean look */
    display: flex;
    flex-direction: column; /* Stack content vertically */
    gap: 0.5rem; /* Spacing between content */
}

.grid-title {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    font-size: 16px;
    margin: 0;
    text-transform: uppercase;
}

.divider {
    width: 40px;
    border: 1px solid black;
    margin: 0.5rem 0;
}

.grid-value {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    font-size: 32px;
    margin: 0;
}

.grid-subtitle {
    font-family: 'Helvetica Neue', serif;
    font-weight: 400;
    font-size: 18px;
    margin: 0;
}

.grid-description {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 400;
    font-size: 14px;
    margin: 0;
    color: #333; /* Slightly darker text for readability */
}

  .pull-quote-grid-card {
    display: grid;
    grid-template-columns: 2fr 1fr; /* Left side 2/3, Right side 1/3 */
    grid-template-rows: auto auto; /* Two rows */
    gap: 10px; /* Spacing between items */
    width: 100%; /* Adjust width as needed */
    background-color: #F2F2F2; /* Background for the card */
    padding: 10px; /* Add padding */
}

.pull-quote-grid-item {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #F2F2F2;
    border: 0px solid black;
    font-weight: bold;
}

.pull-quote-item-a {
    grid-column: 1; /* First column */
    grid-row: 1; /* First row */
    height: 100%; /* Adjust height as needed */
}

.pull-quote-item-b {
    grid-column: 2; /* Second column */
    grid-row: 1 / span 2; /* Spans two rows */
    height: 100%; /* Combined height of A and C */
}

.pull-quote-item-c {
    grid-column: 1; /* First column */
    grid-row: 2; /* Second row */
    height: 100%; /* Adjust height as needed */
}


  /* Global Styles */
  html {
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: white;
    color: var(--theme-foreground);
  }

  body {
    max-width: var(--observablehq-max-width);
    margin: auto;
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  /* Full Width Div */
  .full-width-div {
    /* Span the entire viewport width */
    width: 80vw;
    /* Position relative to allow offset */
    position: relative;
    /* Offset the div to the left by 50% of the viewport width */
    left: 50%;
    /* Shift the div back by 50% of its own width */
    transform: translateX(-50%);
    /* Light gray background */
    background-color: #d3d3d3; /* You can also use 'lightgray' */
    /* Padding before the text starts */
    padding: 0px; /* Adjust as needed */
    /* Optional: Add box-sizing for consistent sizing */
    box-sizing: border-box;
    /* Optional: Remove any margins */
    margin: 10px;
  }

  /* Table Styles */
  table {
    background-color: white;
    width: 100%;
    border-collapse: collapse;
    font: 13px/1.2 var(--serif);
    font-family: "ITC Charter Com", serif;
    letter-spacing: -0.03em;
  }

  th {
    color: black;
    background-color: white;
    letter-spacing: -0.03em;
  }

  td {
    color: var(--theme-foreground-alt);
    vertical-align: top;
  }

  /* Full Width Section */
  .full-width-section {
    position: relative;
    background-color: transparent; /* No background on the main div */
    padding: 1.5rem 0; /* Vertical padding */
  }

  .full-width-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 100vw;
    height: 100%;
    background-color: #F2F2F2;
    transform: translateX(-50%);
    z-index: -1;
  }

  .full-width-section .content-container {
    max-width: var(--observablehq-max-width);
    margin: 0 auto;
    padding: 0 0rem;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    .full-width-section .content-container {
      padding: 0 1rem;
    }
  }
`;

export const defaultStyles = `

  .variable {
    background-color: #f0f0f0; /* Light gray shade */
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    display: inline-block;
    margin: 2px 0;o
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
    font: 13.5px/1.5 var(--serif);
    margin: 0;
    max-width: 95%;
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
    background-color: #f9f9f9;
  }

  figcaption {
    margin-top: 10px;
    font-size: 0.85em;
    color: black;
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
  .table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
}


  table {
    border-collapse: collapse;
    table-layout: auto;
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
