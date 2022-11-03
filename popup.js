import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => { //error here in the code?
  const bookmarkTitleElement = document.createElement("div"); //creating the titlelement
  const controlsElement = document.createElement("div"); //creating an element that will encapsulate all the other elemnts that are part of a bookmark row
  const newBookmarkElement = document.createElement("div"); 

  bookmarkTitleElement.textContent = bookmark.desc; //display the description
  bookmarkTitleElement.className = "bookmark-title"; //adding the css
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);  //adding the play button
  setBookmarkAttributes("delete", onDelete, controlsElement); //adding the delete button

  //essentially creating a row for each bookmark with the following pieces of data
  newBookmarkElement.id = "bookmark-" + bookmark.time; //makes a unique id for each bookmark
  newBookmarkElement.className = "bookmark"; //adding the css
  newBookmarkElement.setAttribute("timestamp", bookmark.time); //helps with playing the video from the bookmark spot

  newBookmarkElement.appendChild(bookmarkTitleElement); //so it displays within the new bookmark element
  newBookmarkElement.appendChild(controlsElement);  //adding the play or delete button to the newbookmark so you can see it in the UI
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => { //showing the bookmarks
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = ""; //if there are no bookmarks display nothing 

  if (currentBookmarks.length > 0) { //if bookmarks exist
    for (let i = 0; i < currentBookmarks.length; i++) {  //iterate over the currentbooks to populate the UI
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark); //adding one bookmark at a time
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>'; //if there are no bookmarks, display this messege
  }

  return;
};

const onPlay = async e => { //making the play button functional
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp"); //grabbing the timestamp
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, { //sending a messege to the contentScript
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL(); //grab the users active tab
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp"); //grabbing the timestamp
  const bookmarkElementToDelete = document.getElementById( "bookmark-" + bookmarkTime ); //grabbing the element by the ID

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete); //sending a messege to the contentScript that you want to delete

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks); //refreshes the bookmarks so any changes show immedietly 
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => { //
  const controlElement = document.createElement("img"); //a control element is either a play or delete button

  controlElement.src = "assets/" + src + ".png"; //linking to an image in the assets file
  controlElement.title = src; //giving it a title
  controlElement.addEventListener("click", eventListener);  //adding an event listening that will listen for a click
  controlParentElement.appendChild(controlElement); 
};

document.addEventListener("DOMContentLoaded", async () => { //fires when the html document has been loaded
  const activeTab = await getActiveTabURL();  
  const queryParameters = activeTab.url.split("?")[1];  //grab the queryParameter to ID the video
  const urlParameters = new URLSearchParams(queryParameters); //

  const currentVideo = urlParameters.get("v");    //getting the unique youtube ID

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {  //make sure that it's a youtube video
    chrome.storage.sync.get([currentVideo], (data) => { //get any current bookmarks from the chrome storage using chrome storage API
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []; 

      viewBookmarks(currentVideoBookmarks); //helps us view the bookmarks associated with the video's ID
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>'; //shows this is not a youtube page
  }
});

