export class BusinessModelBuilder {
  constructor(tableData, html) {
    if (!tableData || !html) {
      throw new Error('TableData and html are required');
    }
    this.tableData = tableData;
    this.html = html;
    this.sections = [];
  }

  getParameterInfo(parameter) {
    const entry = this.tableData.find((row) => row.Parameter === parameter);
    return entry ? { value: parseFloat(entry.Value), unit: entry.Units } : { value: 0, unit: "" };
  }

  formatNumber(value) {
    if (value >= 1000 && value < 100000) {
      return `${(value / 1000).toFixed(0)}K`;
    } else if (value >= 100000 && value < 1000000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return value.toLocaleString();
  }

  buildBox(boxData) {
    const { label, value, unit = "", highlighted = false } = boxData;
    return this.html`
      <div class="box ${highlighted ? 'pink-box' : 'gray-box'}">
        <div class="box-label">${label}</div>
        <div class="box-value">${this.formatNumber(value)}${unit}</div>
      </div>
    `;
  }

  buildOperator(operator) {
    return this.html`<div class="operator">${operator}</div>`;
  }

  buildFormulaRow(formula) {
    const { result, components, operators } = formula;
    const elements = [];
    
    // Add result box
    elements.push(this.buildBox(result));
    
    // Add equals sign
    elements.push(this.buildOperator("="));
    
    // Add components with operators
    components.forEach((comp, idx) => {
      elements.push(this.buildBox(comp));
      if (idx < operators.length) {
        elements.push(this.buildOperator(operators[idx]));
      }
    });

    return this.html`<div class="formula-row">${elements}</div>`;
  }

  buildFormulaSection(section) {
    const { formulas } = section;
    const topRow = formulas.filter(f => f.topRow);
    const gridRows = formulas.filter(f => !f.topRow)
      .sort((a, b) => {
        if (!a.gridPosition || !b.gridPosition) return 0;
        const [aRow, aCol] = a.gridPosition;
        const [bRow, bCol] = b.gridPosition;
        return aRow - bRow || aCol - bCol;
      });

    return this.html`
      <div class="formula-table">
        ${topRow.map(formula => this.buildFormulaRow(formula))}
        <div class="formula-grid">
          ${gridRows.map(formula => this.buildFormulaRow(formula))}
        </div>
      </div>
    `;
  }

  addFormulaSection({ title, formulas }) {
    this.sections.push({
      type: 'formula',
      title,
      formulas
    });
    return this;
  }

  buildParametersGrid(parameters) {
    return this.html`
      <div class="parameters-grid">
        ${parameters.map(param => {
          const info = this.getParameterInfo(param.parameter);
          return this.buildBox({
            label: param.label,
            value: info.value,
            unit: info.unit,
            highlighted: false
          });
        })}
      </div>
    `;
  }

  addParametersSection({ title, parameters }) {
    this.sections.push({
      type: 'parameters',
      title,
      parameters
    });
    return this;
  }

  build() {
    return this.html`
      <div class="diagram">
        ${this.sections.map(section => this.html`
          <div class="section">
            <div class="section-title">${section.title}</div>
            ${section.type === 'formula' 
              ? this.buildFormulaSection(section)
              : this.buildParametersGrid(section.parameters)}
          </div>
        `)}
      </div>
    `;
  }
}