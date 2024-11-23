// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "Measurement By Design",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Introduction",
      path: "/index",
    },
  
    {
      name: "Demo",
      pages: [
        {
          name: "Intervention Demo",
          path: "/random-forest",
        },
      ],
    },
    {
      name: "Working Folder",
      pages: [
        {
          name: "BRFSS State Level Mapping",
          path: "/state-level-mapping",
        },
        {
          name: "Experimental Design Figures",
          path: "/exp-design-figures",
        },
        {
          name: "Live Table",
          path: "/live-table-data",
        },
        {
          name: "Distribution Demo",
          path: "/distp-demo",
        },
        {
          name: "Funnel Chart",
          path: "/funnel-chart",
        },
        {
          name: "Intervention Design",
          path: "/intervention-design",
        },
      ],
    },
   
  ],

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // root: "docs", // path to the source root for preview
  // output: "dist", // path to the output root for build
  // search: true, // activate search
};
