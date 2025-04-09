// styles.js

export const pwcStyle = `
 /* Sidebar Styles */
  #observablehq-sidebar {
    --observablehq-sidebar-padding-left: calc(max(0rem, (100vw - var(--observablehq-max-width)) / 2));
    position: fixed;
    background: black;
    color: white;
    font: 13px var(--sans-serif);
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
 
  /* First hierarchy text styles */
  #observablehq-sidebar summary {
    color: white;
    background: black;
    cursor: default;
  }



  #observablehq-sidebar details summary {
    background: black;
    font: 13px var(--sans-serif);
    
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

  .special-note {
    background-color: #f5f5f5;
    padding: 0px;
    border-radius: 4px;
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
    font-weight: 700;
    font-size: 40px;
    line-height: 48px;
    letter-spacing: -0.03em;
  }
  .page-sub-title {
    font-family: "ITC Charter Com", serif;
    font-weight: 600;
    font-size: 28px;
    letter-spacing: -0.03em;
    margin-bottom: 10px;
    line-height: 43.18px;
    letter-spacing: -3%;
  }
  .table-header-style {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 600;
    font-size: 18px;
    line-height: 24.42px;
    margin-bottom: 10px;
  }
    

  .table-body-style {
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.03em;
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
    padding: 0.5rem;
  }

  .card-gray {
    background-color: #F2F2F2;
  }

  /* Text Styles */
  .text-header {
    font: 12px/1.5 "Helvetica Neue", Arial, sans-serif;
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
}
  .text-subheader-2 {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 400;
    font-size: 35px;
    line-height: 43.18px;
    letter-spacing: -3%;
}
    .text-subheader-pullquote {
    font-family: 'Helvetica Neue';
    font-weight: 400;
    font-size: 18px;
    line-height: 28px;
    letter-spacing: -10%;
    margin-bottom: 10px;
}
  .text-subheader-pullquote-size-2 {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;;
    font-size: 18px;
    line-height: 31px;
}

.text-subheader-pullquote-highlight {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 500;
    font-size: 18px;
    line-height: 28px;
    letter-spacing: -10%;
    background-color: #ffb600;
    color: black; 
}

  /* Grid Layout */
  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: start;
}


  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .grid-vertical-stack {
    display: grid;
    grid-template-rows: auto auto; /* Two rows */
    gap: -.1rem; /* Spacing between cards */
    width: 100%; /* Full width */
    padding: 0.5rem; /* Padding for the stack */
}

.grid-card {
    background-color: #ffb600; /* Card background color */
    border-radius: 16px; /* Rounded corners */
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

.yellow-panel {
  background-color: #ffb600; /* Pale yellow */
  border-radius: 16px;       /* Rounded edges */
  padding: 1.5rem;            /* Spacing inside */
  display: flex;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Light shadow */
}


.horizontal-line {
    width: 1cm; /* Line length */
    height: 0; /* No height for the element itself */
    border-top: 1px solid black; /* Black line */
    margin: 0.25rem 0; /* Spacing above and below the line */
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
    font-size: 15px;
    margin: 0px;
    margin-top: 1.5em;
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
    left: 90%;
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

    .full-width-div-left {
    /* Span the entire viewport width */
    width: 80vw;
    /* Position relative to allow offset */
    position: relative;
    /* Offset the div to the left by 50% of the viewport width */
    left: 10%;
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
    background-color: black;
    letter-spacing: -0.03em;
  }

  td {
    color: black;
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

  @media (max-width: 1193px) {
    .full-width-section .content-container {
      padding: 0 0rem;
    }
  }

  /* Full Width Section Left */
.full-width-section-left {
  position: relative;
  background-color: transparent;
  padding: 1.5rem 0;
}

.full-width-section-left::before {
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

.full-width-section-left .content-container {
  max-width: var(--observablehq-max-width);
  margin: 0 auto;
  padding: 0 0rem;
  box-sizing: border-box;
}

@media (max-width: 1193px) {
  .full-width-section-left .content-container {
    padding: 0 0rem;
  }
}

/* Grid Layout for 20:80 ratio */
.full-width-section-left .layout-grid {
  display: grid;
  grid-template-columns: 40fr 60fr;
  gap: 20px;
  align-items: start;
}


/* Tabs */
.tabs {
  display: flex;
  gap: 16px; /* Reduced gap to bring tabs closer together */
  border-bottom: 1px solid #ddd;
  margin-bottom: -10px; /* Minimal space between tabs and content */
}

.tab {
  padding: 6px 0; /* Further reduced padding for compact design */
  color: #333;
  cursor: pointer;
  position: relative;
  text-transform: uppercase;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 31px;
  transition: font-weight 0.3s ease;
}

.tab.active {
  font-weight: 600; /* Slightly bolder for the active tab */
}

.tab.active::after {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ff6b6b;
  content: ''; /* Ensures underline for active tab */
}

.tab-content {
  display: none;
  padding: 4px 0; /* Minimal space between content and tabs */
}

.tab-content.active {
  display: block;
}

`;
