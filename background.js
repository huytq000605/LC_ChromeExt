console.log("Working")

chrome.webRequest.onCompleted.addListener(
  function(details) {
    console.log('Completed request URL:', details.url);
    console.log('Request method:', details.method);
    console.log('Response status code:', details.statusCode);
    // Additional details can be accessed from the 'details' object
  },
  {
    urls: ['<all_urls>'], // Match all URLs
    types: ['main_frame', 'sub_frame', 'xmlhttprequest'], // Match main frame, sub frame, and AJAX requests
  },
  ['responseHeaders', 'extraHeaders'] // Receive response headers and extra headers
);

