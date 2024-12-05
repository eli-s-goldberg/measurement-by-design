/**
 * This is modified from https://observablehq.com/@linard-y/table-input
 * to work with the Observable framework. It requires 'html' to be imported 
 * as a dependency.
 * 
*/

// Common styling for input elements
const inputStyle = `
  width: 100%;
  margin: 0;
  padding: 1px 2px;
  border: none;
  border-radius: 2px;
  font: 13px var(--serif);
  background: none;
  outline: none;
`;

// Common styling for select elements
const selectStyle = `
  width: 100%;
  margin: 0;
  padding: 1px 2px;
  border: none;
  border-radius: 2px;
  font: 13px var(--serif);
  background: none;
  outline: none;
`;

// Exported event names used in the component
export const EVENTS = {
  DATA_UPDATE: 'dataUpdate',
  VALUE_CHANGE: 'valueChange',
  ROW_ADD: 'rowAdd',
  ROW_REMOVE: 'rowRemove'
};

/**
 * Helper functions for creating table input column definitions
 */
export const TableInputTypes = {
  /**
   * Creates an integer input column
   * @param {Object} options - Configuration options for the integer column
   * @returns {Object} Column definition for integer input
   */
  integer({ width, key, label, min = null, max = null, defaultValue = '' }) {
    return {
      width,
      key,
      label,
      // Function that returns an input element for this column
      inputType: (d, h) => h`<input type="number" 
        min="${min !== null ? min : ''}" 
        max="${max !== null ? max : ''}" 
        step="1" 
        value="${d || defaultValue}"
        onchange="this.value = Math.floor(this.value)"
        style="${inputStyle}">`
    };
  },

  /**
   * Creates a float (decimal number) input column
   * @param {Object} options - Configuration options for the float column
   * @returns {Object} Column definition for float input
   */
  float({ 
    width, 
    key, 
    label, 
    min = null, 
    max = null, 
    step = 0.1, 
    defaultValue = '',
    parser = null
  }) {
    const defaultParser = (value) => {
      if (value === null || value === undefined) return '';
      const strValue = value.toString();
      const num = parseFloat(strValue);
      if (isNaN(num)) return '';
      return num.toFixed(2);
    };
  
    // Use the provided parser if available, otherwise use default
    const parseValue = parser || defaultParser;
  
    return {
      width,
      key,
      label,
      parser: parseValue,  // Store the chosen parser
      inputType: (d, h) => h`<input type="number" 
        min="${min !== null ? min : ''}" 
        max="${max !== null ? max : ''}" 
        step="${step}" 
        value="${parseValue(d || defaultValue)}"  // Use the chosen parser here
        style="${inputStyle}">`
    };
  },


  /**
   * Creates a dropdown select input column
   * @param {Object} options - Configuration options for the dropdown column
   * @returns {Object} Column definition for dropdown input
   */
  dropdown({ width, key, label, options, defaultValue = '' }) {
    return {
      width,
      key,
      label,
      inputType: (d, h) => {
        const selectedValue = d || defaultValue;
        const selectEl = h`<select style="${selectStyle}">
          ${options.map(opt => h`<option value="${opt.value}">${opt.label}</option>`)}
        </select>`;
        selectEl.value = selectedValue;
        return selectEl;
      }
    };
  },

  /**
   * Creates a text input column (e.g., for text or JSON input)
   * @param {Object} options - Configuration options for the text column
   * @returns {Object} Column definition for text input
   */
  text({ width, key, label, placeholder = '', defaultValue = '', parser = null }) {
    return {
      width,
      key,
      label,
      parser, // Add the parser function here
      inputType: (d, h) => h`<input type="text" 
        value="${d || defaultValue}" 
        placeholder="${placeholder}"
        style="${inputStyle}">`
    };
  },

  /**
   * Creates a function input column
   * @param {Object} options - Configuration options for the function column
   * @returns {Object} Column definition for function input
   */
  function({ width, key, label, validator = null }) {
    return {
      width,
      key,
      label,
      inputType: (d, h) => h`<input type="text" 
        value="${d || ''}" 
        placeholder="Enter function name"
        onchange="${e => validator ? validator(e.target.value) : null}"
        style="${inputStyle} font-family: monospace;">`
    };
  },

  /**
   * Creates a percentage input column (values between 0 and 100)
   * @param {Object} options - Configuration options for the percentage column
   * @returns {Object} Column definition for percentage input
   */
  percentage({ width, key, label, defaultValue = '0' }) {
    return {
      width,
      key,
      label,
      inputType: (d, h) => h`<input type="number" 
        min="0" 
        max="100" 
        step="0.1" 
        value="${d || defaultValue}"
        style="${inputStyle}">`
    };
  }
};

/**
 * TableInput class represents an editable table component
 */
export class TableInput {
  /**
   * Constructs a new TableInput instance
   * @param {Function} html - The 'html' function for rendering
   * @param {Object} options - Configuration options for the table
   */
  constructor(html, {
    width = "100%",
    headerStyle = {
      fontSize: "1.1em",
      fontFamily: "var(--serif)",
      padding: "8px",
      textAlign: "center",
      fontWeight: "normal"
    },
    columns = [],
    defaultValues = {},
    value = [],
    title = "",
    description = "",
    actions = { add: false, remove: false }
  }) {
    this.html = html;
    this.width = width;
    this.headerStyle = headerStyle;
    this.columns = columns;
    this.defaultValues = defaultValues;
    this.title = title;
    this.description = description;
    this.actions = actions;
    this._values = [...value]; // Internal storage of table data
    this.actionException = []; // Rows where actions are disabled
    this.disabledException = []; // Inputs that are disabled
    this.listeners = new Map(); // Event listeners
  }

  // Getter for values that returns a safe copy
  get values() {
    return [...this._values];
  }

  // Setter for values that updates internal state and notifies listeners
  set values(newValues) {
    this._values = [...newValues];
    this.notifyListeners();
  }

  /**
   * Adds an event listener for a specific event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function to execute
   * @returns {Function} Function to remove the event listener
   */
  addEventListener(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
    // Initial call for new listeners
    if (eventName === EVENTS.DATA_UPDATE) {
      callback({
        detail: {
          raw: this.getData(),
          parsed: this.getParsedData(),
          summary: this.getSummary()
        }
      });
    }
    // Return a function to remove the listener
    return () => this.removeEventListener(eventName, callback);
  }

  /**
   * Removes an event listener for a specific event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(eventName, callback) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Notifies all listeners of a specific event
   * @param {string} eventName - Name of the event
   */
  notifyListeners(eventName = EVENTS.DATA_UPDATE) {
    const detail = {
      raw: this.getData(),
      parsed: this.getParsedData(),
      summary: this.getSummary()
    };
    
    // Notify listeners registered for this event
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => callback({ detail }));
    }
    
    // Always notify data update listeners unless already notified
    if (eventName !== EVENTS.DATA_UPDATE) {
      const dataUpdateListeners = this.listeners.get(EVENTS.DATA_UPDATE);
      if (dataUpdateListeners) {
        dataUpdateListeners.forEach(callback => callback({ detail }));
      }
    }
  }

  /**
   * Gets the current raw data from the table
   * @returns {Array} Array of row data
   */
  getData() {
    return this.values;
  }

  /**
   * Gets the parsed data from the table, converting strings to proper types
   * @returns {Array} Array of parsed row data
   */
  getParsedData() {
    return this._values.map(row => {
      const parsed = {};
      for (const col of this.columns) {
        const key = col.key;
        const value = row[key];
        if (col.parser) {
          parsed[key] = col.parser(value);
        } else if (!isNaN(value) && value !== '') {
          parsed[key] = value.includes('.') ? parseFloat(value) : parseInt(value);
        } else {
          parsed[key] = value;
        }
      }
      return parsed;
    });
  }

  /**
   * Gets summary statistics from the parsed data
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const parsedData = this.getParsedData();
    return {
      totalRows: parsedData.length,
      columnSummaries: this.columns.reduce((acc, col) => {
        const values = parsedData.map(row => row[col.key]);
        const numericValues = values.filter(v => typeof v === 'number');
        acc[col.key] = {
          distinct: new Set(values).size,
          ...(numericValues.length ? {
            sum: numericValues.reduce((a, b) => a + b, 0),
            average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
          } : {})
        };
        return acc;
      }, {})
    };
  }

  /**
   * Exports the table data to a CSV string
   * @returns {string} CSV formatted string
   */
  toCSV() {
    if (!this._values.length) return '';
    const headers = this.columns.map(col => col.key);
    const rows = [
      headers.join(','),
      ...this._values.map(row => 
        headers.map(key => JSON.stringify(row[key] ?? '')).join(',')
      )
    ];
    return rows.join('\n');
  }

  /**
   * Downloads the table data as a CSV file
   */
  downloadCSV() {
    const csvContent = this.toCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.csv'; // Filename for the download
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Creates the display elements for summary and data
   * @returns {HTMLElement} Container with displays
   */
  createDisplays() {
    const summaryDisplay = this.html`<div id="summary-stats" class="stats-container"></div>`;
    const rawDataDisplay = this.html`<div id="raw-data" class="data-container"></div>`;
    const parsedDataDisplay = this.html`<div id="parsed-data" class="data-container"></div>`;
    
    const downloadButton = this.html`<button onclick=${() => this.downloadCSV()} style="margin: 10px 0; padding: 5px 10px;">Download CSV</button>`;

    return this.html`
      <div class="dashboard" style="margin-top: 20px;">
        ${summaryDisplay}
        ${downloadButton}
        <div class="data-displays" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          ${rawDataDisplay}
          ${parsedDataDisplay}
        </div>
      </div>
    `;
  }

  /**
   * Updates the displays with current data and summary
   */
  updateDisplays() {
    const data = {
      raw: this.getData(),
      parsed: this.getParsedData(),
      summary: this.getSummary()
    };

    // Update summary statistics display
    const summaryDisplay = document.getElementById('summary-stats');
    if (summaryDisplay) {
      summaryDisplay.innerHTML = '';
      summaryDisplay.appendChild(this.html`
        <div style="padding: 15px; background: #f5f5f5; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0;">Summary Statistics</h3>
          <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div class="stat-item" style="padding: 10px; background: white; border-radius: 4px;">
              <label style="font-weight: 500;">Total Sites:</label>
              <span>${data.summary.totalRows}</span>
            </div>
            <!-- Additional summary items can be added here -->
          </div>
        </div>
      `);
    }

    // Update raw data display
    const rawDataDisplay = document.getElementById('raw-data');
    if (rawDataDisplay) {
      rawDataDisplay.innerHTML = '';
      rawDataDisplay.appendChild(this.html`
        <div style="padding: 15px; background: #f5f5f5; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0;">Raw Data</h3>
          <pre style="margin: 0; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.raw, null, 2)}</pre>
        </div>
      `);
    }

    // Update parsed data display
    const parsedDataDisplay = document.getElementById('parsed-data');
    if (parsedDataDisplay) {
      parsedDataDisplay.innerHTML = '';
      parsedDataDisplay.appendChild(this.html`
        <div style="padding: 15px; background: #f5f5f5; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0;">Parsed Data</h3>
          <pre style="margin: 0; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.parsed, null, 2)}</pre>
        </div>
      `);
    }
  }

  /**
   * Renders the table input component
   * @returns {HTMLElement} The rendered table component
   */
  render() {
    const { html } = this;
    
    // **Add the isRendering flag**
    let isRendering = false;
    
    // Convert headerStyle object to CSS string
    const headerStyleString = Object.entries(this.headerStyle)
      .map(([key, value]) => `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${value}`)
      .join('; ');

    // Create container with form and displays
    const container = html`<div>
      <form>
        <table style="width:${this.width}; table-layout:fixed; border-collapse: collapse; font: 13px var(--serif);">
          <thead>
            <tr style="border-top: 0px solid black; border-bottom: 0px solid black;">
              <th style="width:5%; ${headerStyleString}"> </th>
              ${this.columns.map(c => html`<th style="width:${c.width}px; ${headerStyleString}">${c.label}</th>`)}
              ${this.actions.add || this.actions.remove ? html`<th style="width:5%; ${headerStyleString}"></th>` : ''}
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </form>
    </div>`;

    this._form = container.querySelector('form'); // Reference to the form element

    // Add title and description if provided
    if (this.title) {
      this._form.prepend(html`<div style="font: 15px/1.5 var(--serif); margin-bottom: 0px;">${this.title}</div>`);
    }
    if (this.description) {
      this._form.append(html`<div style="font: 10px/1.5 var(--serif); font-style: italic; margin-top: 3px;">${this.description}</div>`);
    }

    /**
     * Updates the table rows based on current data
     */
    const updateTable = () => {
      // **Set isRendering to true at the start**
      isRendering = true;

      const tbody = this._form.querySelector('tbody');
      tbody.innerHTML = ''; // Clear existing rows

      // Add button in header if 'add' action is enabled
      if (this.actions.add) {
        const addCell = this._form.querySelector('thead tr').lastElementChild;
        if (addCell) {
          addCell.innerHTML = '';
          const addButton = html`<button name="addButton" style="margin: 4px -4px; font: 10px/1.5 var(--serif);">+</button>`;
          addButton.onclick = (e) => {
            e.preventDefault();
            // Add a new row with default values
            this._values = [...this._values, { ...this.defaultValues }];
            this.notifyListeners(); // Notify listeners of data change
            updateTable(); // Update the table to reflect the new row
          };
          addCell.appendChild(addButton);
        }
      }

      // If there are no rows, show an empty row
      if (this._values.length === 0) {
        const emptyRow = html`<tr style="border-bottom: 0px dashed lightgray;">
          <td></td>
          ${this.columns.map(() => html`<td></td>`)}
          ${this.actions.add || this.actions.remove ? html`<td></td>` : ''}
        </tr>`;
        tbody.appendChild(emptyRow);
      } else {
        // Render each row of data
        this._values.forEach((rowData, i) => {
          const row = html`<tr data-row-index="${i}" style="border-bottom: 1px solid #eee;">
            <td style="text-align:left; padding: -4px 6px; color: #666;">
              <div style="font-size: 11px">${i + 1}</div>
            </td>
            ${this.columns.map((c) => {
              const inputElement = c.inputType(rowData[c.key], html);
              return html`<td style="padding: 3px 6px;">${inputElement}</td>`;
            })}
            ${this.actions.remove ? html`<td style="padding: 3px 6px;">
              ${this.actionException.includes(i) ? '' : html`<button onclick=${(e) => {
                e.preventDefault();
                // Remove the row at index i
                this._values = this._values.filter((_, idx) => idx !== i);
                this.notifyListeners(); // Notify listeners of data change
                updateTable(); // Update the table to reflect the removal
              }} style="font: 13px var(--sans-serif); border: none; background: none; color: #666; cursor: pointer;">&times;</button>`}
            </td>` : ''}
          </tr>`;
          tbody.appendChild(row);
        });
      }
      this.updateDisplays(); // Update the displays with new data

      // **Set isRendering to false at the end**
      isRendering = false;
    };

    updateTable(); // Initial table rendering

    // **Event listener for input changes in the form**
    this._form.addEventListener('input', e => {
      // **Prevent updating values during rendering**
      if (isRendering) return;

      const tbody = this._form.querySelector('tbody');
      // Update internal data based on input values
      this._values = Array.from(tbody.querySelectorAll('tr')).map(row => {
        const rowValue = {};
        this.columns.forEach((c, idx) => {
          const cell = row.children[idx + 1];
          if (cell) {
            const inputElement = cell.querySelector('input, select');
            if (inputElement) {
              rowValue[c.key] = inputElement.value;
            }
          }
        });
        return rowValue;
      });
      
      this.notifyListeners(EVENTS.VALUE_CHANGE); // Notify listeners of value change
      this._form.value = this._values; // Update form value
    });

    // Prevent form submission
    this._form.onsubmit = e => e?.preventDefault();

    // Optionally prevent Enter key from submitting the form
    this._form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
    
    return container;  // Return the container instead of the form
  }
}

/**
 * Default function to update statistics in the stats container
 * @param {Object} data - Data object containing raw, parsed, and summary data
 * @param {HTMLElement} container - Container where stats should be displayed
 * @param {Function} html - The 'html' function for rendering
 */
function defaultUpdateStats(data, container, html) {
  const { parsed, summary } = data;
  
  // Example calculation: total cost based on 'totalNumber' and 'averageCost' fields
  const totalCost = parsed.reduce((sum, row) => 
    sum + (parseFloat(row.totalNumber) * parseFloat(row.averageCost)), 0);

  container.innerHTML = ''; // Clear existing content
  container.appendChild(html`
    <div class="stats-summary" style="margin-top: 20px; padding: 10px; background: #f5f5f5;">
      <h3 style="margin: 0 0 10px 0;">Summary Statistics</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <div>Total Sites: ${summary.totalRows}</div>
        <div>Total Cases: ${summary.columnSummaries.totalNumber?.sum?.toLocaleString() || 0}</div>
        <div>Total Cost: $${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
    </div>
  `);
}

/**
 * Factory function to create a live-updating table component
 * @param {Function} html - The 'html' function for rendering
 * @param {Object} options - Configuration options for the live table
 * @returns {HTMLElement} The live table component
 */
export function LiveTable(html, { 
  columns, 
  headerStyle = {}, 
  updateStats = defaultUpdateStats,
  initialData = [],
  defaultValues = {
    count: '',
    value: '',
    type: 'a',
    parameters: '{}'
  },
  title = "",
  description = "",
  width = "1200px"
} = {}) {
  const table = new TableInput(html, { 
    width,
    headerStyle: {
      fontSize: "13px",
      fontFamily: "var(--serif)",
      padding: "3px 6px",
      textAlign: "left",
      fontWeight: "600",
      color: "#333",
      borderBottom: "1px solid #ccc",
      ...headerStyle
    },
    columns,
    value: initialData,
    defaultValues,
    title,
    description,
    actions: { add: true, remove: true }
  });

  const container = html`<div>
    ${table.render()}
    <div class="stats-container"></div>
  </div>`;

  // Make the container itself represent the current data
  container.value = table.getData();

  // Data access methods
  container.getData = () => container.value;
  container.getParsedData = () => table.getParsedData();
  container.getSummary = () => table.getSummary();

  // Setup updates after the DOM is ready
  setTimeout(() => {
    const statsContainer = container.querySelector('.stats-container');
    
    const handleDataUpdate = () => {
      if (statsContainer && updateStats) {
        // Call the updateStats function to update the stats display
        updateStats({
          raw: table.getData(),
          parsed: table.getParsedData(),
          summary: table.getSummary()
        }, statsContainer, html);
      }
      container.value = table.getData(); // Update container's value
      container.dispatchEvent(new CustomEvent("input")); // Dispatch input event
    };

    // Initial update
    handleDataUpdate();

    // Update on any relevant event
    [EVENTS.DATA_UPDATE, EVENTS.VALUE_CHANGE, EVENTS.ROW_ADD, EVENTS.ROW_REMOVE].forEach(eventName => {
      table.addEventListener(eventName, handleDataUpdate);
    });
  }, 0);

  return container;
}

// Import Generators from Observable standard library
import {Generators} from "../../_observablehq/stdlib.95bfbf7e.js";

/**
 * Function to create a live data generator from a LiveTable component
 * @param {HTMLElement} table - The LiveTable component
 * @returns {Generator} A generator that yields the table data whenever it changes
 */
export function LiveTableData(table){
  const tableData = Generators.observe(notify => {
    const handleUpdate = () => notify(table.getParsedData()); // Use getParsedData()
    
    // Listen for all relevant events
    ['input', 'change'].forEach(event => {
      table.addEventListener(event, handleUpdate);
    });
    
    // Initial notification
    notify(table.getParsedData()); // Use getParsedData()
    
    // Cleanup
    return () => {
      ['input', 'change'].forEach(event => {
        table.removeEventListener(event, handleUpdate);
      });
    };
  });
  return tableData;
}
