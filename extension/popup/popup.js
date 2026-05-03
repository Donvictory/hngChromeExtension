document.addEventListener("DOMContentLoaded", async () => {
  const elements = {
    pageTitle: document.getElementById("page-title"),
    summarizeBtn: document.getElementById("summarize-btn"),
    loadingState: document.getElementById("loading-state"),
    initialState: document.getElementById("initial-state"),
    summaryState: document.getElementById("summary-state"),
    errorState: document.getElementById("error-state"),
    overviewText: document.getElementById("overview-text"),
    insightsList: document.getElementById("insights-list"),
    readingTime: document.getElementById("reading-time"),
    copyBtn: document.getElementById("copy-btn"),
    resetBtn: document.getElementById("reset-btn"),
    retryBtn: document.getElementById("retry-btn"),
    themeToggle: document.getElementById("theme-toggle"),
  };

  const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  function updateThemeIcon() {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      (!document.documentElement.classList.contains("light") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    elements.themeToggle.innerHTML = isDark ? sunIcon : moonIcon;
  }

  // Initialize Theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.classList.add(savedTheme);
  }
  updateThemeIcon();

  elements.themeToggle.addEventListener("click", () => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      (!document.documentElement.classList.contains("light") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.remove("dark", "light");
    const newTheme = isDark ? "light" : "dark";
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon();
  });

  // Initialize: Get current tab info
  if (!chrome.tabs) {
    showError(
      "Extension API not found. Please load this via the Chrome Extensions menu.",
    );
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  elements.pageTitle.textContent = tab.title;

  const cacheKey = `summary_${tab.url}`;
  const cached = await chrome.storage.local.get(cacheKey);
  if (cached[cacheKey]) {
    showSummary(cached[cacheKey]);
  }

  elements.summarizeBtn.addEventListener("click", startSummarization);
  elements.retryBtn.addEventListener("click", startSummarization);
  elements.resetBtn.addEventListener("click", resetUI);
  elements.copyBtn.addEventListener("click", copySummary);

  async function startSummarization() {
    setState("loading");

    try {
      if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("edge://") ||
        tab.url.startsWith("about:")
      ) {
        throw new Error("Cannot summarize browser internal pages.");
      }

      let extraction;
      try {
        extraction = await chrome.tabs.sendMessage(tab.id, {
          action: "EXTRACT_CONTENT",
        });
      } catch (err) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          extraction = await chrome.tabs.sendMessage(tab.id, {
            action: "EXTRACT_CONTENT",
          });
        } catch (injectErr) {
          throw new Error(
            "Could not read page content. Please refresh the page and try again.",
          );
        }
      }

      if (!extraction || !extraction.success) {
        throw new Error(
          extraction?.error ||
            "Could not read page content. Make sure you are on a webpage and refresh the page.",
        );
      }

      const result = await chrome.runtime.sendMessage({
        action: "SUMMARIZE_CONTENT",
        data: {
          content: extraction.content,
          url: extraction.url,
          title: extraction.title,
        },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      showSummary(result.data);
    } catch (error) {
      showError(error.message);
    }
  }

  function showSummary(data) {
    elements.overviewText.textContent = data.overview;
    elements.readingTime.textContent = data.readingTime;

    elements.insightsList.innerHTML = "";
    data.keyInsights.forEach((insight) => {
      const li = document.createElement("li");
      li.textContent = insight;
      elements.insightsList.appendChild(li);
    });

    setState("summary");
  }

  function showError(msg) {
    const errorEl = document.querySelector(".error-message");
    errorEl.textContent = msg;
    setState("error");
  }

  function resetUI() {
    chrome.storage.local.remove(`summary_${tab.url}`);
    setState("initial");
  }

  function copySummary() {
    const text = `
Summary of ${tab.title}
Overview: ${elements.overviewText.textContent}
Key Insights:
${Array.from(elements.insightsList.querySelectorAll("li"))
  .map((li) => `- ${li.textContent}`)
  .join("\n")}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      elements.copyBtn.textContent = "Copied!";
      setTimeout(() => (elements.copyBtn.textContent = "Copy Summary"), 2000);
    });
  }

  function setState(state) {
    elements.initialState.classList.add("hidden");
    elements.loadingState.classList.add("hidden");
    elements.summaryState.classList.add("hidden");
    elements.errorState.classList.add("hidden");

    switch (state) {
      case "initial":
        elements.initialState.classList.remove("hidden");
        break;
      case "loading":
        elements.loadingState.classList.remove("hidden");
        break;
      case "summary":
        elements.summaryState.classList.remove("hidden");
        break;
      case "error":
        elements.errorState.classList.remove("hidden");
        break;
    }
  }
});
