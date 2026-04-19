chrome.storage.sync.get("redirectUrl", ({ redirectUrl }) => {
  if (redirectUrl) {
    window.location.replace(redirectUrl);
  } else {
    document.getElementById("setup").hidden = false;
    document.getElementById("options-link").addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
});
