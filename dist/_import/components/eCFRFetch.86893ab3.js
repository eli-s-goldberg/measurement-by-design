// eCFRFetch.js

const title = 42
const date = "2020-04-01"
const apiUrl = `https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title}.xml`
const cacheKey = `ecfrData-${title}-${date}12dd`

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ECFRDatabase", 1)

    request.onerror = (event) => {
      reject(`Database error: ${event.target.errorCode}`)
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      db.createObjectStore("ECFRData", { keyPath: "cacheKey" })
    }
  })
}

function getFromIndexedDB(db, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["ECFRData"], "readonly")
    const objectStore = transaction.objectStore("ECFRData")
    const request = objectStore.get(key)

    request.onerror = (event) => {
      reject(`Transaction error: ${event.target.errorCode}`)
    }

    request.onsuccess = (event) => {
      resolve(event.target.result ? event.target.result.data : null)
    }
  })
}

function saveToIndexedDB(db, key, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["ECFRData"], "readwrite")
    const objectStore = transaction.objectStore("ECFRData")
    const request = objectStore.put({ cacheKey: key, data: data })

    request.onerror = (event) => {
      reject(`Transaction error: ${event.target.errorCode}`)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

export async function fetchECFRData() {
  try {
    const db = await openDatabase()

    // Check if data is already in cache
    const cachedData = await getFromIndexedDB(db, cacheKey)
    if (cachedData) {
      console.log("Using cached data")
      return cachedData
    }

    // If not in cache, fetch the data from the API
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const xmlText = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, "application/xml")

    // Extract title, chapters, subchapters, parts, and sections
    const data = []

    const titleNode = xmlDoc.querySelector("DIV1")
    if (!titleNode) {
      throw new Error("Title node not found")
    }
    const titleName = titleNode.getAttribute("N")
    const titleFullName =
      titleNode.querySelector("HEAD")?.textContent.trim() ||
      `Title ${titleName}`

    const chapters = Array.from(xmlDoc.querySelectorAll("DIV3")).map(
      (chapter) => {
        const chapterName = chapter.getAttribute("N")
        const chapterFullName =
          chapter.querySelector("HEAD")?.textContent.trim() ||
          `Chapter ${chapterName}`

        const subchapters = Array.from(chapter.querySelectorAll("DIV4")).map(
          (subchapter) => {
            const subchapterName = subchapter.getAttribute("N")
            const subchapterFullName =
              subchapter.querySelector("HEAD")?.textContent.trim() ||
              `Subchapter ${subchapterName}`

            const parts = Array.from(subchapter.querySelectorAll("DIV5")).map(
              (part) => {
                const partName = part.getAttribute("N")
                const partFullName =
                  part.querySelector("HEAD")?.textContent.trim() ||
                  `Part ${partName}`

                const sections = Array.from(part.querySelectorAll("DIV8")).map(
                  (section) => {
                    const sectionNumber = section.getAttribute("N")
                    const sectionTitle = section
                      .querySelector("HEAD")
                      ?.textContent.trim()
                    const paragraphs = Array.from(
                      section.querySelectorAll("P")
                    ).map((p) => {
                      const indentLevel = getIndentLevel(p)
                      return `<p class="indented level-${indentLevel}">${p.innerHTML.trim()}</p>`
                    })
                    return { sectionNumber, sectionTitle, paragraphs }
                  }
                )

                return { partName, partFullName, sections }
              }
            )

            return { subchapterName, subchapterFullName, parts }
          }
        )

        return { chapterName, chapterFullName, subchapters }
      }
    )

    data.push({ titleName, titleFullName, chapters })

    // Save the fetched data to cache
    await saveToIndexedDB(db, cacheKey, data)

    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

function getIndentLevel(paragraph) {
  const text = paragraph.textContent.trim()

  // Define regular expressions for different indentation levels
  const patterns = [
    { regex: /^[ivx]+\)/i, level: 3 }, // Roman numerals (i), (ii), (iii), etc.
    { regex: /^[a-z]\)/i, level: 2 }, // Letters (a), (b), (c), etc.
    { regex: /^[0-9]+\)/, level: 1 }, // Numbers (1), (2), (3), etc.
  ]

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      return pattern.level
    }
  }

  return 0
}

export function createCollapsibleElement(data) {
  const createNode = (name, children) => {
    const container = document.createElement("div")
    container.style.marginLeft = "20px"

    const header = document.createElement("div")
    header.className = "header"
    header.innerHTML = `<span class="arrow">↬</span> ${name}`
    header.style.cursor = "pointer"
    header.style.fontWeight = "bold"

    const content = document.createElement("div")
    content.className = "content"
    content.style.display = "none"

    header.addEventListener("click", () => {
      const arrow = header.querySelector(".arrow")
      if (content.style.display === "none") {
        content.style.display = "block"
        arrow.textContent = "▼"
      } else {
        content.style.display = "none"
        arrow.textContent = "↬"
      }
    })

    container.appendChild(header)
    container.appendChild(content)

    if (children && children.length > 0) {
      children.forEach((child) => content.appendChild(child))
    }

    return container
  }

  const createSectionNode = (section) => {
    const contentContainer = document.createElement("div")
    const paragraphs = (section.paragraphs || []).map((p) => {
      const paragraph = document.createElement("div")
      paragraph.innerHTML = p
      return paragraph
    })
    paragraphs.forEach((p) => contentContainer.appendChild(p))

    return createNode(`${section.sectionNumber} - ${section.sectionTitle}`, [
      contentContainer,
    ])
  }

  const createPartNode = (part) => {
    const children = part.sections.map(createSectionNode)
    return createNode(`${part.partName} - ${part.partFullName}`, children)
  }

  const createSubchapterNode = (subchapter) => {
    const children = subchapter.parts.map(createPartNode)
    return createNode(
      `${subchapter.subchapterName} - ${subchapter.subchapterFullName}`,
      children
    )
  }

  const createChapterNode = (chapter) => {
    const children = chapter.subchapters.map(createSubchapterNode)
    return createNode(
      `${chapter.chapterName} - ${chapter.chapterFullName}`,
      children
    )
  }

  const createTitleNode = (title) => {
    const children = title.chapters.map(createChapterNode)
    return createNode(`${title.titleName} - ${title.titleFullName}`, children)
  }

  const root = document.createElement("div")
  data.forEach((title) => root.appendChild(createTitleNode(title)))
  return root
}

export async function searchSections(keyword) {
  try {
    const db = await openDatabase()
    const cachedData = await getFromIndexedDB(db, cacheKey)

    if (!cachedData) {
      console.log("No cached data found.")
      return []
    }

    const results = []
    const regex = new RegExp(`(${keyword})`, "gi")
    cachedData.forEach((title) => {
      title.chapters.forEach((chapter) => {
        chapter.subchapters.forEach((subchapter) => {
          subchapter.parts.forEach((part) => {
            part.sections.forEach((section) => {
              const paragraphs = section.paragraphs.map((p) =>
                p.replace(regex, "<mark>$1</mark>")
              )
              const containsKeyword = paragraphs.some((p) =>
                p.includes("<mark>")
              )
              if (containsKeyword) {
                results.push({ ...section, paragraphs })
              }
            })
          })
        })
      })
    })

    return results
  } catch (error) {
    console.error(error)
    return []
  }
}

export function displaySearchResults(sections) {
  const resultContainer = document.getElementById("search-results")
  resultContainer.innerHTML = "" // Clear previous results

  if (sections.length === 0) {
    resultContainer.innerHTML = "<p>No results found.</p>"
    return
  }

  const list = document.createElement("ul")

  sections.forEach((section) => {
    const listItem = document.createElement("li")
    listItem.innerHTML = `${section.sectionNumber} - ${section.sectionTitle}`
    listItem.style.cursor = "pointer"
    listItem.addEventListener("click", () =>
      toggleSectionDetails(section, listItem)
    )
    list.appendChild(listItem)
  })

  resultContainer.appendChild(list)
}

function toggleSectionDetails(section, listItem) {
  const existingDetail = listItem.querySelector(".highlighted-section")

  if (existingDetail) {
    // If details are already shown, remove them
    listItem.removeChild(existingDetail)
  } else {
    // If details are not shown, create and append them
    const detailContainer = document.createElement("div")
    detailContainer.className = "highlighted-section" // Add the highlighted-section class

    const sectionHeader = document.createElement("div")
    sectionHeader.textContent = `${section.sectionNumber} - ${section.sectionTitle}`
    sectionHeader.style.fontWeight = "bold"

    const sectionContent = document.createElement("div")
    section.paragraphs.forEach((p) => {
      const paragraph = document.createElement("div")
      paragraph.innerHTML = p
      sectionContent.appendChild(paragraph)
    })

    detailContainer.appendChild(sectionHeader)
    detailContainer.appendChild(sectionContent)
    listItem.appendChild(detailContainer)
  }
}
