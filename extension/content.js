chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_CONTENT") {
    try {
      const content = extractMainContent();
      sendResponse({
        success: true,
        content: content,
        title: document.title,
        url: window.location.href,
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

function extractMainContent() {
  const articleSelectors = [
    "article",
    "main",
    ".post-content",
    ".article-body",
    "#main-content",
  ];
  let target = null;

  for (const selector of articleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.length > 300) {
      target = el;
      break;
    }
  }

  if (!target) target = document.body;

  const clone = target.cloneNode(true);
  const junk = [
    "nav",
    "footer",
    "script",
    "style",
    "aside",
    ".ads",
    ".social-share",
  ];
  junk.forEach((j) => clone.querySelectorAll(j).forEach((el) => el.remove()));

  return clone.innerText.replace(/\s+/g, " ").trim();
}
