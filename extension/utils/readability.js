function extractMainContent() {
  const articleSelectors = [
    "article",
    '[role="main"]',
    "main",
    ".post-content",
    ".article-content",
    "#content",
    ".entry-content",
  ];

  let mainElement = null;
  for (const selector of articleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.length > 500) {
      mainElement = el;
      break;
    }
  }

  if (!mainElement) {
    const bodies = document.querySelectorAll("div, section");
    let maxText = 0;
    bodies.forEach((div) => {
      const textLen = div.innerText.trim().length;
      if (textLen > maxText) {
        maxText = textLen;
        mainElement = div;
      }
    });
  }

  if (!mainElement) return document.body.innerText;

  const clone = mainElement.cloneNode(true);

  const junkSelectors = [
    "script",
    "style",
    "nav",
    "footer",
    "aside",
    "header",
    ".ads",
    ".comments",
    ".sidebar",
  ];
  junkSelectors.forEach((s) => {
    clone.querySelectorAll(s).forEach((el) => el.remove());
  });

  return clone.innerText.trim();
}

window.extractMainContent = extractMainContent;
