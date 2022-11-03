(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  const fetchBookmarks = () => { //parsing through chrome storage to look for the ones associated with the currentVideo ID
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []); //look for any video when indexing using the video
      });
    });
  };

  const addNewBookmarkEventHandler = async () => { //creating a new bookmark
    const currentTime = youtubePlayer.currentTime; //gets the current time from youtube, can do via console
    const newBookmark = { //creating a new bookmark with the current time and the description of the time in min/sec(that is what .getTime() is doing
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({ //can look at documentation but it is storing the bookmark in chrome storage in order of their saved timestamp
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0]; //checking if the bookmark button exists

    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) { //if bookmarkBtn does not exist then create the button
      const bookmarkBtn = document.createElement("img"); //creating an image element

      //adding assets to the bookmarkBtn constant
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png"); //reading in the image
      bookmarkBtn.className = "ytp-button " + "bookmark-btn"; //adding classes
      bookmarkBtn.title = "Click to bookmark current timestamp"; // making a title show on hover, this is a UI thing 

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0]; //using inspect elemnt to find the part of the webpage the extension will manipulate
      youtubePlayer = document.getElementsByClassName('video-stream')[0]; //using inspect elemnt to find the part of the webpage the extension will manipulate

      youtubeLeftControls.appendChild(bookmarkBtn); //adding the bookmarkBtn to the youtube controls
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler); //adding an event listener to see if bookmarkBtn has been clicked, check at 27min in the video
    }
  };
 

  chrome.runtime.onMessage.addListener((obj, sender, response) => { //listening ffor the background.js file 
    const { type, value, videoId } = obj;

    if (type === "NEW") { //if it's a new video
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") { //if the type is play
      youtubePlayer.currentTime = value; //set the current time of the video to value
    } else if ( type === "DELETE") { //if the type is delete
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value); //deleting that value
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) }); //if the chrom storage reloads, the deleted bookmark does not show

      response(currentVideoBookmarks); //sending the updated bookmarks back to the popup.js file
    }
  });
 
  newVideoLoaded();
})();

const getTime = t => { //changing time from seconds to min/seconds
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
