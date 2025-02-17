document.getElementById("addVideo").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let currentUrl = tabs[0].url;

        if (currentUrl.includes("youtube.com/watch")) {
            let videoId = new URL(currentUrl).searchParams.get("v");
            let videoTitle = tabs[0].title;
            let category = document.getElementById("category").value;

            console.log("Attempting to save video:", videoTitle, currentUrl, category);

            chrome.storage.local.get("videos", (data) => {
                let videos = data.videos || [];

                if (!videos.some(video => video.id === videoId)) {
                    videos.push({ title: videoTitle, url: currentUrl, id: videoId, category });

                    chrome.storage.local.set({ videos }, () => {
                        console.log("Video saved successfully!");
                        displayVideos();
                    });
                } else {
                    console.log("Duplicate video detected, not adding.");
                }
            });
        } else {
            console.log("Not a YouTube video page, cannot save.");
        }
    });
});

document.getElementById("search").addEventListener("input", (e) => {
    let searchTerm = e.target.value.toLowerCase();

    chrome.storage.local.get("videos", (data) => {
        let videos = data.videos || [];

        // Apply search filtering
        let filteredVideos = videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) || 
            video.category.toLowerCase().includes(searchTerm)
        );

        console.log("Search term:", searchTerm, "Filtered Videos:", filteredVideos);
        renderVideoList(filteredVideos);
    });
});

function displayVideos() {
    chrome.storage.local.get("videos", (data) => {
        let selectedCategory = document.getElementById("category").value;
        let videos = data.videos || [];

        console.log("Loading videos:", videos);

        let filteredVideos = selectedCategory === "All" ? videos : videos.filter(video => video.category === selectedCategory);

        renderVideoList(filteredVideos);
    });
}

function renderVideoList(videos) {
    let videoList = document.getElementById("videoList");
    videoList.innerHTML = "";

    if (videos.length === 0) {
        videoList.innerHTML = "<li>No videos found</li>";
        return;
    }

    videos.forEach((video, index) => {
        let li = document.createElement("li");

        let link = document.createElement("a");
        link.href = video.url;
        link.textContent = `[${video.category}] ${video.title}`;
        link.target = "_blank";

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = () => deleteVideo(index);

        li.appendChild(link);
        li.appendChild(deleteBtn);
        videoList.appendChild(li);
    });

    console.log("Updated video list displayed.");
}

function deleteVideo(index) {
    chrome.storage.local.get("videos", (data) => {
        let videos = data.videos || [];
        videos.splice(index, 1);
        chrome.storage.local.set({ videos }, displayVideos);
    });
}

document.getElementById("export").addEventListener("click", () => {
    chrome.storage.local.get("videos", (data) => {
        let blob = new Blob([JSON.stringify(data.videos, null, 2)], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "youtube_manager_backup.json";
        a.click();
    });
});

document.getElementById("import").addEventListener("change", (event) => {
    let file = event.target.files[0];

    if (file) {
        document.getElementById("import").labels[0].textContent = `File selected: ${file.name}`;

        let reader = new FileReader();
        reader.onload = function(e) {
            try {
                let importedVideos = JSON.parse(e.target.result);
                
                // Ensure it's an array before saving
                if (Array.isArray(importedVideos)) {
                    chrome.storage.local.set({ videos: importedVideos }, () => {
                        console.log("Import successful! Videos saved.");
                        displayVideos(); // Refresh UI
                        alert("Backup restored successfully! 🎉");
                    });
                } else {
                    alert("Invalid file format. Please upload a valid backup file.");
                }
            } catch (error) {
                alert("Error reading file. Please ensure it's a valid JSON backup.");
                console.error("Import error:", error);
            }
        };

        reader.readAsText(file);
    }
});

document.getElementById("darkModeToggle").addEventListener("change", (e) => {
    let darkMode = e.target.checked;
    chrome.storage.local.set({ darkMode });
    document.body.classList.toggle("dark", darkMode);
});

chrome.storage.local.get("darkMode", (data) => {
    if (data.darkMode) document.body.classList.add("dark");
});

document.getElementById("category").addEventListener("change", displayVideos);

displayVideos();
