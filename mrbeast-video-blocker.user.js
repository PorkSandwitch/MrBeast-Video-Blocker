// ==UserScript==
// @name         MrBeast Video Blocker
// @namespace    https://github.com/PorkSandwitch/MrBeast-Video-Blocker
// @version      1.0
// @description  Hides videos from specified MrBeast channels on YouTube.
// @author       PorkSandwitch
// @homepageURL  https://github.com/PorkSandwitch/MrBeast-Video-Blocker
// @supportURL   https://github.com/PorkSandwitch/MrBeast-Video-Blocker/issues
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(() => {
    "use strict";

    const BLOCKED_HANDLES = new Set([
        "mrbeast",
        "mrbeastgaming",
        "beastreacts",
        "beastphilanthropy",
        "mrbeast2",
        "beastanimations"
    ]);

    const VIDEO_CARD_SELECTOR = [
        "ytd-video-renderer",
        "ytd-rich-item-renderer",
        "ytd-grid-video-renderer",
        "ytd-compact-video-renderer",
        "ytd-reel-item-renderer",
        "yt-lockup-view-model",
        "ytm-shorts-lockup-view-model",
        "ytm-shorts-lockup-view-model-v2"
    ].join(",");

    const BLOCKED_ATTRIBUTE = "data-mrbeast-blocked";

    const style = document.createElement("style");

    style.textContent = `
        [${BLOCKED_ATTRIBUTE}="true"] {
            display: none !important;
        }
    `;

    (document.head || document.documentElement).appendChild(style);

    function normalizeHandle(value) {
        return (value || "")
            .trim()
            .toLowerCase()
            .replace(/^@/, "");
    }

    function isBlockedChannelLink(link) {
        if (!(link instanceof HTMLAnchorElement)) {
            return false;
        }

        const href = link.getAttribute("href");

        if (!href) {
            return false;
        }

        const match = href.match(/^\/@([^/?#]+)\/?$/);

        if (!match) {
            return false;
        }

        return BLOCKED_HANDLES.has(normalizeHandle(match[1]));
    }

    function getVideoCard(element) {
        if (!(element instanceof Element)) {
            return null;
        }

        return (
            element.closest(VIDEO_CARD_SELECTOR) ||
            element.closest("ytd-search-pyv-renderer")
        );
    }

    function hideVideo(element) {
        if (element) {
            element.setAttribute(BLOCKED_ATTRIBUTE, "true");
        }
    }

    function processLink(link) {
        if (!isBlockedChannelLink(link)) {
            return;
        }

        const videoCard = getVideoCard(link);

        if (videoCard) {
            hideVideo(videoCard);
        }
    }

    function processCard(card) {
        if (
            !(card instanceof Element) ||
            card.getAttribute(BLOCKED_ATTRIBUTE) === "true"
        ) {
            return;
        }

        for (const link of card.querySelectorAll("a[href]")) {
            if (isBlockedChannelLink(link)) {
                hideVideo(card);
                return;
            }
        }
    }

    function processRoot(root) {
        if (!(root instanceof Element)) {
            return;
        }

        if (root.matches(VIDEO_CARD_SELECTOR)) {
            processCard(root);
        }

        if (root.matches("a[href]")) {
            processLink(root);
        }

        for (const card of root.querySelectorAll(VIDEO_CARD_SELECTOR)) {
            processCard(card);
        }

        for (const link of root.querySelectorAll("a[href^='/@']")) {
            processLink(link);
        }
    }

    function scanPage() {
        for (const card of document.querySelectorAll(VIDEO_CARD_SELECTOR)) {
            processCard(card);
        }

        for (const link of document.querySelectorAll("a[href^='/@']")) {
            processLink(link);
        }
    }

    let scanScheduled = false;
    const pendingRoots = new Set();

    function queueScan(root) {
        if (!(root instanceof Element)) {
            return;
        }

        pendingRoots.add(root);

        if (scanScheduled) {
            return;
        }

        scanScheduled = true;

        requestAnimationFrame(() => {
            scanScheduled = false;

            for (const pendingRoot of pendingRoots) {
                processRoot(pendingRoot);

                setTimeout(() => processRoot(pendingRoot), 150);
                setTimeout(() => processRoot(pendingRoot), 500);
            }

            pendingRoots.clear();
        });
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== "childList") {
                continue;
            }

            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    queueScan(node);
                }
            }
        }
    });

    function start() {
        if (!document.documentElement) {
            setTimeout(start, 50);
            return;
        }

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        scanPage();
    }

    start();

    window.addEventListener("yt-navigate-finish", () => {
        scanPage();

        setTimeout(scanPage, 250);
        setTimeout(scanPage, 750);
    });
})();
