---
toc: true
title: Intervention Demo
---
<!-- ```js
// import some CSS to keep things well styled
import { defaultStyles } from "./components/styles.js"
const styleElement = html`<style>${defaultStyles}</style>`;
document.head.appendChild(styleElement);

``` -->

```js
import { styles } from "./components/collapsible.js"
const styleElement = html`<style>${styles}</style>`;
document.head.appendChild(styleElement);
```



```js
// Create the HTML elements
const collapsible = html`
<div>
  ${styles}
  <button class="collapsible">Click to Learn More</button>
  <div class="content">
    <h3>Example Content</h3>
    <p>This is the collapsible content. You can put any HTML content here.</p>
    <pre><code>
    // Example code
    function greeting() {
        console.log("Hello, Observable!");
    }
    </code></pre>
  </div>
</div>
`;

// Add the click handler using Observable's approach
collapsible.querySelector('.collapsible').addEventListener('click', function() {
  this.classList.toggle('active');
  const content = this.nextElementSibling;
  content.classList.toggle('show');
});

// Return the element to display it
view(collapsible);
```



## Describe the 'bet'

## Value Landscape

## Evidence to support effect sizes

## 