/*global chrome */
console.log("background.js activated");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "selectedResults") {
    console.log("data coming from contentscript", message.data);
    sendMessageToContentScript(message.data);
  }

  sendResponse("background.js recieved data");
});

const sendMessageToContentScript = (results) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { results: results }, (response) => {
      console.log(response.reply);
    });
  });
};
