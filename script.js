function download() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tab = tabs[0] // There will be only one tab
    chrome.tabs.sendMessage(tab.id, {actionType: "download"})
  })
}

document.getElementById("download").addEventListener("click", download)
