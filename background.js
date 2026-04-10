const tabData = {};

function ensureTab(tabId) {
  if (!tabData[tabId]) {
    tabData[tabId] = { stripe: {}, amazon: {} };
  }
  return tabData[tabId];
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_DATA") {
    sendResponse({ data: tabData[msg.tabId] || null });
    return true;
  }

  const tabId = sender.tab?.id;
  if (!tabId) return;
  const store = ensureTab(tabId);

  if (msg.type === "STRIPE_DATA") {
    store.stripe = { ...store.stripe, ...msg.payload };
    chrome.action.setBadgeText({ text: "!", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#e31837", tabId });
  }

  if (msg.type === "AMAZON_DATA") {
    store.amazon = { ...store.amazon, ...msg.payload };
    chrome.action.setBadgeText({ text: "!", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#ff9900", tabId });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => { delete tabData[tabId]; });