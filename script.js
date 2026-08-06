// ==========================
// Video & Audio Editor
// script.js
// ==========================

const home = document.getElementById("home");
const videoTools = document.getElementById("videoTools");
const audioTools = document.getElementById("audioTools");
const settings = document.getElementById("settings");
const help = document.getElementById("help");

function hideAll() {
    home.hidden = true;
    videoTools.hidden = true;
    audioTools.hidden = true;
    settings.hidden = true;
    help.hidden = true;
}

function goHome() {
    hideAll();
    home.hidden = false;
}

document.getElementById("videoToolsBtn").addEventListener("click", function () {
    hideAll();
    videoTools.hidden = false;
});

document.getElementById("audioToolsBtn").addEventListener("click", function () {
    hideAll();
    audioTools.hidden = false;
});

document.getElementById("settingsBtn").addEventListener("click", function () {
    hideAll();
    settings.hidden = false;
});

document.getElementById("helpBtn").addEventListener("click", function () {
    hideAll();
    help.hidden = false;
});

// Register the service worker if supported
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.log("Service Worker failed:", err));
    });
}
