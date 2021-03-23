let btnscrap = document.getElementById("btnscrap");

btnscrap.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab !== null) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      //function: ingresa,
      files: ["App/scrapProfile.js"],
    });
  }
});
