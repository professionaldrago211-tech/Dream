// ==========================================
// Video & Audio Editor
// script.js
// ==========================================

// ---------- Get Screens ----------
const home = document.getElementById("home");
const videoTools = document.getElementById("videoTools");
const audioTools = document.getElementById("audioTools");
const insertClips = document.getElementById("insertClips");
const settings = document.getElementById("settings");
const help = document.getElementById("help");

// ---------- Navigation ----------
function hideAllScreens() {
    home.hidden = true;
    videoTools.hidden = true;
    audioTools.hidden = true;
    insertClips.hidden = true;
    settings.hidden = true;
    help.hidden = true;
}

function showScreen(screen) {
    hideAllScreens();
    screen.hidden = false;
}

document.getElementById("videoToolsBtn").addEventListener("click", () => {
    showScreen(videoTools);
});

document.getElementById("audioToolsBtn").addEventListener("click", () => {
    showScreen(audioTools);
});

document.getElementById("settingsBtn").addEventListener("click", () => {
    showScreen(settings);
});

document.getElementById("helpBtn").addEventListener("click", () => {
    showScreen(help);
});

document.getElementById("videoBackBtn").addEventListener("click", () => {
    showScreen(home);
});

document.getElementById("audioBackBtn").addEventListener("click", () => {
    showScreen(home);
});

document.getElementById("settingsBackBtn").addEventListener("click", () => {
    showScreen(home);
});

document.getElementById("helpBackBtn").addEventListener("click", () => {
    showScreen(home);
});


// ==========================================
// INSERT CLIPS
// ==========================================

const insertClipsBtn = document.getElementById("insertClipsBtn");

const baseVideoInput = document.getElementById("baseVideoInput");
const baseVideoPlayer = document.getElementById("baseVideoPlayer");

const rewindBtn = document.getElementById("rewindBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const forwardBtn = document.getElementById("forwardBtn");

const videoPosition = document.getElementById("videoPosition");
const timeDisplay = document.getElementById("timeDisplay");

const insertClipBtn = document.getElementById("insertClipBtn");
const clipInput = document.getElementById("clipInput");
const doneClipBtn = document.getElementById("doneClipBtn");
const clearClipsBtn = document.getElementById("clearClipsBtn");

const clipList = document.getElementById("clipList");
const saveProjectBtn = document.getElementById("saveProjectBtn");

const insertBackBtn = document.getElementById("insertBackBtn");


// ---------- Open Insert Clips ----------
insertClipsBtn.addEventListener("click", () => {
    showScreen(insertClips);
});


// ---------- Back ----------
insertBackBtn.addEventListener("click", () => {
    showScreen(videoTools);
});


// ==========================================
// BASE VIDEO
// ==========================================

let baseVideoURL = null;

baseVideoInput.addEventListener("change", () => {

    const file = baseVideoInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("video/")) {
        alert("Please choose a video file.");
        baseVideoInput.value = "";
        return;
    }

    // Remove previous object URL
    if (baseVideoURL) {
        URL.revokeObjectURL(baseVideoURL);
    }

    baseVideoURL = URL.createObjectURL(file);

    baseVideoPlayer.src = baseVideoURL;
    baseVideoPlayer.load();

    playPauseBtn.textContent = "Play";
    playPauseBtn.setAttribute("aria-label", "Play video");

    timeDisplay.textContent = "00:00 / 00:00";
});


// ==========================================
// PLAY / PAUSE
// ==========================================

playPauseBtn.addEventListener("click", async () => {

    if (!baseVideoPlayer.src) {
        alert("Please choose a base video first.");
        return;
    }

    if (baseVideoPlayer.paused) {

        try {
            await baseVideoPlayer.play();

            playPauseBtn.textContent = "Pause";
            playPauseBtn.setAttribute("aria-label", "Pause video");

        } catch (error) {
            console.error(error);
        }

    } else {

        baseVideoPlayer.pause();

        playPauseBtn.textContent = "Play";
        playPauseBtn.setAttribute("aria-label", "Play video");
    }
});


// ==========================================
// REWIND 10 SECONDS
// ==========================================

rewindBtn.addEventListener("click", () => {

    if (!baseVideoPlayer.src) {
        alert("Please choose a base video first.");
        return;
    }

    baseVideoPlayer.currentTime = Math.max(
        0,
        baseVideoPlayer.currentTime - 10
    );
});


// ==========================================
// FORWARD 10 SECONDS
// ==========================================

forwardBtn.addEventListener("click", () => {

    if (!baseVideoPlayer.src) {
        alert("Please choose a base video first.");
        return;
    }

    if (!Number.isFinite(baseVideoPlayer.duration)) {
        return;
    }

    baseVideoPlayer.currentTime = Math.min(
        baseVideoPlayer.duration,
        baseVideoPlayer.currentTime + 10
    );
});


// ==========================================
// VIDEO SLIDER
// ==========================================

baseVideoPlayer.addEventListener("loadedmetadata", () => {

    if (Number.isFinite(baseVideoPlayer.duration)) {
        videoPosition.max = baseVideoPlayer.duration;
        videoPosition.value = baseVideoPlayer.currentTime;

        updateTimeDisplay();
    }
});


baseVideoPlayer.addEventListener("timeupdate", () => {

    if (Number.isFinite(baseVideoPlayer.duration)) {
        videoPosition.max = baseVideoPlayer.duration;
        videoPosition.value = baseVideoPlayer.currentTime;

        updateTimeDisplay();
    }
});


videoPosition.addEventListener("input", () => {

    if (!baseVideoPlayer.src) {
        return;
    }

    baseVideoPlayer.currentTime = Number(videoPosition.value);

    updateTimeDisplay();
});


// ==========================================
// TIME DISPLAY
// ==========================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const totalSeconds = Math.floor(seconds);

    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}


function updateTimeDisplay() {

    const current = formatTime(baseVideoPlayer.currentTime);

    const duration = formatTime(baseVideoPlayer.duration);

    timeDisplay.textContent = `${current} / ${duration}`;
}


// ==========================================
// CLIP MANAGEMENT
// ==========================================

let clips = [];

let pendingClip = null;


// ---------- Insert Clip ----------
insertClipBtn.addEventListener("click", () => {

    if (!baseVideoPlayer.src) {
        alert("Please choose a base video first.");
        return;
    }

    const clipFile = clipInput.files[0];

    if (!clipFile) {
        alert("Please choose a clip first.");
        return;
    }

    if (!clipFile.type.startsWith("video/")) {
        alert("Please choose a video clip.");
        return;
    }

    pendingClip = {
        file: clipFile,
        position: baseVideoPlayer.currentTime,
        url: URL.createObjectURL(clipFile)
    };

    clipList.innerHTML = `
        <p>
            Clip selected at
            <strong>${formatTime(pendingClip.position)}</strong>.
        </p>
        <p>
            ${escapeHTML(clipFile.name)}
        </p>
    `;

    alert(
        "Clip selected. Press Done to confirm this insertion."
    );
});


// ==========================================
// DONE
// ==========================================

doneClipBtn.addEventListener("click", () => {

    if (!pendingClip) {
        alert("Choose a clip and press Insert Clip first.");
        return;
    }

    clips.push(pendingClip);

    pendingClip = null;

    clipInput.value = "";

    renderClipList();

    alert(
        "Clip added successfully. You can now choose another position and add another clip."
    );
});


// ==========================================
// SHOW ALL CLIPS
// ==========================================

function renderClipList() {

    if (clips.length === 0) {

        clipList.textContent = "No clips added yet.";

        return;
    }

    clipList.innerHTML = "";

    clips.forEach((clip, index) => {

        const item = document.createElement("div");

        item.className = "clip-item";

        item.innerHTML = `
            <strong>Clip ${index + 1}</strong>
            <br>
            Position:
            ${formatTime(clip.position)}
            <br>
            File:
            ${escapeHTML(clip.file.name)}
        `;

        clipList.appendChild(item);
    });
}


// ==========================================
// CLEAR
// ==========================================

clearClipsBtn.addEventListener("click", () => {

    clips.forEach(clip => {

        if (clip.url) {
            URL.revokeObjectURL(clip.url);
        }
    });

    if (pendingClip && pendingClip.url) {
        URL.revokeObjectURL(pendingClip.url);
    }

    clips = [];

    pendingClip = null;

    clipInput.value = "";

    renderClipList();

    alert("All selected clips have been cleared.");
});


// ==========================================
// SAVE
// ==========================================

saveProjectBtn.addEventListener("click", () => {

    if (!baseVideoInput.files[0]) {
        alert("Please choose a base video first.");
        return;
    }

    if (clips.length === 0) {
        alert("Please add at least one clip before saving.");
        return;
    }

    alert(
        "Your clips are ready for processing. FFmpeg will be connected next to create the final MP4."
    );
});


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// SERVICE WORKER
// ==========================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")
            .then(() => {
                console.log("Service Worker registered.");
            })
            .catch(error => {
                console.error(
                    "Service Worker registration failed:",
                    error
                );
            });
    });
}
