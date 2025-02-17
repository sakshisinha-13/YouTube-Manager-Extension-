if (window.location.href.includes("youtube.com/watch")) {
    let btn = document.createElement("button");
    btn.innerText = "Save Video";
    btn.style.position = "fixed";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "1000";
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
        let videoId = new URL(window.location.href).searchParams.get("v");
        let videoTitle = document.title;
        
        chrome.storage.local.get("videos", (data) => {
            let videos = data.videos || [];
            videos.push({ title: videoTitle, url: window.location.href, id: videoId });
            chrome.storage.local.set({ videos });
        });
    });
}
