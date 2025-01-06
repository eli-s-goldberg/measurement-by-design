import { html } from "htl";

export function InteractiveImagingExplorer(content = {}) {
  const container = html`<div></div>`;

  function render() {
    container.innerHTML = "";
    container.appendChild(html`
      <style>
        .explorer-container {
          font: 13.5px/1.5 var(--serif);
          max-width: 95%;
          margin: 2rem auto;
        }

        .explorer-content {
          padding: 0rem;
          border: 0px solid #e5e7eb;
          border-radius: 0.75rem;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tab {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font: 13.5px/1.5 var(--serif);
          transition: all 0.2s;
        }

        .tab.active {
          background: #115e59;
          color: white;
        }

        .category-grid {
          display: grid;
          gap: 1rem;
        }

        .category-card {
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .category-header {
          padding: 1rem;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font: 13.5px/1.5 var(--serif);
        }

        .category-header h3 {
          margin: 0;
          font-weight: bold;
        }

        .category-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
          font: 13.5px/1.5 var(--serif);
        }

        .category-content.expanded {
          max-height: 1000px;
          padding: 1rem;
        }

        .category-image {
          width: 100%;
          height: auto;
          aspect-ratio: 4/3;
          object-fit: cover;
          border-radius: 4px;
          margin: 0;
        }

        .image-container {
          order: 2;
          margin: 0;
        }

        .content-wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          overflow: hidden;
        }
        .main-content {
          order: 1;
        }

        .subcategory {
          background: #f5f5f5;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-top: 0.5rem;
        }
        .subcategory-name {
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .cpt-code {
          font-family: monospace;
          background-color: #f0f0f0;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.9em;
        }

        .preferred-info {
          padding: 1.5rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          display: none;
          font: 13.5px/1.5 var(--serif);
        }

        .preferred-info.visible {
          display: block;
        }

        .preferred-info h3 {
          margin: 1rem 0 0.5rem 0;
          font-weight: bold;
        }

        .preferred-info p {
          margin: 0.5rem 0;
        }
      </style>

      <div class="explorer-container">
        <div class="explorer-content">
          <div class="tabs">
            <button class="tab active" data-tab="categories">
              Imaging Categories
            </button>
            <button class="tab" data-tab="preferred">
              Preferred vs Non-Preferred
            </button>
          </div>

          <div id="categories-content" class="category-grid">
            <!-- Categories will be dynamically inserted -->
          </div>

          <div id="preferred-content" class="preferred-info">
            <div>
              <h4>Preferred Imaging</h4>
              <p>
                Imaging services provided at
                <strong>in-network facilities</strong> offer significant
                cost-sharing benefits for patients. These facilities are part of
                the insurance provider's network, ensuring lower out-of-pocket
                expenses and streamlined billing processes.
              </p>

              <h4>Non-Preferred Imaging</h4>
              <p>
                Imaging services conducted at
                <strong>out-of-network providers</strong> generally lead to
                higher out-of-pocket costs. These providers are not contracted
                with the insurance company, often resulting in increased
                financial responsibility for the patient, such as higher
                deductibles or non-covered charges.
              </p>
              <p>
                <strong>Note:</strong> Emergency imaging services may fall under
                special conditions, where the cost-sharing rules for in-network
                services may apply, regardless of the provider's network status.
                Always consult your insurance plan for specific details.
              </p>
            </div>
          </div>
        </div>
      </div>
    `);

    const categories = {
      "X-Ray (Radiographic Imaging)": {
        description:
          "Standard radiographic imaging using X-ray radiation for basic diagnostic imaging",
        imagePlaceholder: "https://medlineplus.gov/images/Xray_share.jpg",
        altText: "X-Ray imaging example showing bone structure",
        subcategories: [
          { name: "Chest X-Rays", codes: "71010-71048" },
          { name: "Abdomen X-Rays", codes: "74000-74020" },
          { name: "Extremities X-Rays", codes: "73000-73140" },
          { name: "Spine and Pelvis X-Rays", codes: "72020-72220" },
        ],
      },
      "Computed Tomography (CT)": {
        description:
          "Advanced 3D imaging using multiple X-ray images processed by computer",
        imagePlaceholder:
          "https://www.health.com/thmb/YS4wUCB92en5gnvigWN98_ZgFMI=/5121x0/filters:no_upscale():max_bytes(150000):strip_icc()/ctscan-GettyImages-493216325-63c244b9138f460f8529ecf076166864.jpg",
        altText: "CT scan showing detailed cross-sectional view",
        subcategories: [
          { name: "Head/Brain CT", codes: "70450-70470" },
          { name: "Chest CT", codes: "71250-71275" },
          { name: "Abdomen and Pelvis CT", codes: "74150-74178" },
          { name: "Extremities CT", codes: "73200-73202, 73700-73702" },
        ],
      },
      "Magnetic Resonance Imaging (MRI)": {
        description:
          "High-detail imaging using magnetic fields and radio waves",
        imagePlaceholder:
          "https://www.purdue.edu/hhs/mri/images/Brain_Knee.jpg",
        altText: "MRI scan showing detailed soft tissue image",
        subcategories: [
          { name: "Head/Brain MRI", codes: "70551-70559" },
          { name: "Spinal MRI", codes: "72141-72158" },
          { name: "Joint MRI", codes: "73221-73225, 73721-73725" },
          { name: "Chest and Abdomen MRI", codes: "71550-71552, 74181-74183" },
        ],
      },
      Ultrasound: {
        description: "Real-time imaging using high-frequency sound waves",
        imagePlaceholder:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGmkj4t0jRljniyzV5s2aDEXZC5MlCyRC0Tw&s",
        altText: "Ultrasound image showing internal organ structure",
        subcategories: [
          { name: "Abdomen Ultrasound", codes: "76700-76705" },
          { name: "Obstetric Ultrasound", codes: "76801-76828" },
          { name: "Vascular Ultrasound", codes: "93880-93990" },
          { name: "Breast Ultrasound", codes: "76641-76642" },
        ],
      },
      "Nuclear Medicine": {
        description:
          "Imaging using radioactive tracers to visualize organ function",
        imagePlaceholder: "https://media.sciencephoto.com/image/c0584831/225",
        altText: "Nuclear medicine scan showing metabolic activity",
        subcategories: [
          { name: "PET Scans", codes: "78451-78499, 78811-78816" },
          { name: "Bone Scans", codes: "78300-78399" },
          { name: "Thyroid Scans", codes: "78000-78099" },
        ],
      },
      Mammography: {
        description: "Specialized X-ray imaging of breast tissue",
        imagePlaceholder:
          "https://dims.apnews.com/dims4/default/bf42ab4/2147483647/strip/true/crop/2000x1169+0+0/resize/599x350!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2Fc2%2Fb2%2F81d7ac03a8c4163fa12f38614967%2Faa94f2896b3342548d0dd0a272e974ec",
        altText: "Mammogram showing breast tissue detail",
        subcategories: [
          { name: "Screening Mammograms", codes: "77065-77067" },
          { name: "Diagnostic Mammograms", codes: "77065-77066" },
        ],
      },
      Fluoroscopy: {
        description: "Real-time X-ray imaging for dynamic studies",
        imagePlaceholder:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhD76pRrk-QnS_XR9KXZlzUDCypvtAb9CAWw&s",
        altText:
          "Fluoroscopy showing real-time movement of internal structures",
        subcategories: [
          { name: "Dynamic Fluoroscopy", codes: "76000-76001" },
          { name: "Contrast Studies", codes: "74210-74250" },
        ],
      },
      "Interventional Radiology": {
        description: "Image-guided minimally invasive procedures",
        imagePlaceholder:
          "https://www.philips.com/c-dam/corporate/newscenter/global/standard/resources/healthcare/2024/lumiguide/case-4-pic-5rt-790x468.jpg",
        altText:
          "Interventional radiology procedure showing catheter placement",
        subcategories: [
          { name: "Angiography", codes: "75600-75774" },
          { name: "Catheter Placement with Imaging", codes: "75801-75894" },
        ],
      },
    };

    const categoryGrid = container.querySelector(".category-grid");

    // Create category cards
    Object.entries(categories).forEach(([name, info]) => {
      const card = document.createElement("div");
      card.className = "category-card";
      card.innerHTML = `
        <div class="category-header">
          <h3>${name}</h3>
          <span>▸</span>
        </div>
        <div class="category-content">
          <div class="content-wrapper">
            <div class="main-content">
              <p>${info.description}</p>
              ${info.subcategories
                .map(
                  (sub) => `
                <div class="subcategory">
                  <div class="subcategory-name">${sub.name}</div>
                  <div class="cpt-code">CPT: ${sub.codes}</div>
                </div>
              `
                )
                .join("")}
            </div>
            <div class="image-container">
              <img 
                src="${info.imagePlaceholder}" 
                alt="${info.altText}"
                class="category-image"
              />
            </div>
          </div>
        </div>
      `;
      categoryGrid.appendChild(card);
    });

    // Add event listeners
    container.querySelectorAll(".category-header").forEach((header) => {
      header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        const arrow = header.querySelector("span");
        content.classList.toggle("expanded");
        arrow.style.transform = content.classList.contains("expanded")
          ? "rotate(90deg)"
          : "rotate(0deg)";
      });
    });

    container.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        container
          .querySelectorAll(".tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const isCategories = tab.dataset.tab === "categories";
        container.querySelector("#categories-content").style.display =
          isCategories ? "grid" : "none";
        container.querySelector("#preferred-content").style.display =
          isCategories ? "none" : "block";
      });
    });
  }

  render();
  return container;
}
