chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveVideo",
        title: "Save Video to YouTube Manager",
        contexts: ["page"],
        documentUrlPatterns: ["*://www.youtube.com/watch*"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    let videoId = new URL(tab.url).searchParams.get("v");
    let videoTitle = tab.title;

    chrome.storage.local.get("videos", (data) => {
        let videos = data.videos || [];
        if (!videos.some(video => video.id === videoId)) {
            videos.push({ title: videoTitle, url: tab.url, id: videoId });
            chrome.storage.local.set({ videos });
        }
    });
});
