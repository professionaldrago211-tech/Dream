// ==========================================
// Dream - Video & Audio Editor
// script.js
// ==========================================

"use strict";

// ==========================================
// GET SCREENS
// ==========================================

const home = document.getElementById("home");
const videoTools = document.getElementById("videoTools");
const audioTools = document.getElementById("audioTools");
const insertClips = document.getElementById("insertClips");
const settings = document.getElementById("settings");
const help = document.getElementById("help");

// ==========================================
// NAVIGATION
// ==========================================

function hideAllScreens() {
    if (home) home.hidden = true;
    if (videoTools) videoTools.hidden = true;
    if (audioTools) audioTools.hidden = true;
    if (insertClips) insertClips.hidden = true;
    if (settings) settings.hidden = true;
    if (help) help.hidden = true;
}

function showScreen(screen) {
    if (!screen) return;

    hideAllScreens();
    screen.hidden = false;
    screen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Home buttons

document.getElementById("videoToolsBtn")?.addEventListener("click", () => {
    showScreen(videoTools);
});

document.getElementById("audioToolsBtn")?.addEventListener("click", () => {
    showScreen(audioTools);
});

document.getElementById("settingsBtn")?.addEventListener("click", () => {
    showScreen(settings);
});

document.getElementById("helpBtn")?.addEventListener("click", () => {
    showScreen(help);
});

// Back buttons

document.getElementById("videoBackBtn")?.addEventListener("click", () => {
    showScreen(home);
});

document.getElementById("audioBackBtn")?.addEventListener("click", () => {
    showScreen(home);
});

document.getElementById("settingsBackBtn")?.addEventListener("click", () => {
    showScreen(home);
});

document.getElementById("helpBackBtn")?.addEventListener("click", () => {
    showScreen(home);
});

// ==========================================
// INSERT CLIPS ELEMENTS
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

// ==========================================
// STATE
// ==========================================

let baseVideoURL = null;

let clips = [];

let pendingClip = null;

// ==========================================
// OPEN INSERT CLIPS
// ==========================================

insertClipsBtn?.addEventListener("click", () => {
    showScreen(insertClips);
});

// ==========================================
// BACK
// ==========================================

insertBackBtn?.addEventListener("click", () => {
    showScreen(videoTools);
});

// ==========================================
// BASE VIDEO
// ==========================================

baseVideoInput?.addEventListener("change", () => {

    const file = baseVideoInput.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("video/")) {

        alert("Please choose a video file.");

        baseVideoInput.value = "";

        return;
    }

    // Release old object URL

    if (baseVideoURL) {
        URL.revokeObjectURL(baseVideoURL);
    }

    // Clear previous clips because the base video changed

    clearAllClips(false);

    baseVideoURL = URL.createObjectURL(file);

    baseVideoPlayer.src = baseVideoURL;

    baseVideoPlayer.load();

    playPauseBtn.textContent = "Play";

    playPauseBtn.setAttribute(
        "aria-label",
        "Play video"
    );

    timeDisplay.textContent = "00:00 / 00:00";

    videoPosition.value = 0;

    alert(
        "Base video loaded. You can now play the video and choose positions for your clips."
    );
});

// ==========================================
// PLAY / PAUSE
// ==========================================

playPauseBtn?.addEventListener("click", async () => {

    if (!baseVideoPlayer.src) {

        alert("Please choose a base video first.");

        return;
    }

    if (baseVideoPlayer.paused) {

        try {

            await baseVideoPlayer.play();

            playPauseBtn.textContent = "Pause";

            playPauseBtn.setAttribute(
                "aria-label",
                "Pause video"
            );

        } catch (error) {

            console.error(error);

            alert(
                "The video could not be played."
            );
        }

    } else {

        baseVideoPlayer.pause();

        playPauseBtn.textContent = "Play";

        playPauseBtn.setAttribute(
            "aria-label",
            "Play video"
        );
    }
});

// ==========================================
// WHEN VIDEO PLAYS
// ==========================================

baseVideoPlayer?.addEventListener("play", () => {

    playPauseBtn.textContent = "Pause";

    playPauseBtn.setAttribute(
        "aria-label",
        "Pause video"
    );
});

// ==========================================
// WHEN VIDEO PAUSES
// ==========================================

baseVideoPlayer?.addEventListener("pause", () => {

    playPauseBtn.textContent = "Play";

    playPauseBtn.setAttribute(
        "aria-label",
        "Play video"
    );
});

// ==========================================
// REWIND 10 SECONDS
// ==========================================

rewindBtn?.addEventListener("click", () => {

    if (!baseVideoPlayer.src) {

        alert("Please choose a base video first.");

        return;
    }

    baseVideoPlayer.currentTime = Math.max(
        0,
        baseVideoPlayer.currentTime - 10
    );

    updateTimeDisplay();
});

// ==========================================
// FORWARD 10 SECONDS
// ==========================================

forwardBtn?.addEventListener("click", () => {

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

    updateTimeDisplay();
});

// ==========================================
// VIDEO METADATA
// ==========================================

baseVideoPlayer?.addEventListener(
    "loadedmetadata",
    () => {

        if (!Number.isFinite(baseVideoPlayer.duration)) {
            return;
        }

        videoPosition.max =
            baseVideoPlayer.duration;

        videoPosition.value =
            baseVideoPlayer.currentTime;

        updateTimeDisplay();
    }
);

// ==========================================
// VIDEO TIME UPDATE
// ==========================================

baseVideoPlayer?.addEventListener(
    "timeupdate",
    () => {

        if (!Number.isFinite(baseVideoPlayer.duration)) {
            return;
        }

        videoPosition.max =
            baseVideoPlayer.duration;

        videoPosition.value =
            baseVideoPlayer.currentTime;

        updateTimeDisplay();
    }
);

// ==========================================
// VIDEO SLIDER
// ==========================================

videoPosition?.addEventListener(
    "input",
    () => {

        if (!baseVideoPlayer.src) {
            return;
        }

        const position =
            Number(videoPosition.value);

        if (!Number.isFinite(position)) {
            return;
        }

        baseVideoPlayer.currentTime = position;

        updateTimeDisplay();
    }
);

// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const totalSeconds =
        Math.max(0, Math.floor(seconds));

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const remainingSeconds =
        totalSeconds % 60;

    if (hours > 0) {

        return (
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

// ==========================================
// UPDATE TIME
// ==========================================

function updateTimeDisplay() {

    if (!baseVideoPlayer || !timeDisplay) {
        return;
    }

    const current =
        formatTime(baseVideoPlayer.currentTime);

    const duration =
        formatTime(baseVideoPlayer.duration);

    timeDisplay.textContent =
        `${current} / ${duration}`;
}

// ==========================================
// INSERT CLIP
// ==========================================

insertClipBtn?.addEventListener("click", () => {

    if (!baseVideoPlayer.src) {

        alert("Please choose a base video first.");

        return;
    }

    if (baseVideoPlayer.paused === false) {

        alert(
            "Please pause the base video at the exact position where you want to insert the clip."
        );

        return;
    }

    const clipFile =
        clipInput.files?.[0];

    if (!clipFile) {

        alert("Please choose a clip first.");

        return;
    }

    if (!clipFile.type.startsWith("video/")) {

        alert("Please choose a video clip.");

        clipInput.value = "";

        return;
    }

    // Release old pending clip

    if (pendingClip?.url) {
        URL.revokeObjectURL(
            pendingClip.url
        );
    }

    pendingClip = {

        file: clipFile,

        position:
            baseVideoPlayer.currentTime,

        url:
            URL.createObjectURL(
                clipFile
            )
    };

    renderPendingClip();

    alert(
        `Clip selected at ${formatTime(
            pendingClip.position
        )}. Press Done to add it to the list.`
    );
});

// ==========================================
// SHOW PENDING CLIP
// ==========================================

function renderPendingClip() {

    if (!pendingClip) {
        return;
    }

    renderClipList();

    const pending = document.createElement("div");

    pending.className =
        "clip-item pending-clip";

    pending.innerHTML = `
        <strong>Pending Clip</strong>
        <br>
        Position:
        ${formatTime(pendingClip.position)}
        <br>
        File:
        ${escapeHTML(pendingClip.file.name)}
        <br>
        <span>Press Done to add this clip.</span>
    `;

    clipList.appendChild(pending);
}

// ==========================================
// DONE
// ==========================================

doneClipBtn?.addEventListener("click", () => {

    if (!pendingClip) {

        alert(
            "First choose a clip, pause the base video at the desired position, and press Insert Clip."
        );

        return;
    }

    clips.push({

        file: pendingClip.file,

        position: pendingClip.position,

        url: pendingClip.url
    });

    pendingClip = null;

    clipInput.value = "";

    renderClipList();

    alert(
        `Clip ${clips.length} added successfully. You can now move the base video to another position and add another clip.`
    );
});

// ==========================================
// RENDER CLIPS
// ==========================================

function renderClipList() {

    if (!clipList) {
        return;
    }

    clipList.innerHTML = "";

    if (clips.length === 0) {

        clipList.textContent =
            "No clips added yet.";

        return;
    }

    clips.forEach((clip, index) => {

        const item =
            document.createElement("div");

        item.className =
            "clip-item";

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

    // Show pending clip after saved clips

    if (pendingClip) {
        renderPendingClip();
    }
}

// ==========================================
// CLEAR ALL CLIPS
// ==========================================

clearClipsBtn?.addEventListener("click", () => {

    clearAllClips(true);
});

function clearAllClips(showMessage) {

    clips.forEach((clip) => {

        if (clip.url) {
            URL.revokeObjectURL(clip.url);
        }
    });

    if (pendingClip?.url) {

        URL.revokeObjectURL(
            pendingClip.url
        );
    }

    clips = [];

    pendingClip = null;

    if (clipInput) {
        clipInput.value = "";
    }

    renderClipList();

    if (showMessage) {

        alert(
            "All selected clips have been cleared."
        );
    }
}

// ==========================================
// SAVE FINAL VIDEO
// ==========================================

saveProjectBtn?.addEventListener(
    "click",
    async () => {

        if (!baseVideoInput.files?.[0]) {

            alert(
                "Please choose a base video first."
            );

            return;
        }

        if (pendingClip) {

            alert(
                "You have a clip waiting to be confirmed. Press Done first."
            );

            return;
        }

        if (clips.length === 0) {

            alert(
                "Please add at least one clip before saving."
            );

            return;
        }

        // Sort by insertion position

        const orderedClips =
            [...clips].sort(
                (a, b) =>
                    a.position - b.position
            );

        console.log(
            "Base video:",
            baseVideoInput.files[0]
        );

        console.log(
            "Clips:",
            orderedClips
        );

        alert(
            "Your project is ready. The actual MP4 processing engine will now be loaded in the next setup step."
        );
    }
);

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}

// ==========================================
// CLEAN UP OBJECT URL
// ==========================================

window.addEventListener(
    "beforeunload",
    () => {

        if (baseVideoURL) {

            URL.revokeObjectURL(
                baseVideoURL
            );
        }

        clips.forEach((clip) => {

            if (clip.url) {

                URL.revokeObjectURL(
                    clip.url
                );
            }
        });

        if (pendingClip?.url) {

            URL.revokeObjectURL(
                pendingClip.url
            );
        }
    }
);

// ==========================================
// SERVICE WORKER
// ==========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(() => {

                    console.log(
                        "Service Worker registered."
                    );
                })
                .catch((error) => {

                    console.error(
                        "Service Worker registration failed:",
                        error
                    );
                });
        }
    );
}

// ==========================================
// INITIAL STATE
// ==========================================

hideAllScreens();

if (home) {
    home.hidden = false;
}

renderClipList();

console.log(
    "Dream Video & Audio Editor loaded."
);
