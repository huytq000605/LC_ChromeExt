let s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function() {
    // this.remove();
};
(document.head || document.documentElement).appendChild(s);

const expectedEvents = 4

let eventListened = 0
let question = {}
let blob = null
let blobFileName = null

// 1. Get all question information
document.addEventListener('leetcode', function (e) {
  let data = e.detail;
  let queryType = data.queryType, resp = data.resp

  resp = JSON.parse(resp)
  resp = resp.data.question

  switch (queryType) {
    case "query questionTitle":
      question["id"] = resp.questionFrontendId
      question["title"] = resp.title
      question["difficulty"] = resp.difficulty
      break
    case "query questionContent":
      question["content"] = resp.content
      break
    case "query singleQuestionTopicTags":
      question["topics"] = resp.topicTags.map((e) => `-\t\`${e.name}\``)
      break
    case "query questionHints":
      question["hints"] = resp.hints
      break
    default:
      eventListened -= 1
      console.log("Unexpected query type")
  }

  eventListened += 1
  if (eventListened == expectedEvents) {
    document.dispatchEvent(new CustomEvent("genQuestion"))
  }
});



// 2. Tell service worker to gen the zip file
document.addEventListener("genQuestion", async (e) => {
  let resp = await chrome.runtime.sendMessage({question: question, actionType: "genQuestion"})
  let {fileName, zipBase64} = resp
  blob = base64ToBlob(zipBase64, "application/zip")
  blobFileName = fileName
  // downloadBlob(blob, fileName)
})

// Function to convert base64 to Blob
function base64ToBlob(base64String, mimeType) {
  // Convert base64 to binary
  var binaryString = atob(base64String);
  
  // Convert binary to ArrayBuffer
  var arrayBuffer = new ArrayBuffer(binaryString.length);
  var uint8Array = new Uint8Array(arrayBuffer);
  for (var i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  
  // Create Blob from ArrayBuffer
  return new Blob([arrayBuffer], { type: mimeType });
}

// 3. Receive action from user to download
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if (message.actionType !== "download") {
        return
      }
      downloadBlob(blob, blobFileName.replaceAll(" ", "_"));
    }
);

// Function to download Blob
function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


