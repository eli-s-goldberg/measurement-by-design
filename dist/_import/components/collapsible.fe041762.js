// collapsible.js

export const styles = `
  .collapsible {
    background-color: #f8f9fa;
    color: #212529;
    cursor: pointer;
    padding: 18px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 16px;
    transition: 0.3s;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    position: relative;
  }

  .collapsible:after {
    content: '+';
    position: absolute;
    right: 18px;
    color: #666;
    font-weight: bold;
  }

  .collapsible.active:after {
    content: '-';
  }

  .collapsible:hover {
    background-color: #e9ecef;
  }

  .content {
    display: none;
    padding: 18px;
    background-color: white;
    border-radius: 0 0 6px 6px;
    border: 1px solid #dee2e6;
    margin-bottom: 15px;
  }

  .content.show {
    display: block;
  }
`;
