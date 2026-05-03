const API_URL = "http://localhost:3000/api/summarize";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SUMMARIZE_CONTENT") {
    handleSummarization(request.data, sendResponse);
    return true;
  }
});

async function handleSummarization(data, sendResponse) {
  try {
    const cacheKey = `summary_${data.url}`;
    const cached = await chrome.storage.local.get(cacheKey);

    if (cached[cacheKey]) {
      console.log("Returning cached summary");
      sendResponse({ success: true, data: cached[cacheKey] });
      return;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: data.content,
        url: data.url,
        title: data.title,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server error");
    }

    const summaryData = await response.json();

    await chrome.storage.local.set({ [cacheKey]: summaryData });

    sendResponse({ success: true, data: summaryData });
  } catch (error) {
    console.error("Background Error:", error);
    sendResponse({ success: false, error: error.message });
  }
}
