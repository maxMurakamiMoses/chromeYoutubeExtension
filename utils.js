export async function getActiveTabURL() { //copy and pasted from chrome documentation
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

