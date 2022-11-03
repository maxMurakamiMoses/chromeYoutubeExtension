chrome.tabs.onUpdated.addListener((tabId, tab) => {  //listening for a change in tabs on chrome
  if (tab.url && tab.url.includes("youtube.com/watch")) { //Checking if the tab you are on is a youtube tab
    const queryParameters = tab.url.split("?")[1]; //queryparameters will be a unique ID for each video page on youtube
    const urlParameters = new URLSearchParams(queryParameters); //interface to work with URL's 

    chrome.tabs.sendMessage(tabId, { //sending a message to the content script with the type of event and the tabID
      type : "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});
 