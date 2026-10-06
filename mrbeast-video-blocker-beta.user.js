// ==UserScript==
// @name         MrBeast Video Blocker
// @namespace    https://github.com/PorkSandwitch/MrBeast-Video-Blocker
// @version      1.1.beta
// @description  Hides videos from selected MrBeast channels on YouTube.
// @author       PorkSandwitch
// @homepageURL   https://github.com/PorkSandwitch/MrBeast-Video-Blocker
// @supportURL    https://github.com/PorkSandwitch/MrBeast-Video-Blocker/issues
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      www.youtube.com
// ==/UserScript==

(() => {
    "use strict";

const DEFAULT_BLOCKLIST = [
    "mrbeast",
    "mrbeastgaming",
    "beastreacts",
    "beastphilanthropy",
    "mrbeast2",
    "beastanimations",
    "mrbeastclips",
    "mrbeasthindi",
    "ucdifkioicej-hivavcqlpna",
    "mrbeastbrasil",
    "mrbeastgamingbrasil",
    "mrbeastenespanol",
    "mrbeastgamingespanol",
    "beastreactsespanol",
    "mrbeastenfrancais",
    "mrbeastjapan"
];

function normalizeEntry(value) {
    let entry = (value || "").trim();

    const urlMatch = entry.match(
        /youtube\.com\/(@[^/?#\s]+|(?:channel|c|user)\/[^/?#\s]+)/i
    );

    if (urlMatch) {
        entry = urlMatch[1].replace(/^(?:channel|c|user)\//i, "");
    }

    entry = entry.replace(/^@/, "");

    try {
        entry = decodeURIComponent(entry);
    } catch (error) {
    }

    entry = entry.trim().toLowerCase();

    return /[\s/\\?#]/.test(entry) ? "" : entry;
}

const CARD_SELECTOR = [
    "ytd-video-renderer",
    "ytd-rich-item-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-reel-item-renderer",
    "ytd-channel-renderer",
    "ytd-playlist-renderer",
    "ytd-grid-playlist-renderer",
    "ytd-compact-playlist-renderer",
    "ytd-show-renderer",
    "ytd-search-pyv-renderer",
    "yt-lockup-view-model",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2"
].join(",");

const SHORTS_CARD_SELECTOR = [
    "ytd-reel-item-renderer",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2"
].join(",");

const CHANNEL_LINK_SELECTOR =
    "a[href*='/@'], a[href*='/channel/'], a[href*='/c/'], a[href*='/user/']";

const BLOCKED_ATTRIBUTE = "data-mrbeast-blocked";
const BLOCKED_SELECTOR = `[${BLOCKED_ATTRIBUTE}="true"]`;
const TILE_ATTRIBUTE = "data-mrbeast-tile";

const LOOKUP_LINK_SELECTOR =
    "a[href*='/shorts/'], a[href*='list='], a[href*='/show/VL']";
const SHORTS_ID_PATTERN = /\/shorts\/([\w-]{11})/;
const PLAYLIST_ID_PATTERNS = [/[?&]list=([\w-]+)/, /\/show\/VL([\w-]+)/];
const MAX_LOOKUPS = 3;

const lookupAuthors = new Map();
const lookupPending = new Set();
const lookupQueue = [];

let lookupsActive = 0;
let lookupRescanTimer = null;

const blocklist = new Set(DEFAULT_BLOCKLIST);
let scanScheduled = false;

const pendingNodes = new Set();

const style = document.createElement("style");

style.textContent = `
    ${BLOCKED_SELECTOR}:not([${TILE_ATTRIBUTE}="true"]) {
        display: none !important;
    }

    [${TILE_ATTRIBUTE}="true"] {
        display: block !important;
        position: relative !important;
        min-height: 180px !important;
        overflow: hidden !important;
        pointer-events: none !important;
        border-radius: 14px !important;
    }

    [${TILE_ATTRIBUTE}="true"] > * {
        visibility: hidden !important;
    }

    [${TILE_ATTRIBUTE}="true"]::before {
        content: "[  Get a J*b  ]";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;

        display: flex;
        align-items: center;
        justify-content: center;

        width: min(78%, 260px);
        min-height: 70px;
        padding: 14px 20px;
        box-sizing: border-box;

        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 12px;

        background: linear-gradient(
            135deg,
            rgba(32, 32, 36, 0.96),
            rgba(16, 16, 18, 0.96)
        );

        box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

        color: #f2f2f2;
        font: 700 17px/1.2 Arial, sans-serif;
        letter-spacing: 0.2px;
        text-align: center;
        visibility: visible;
    }
`;

(document.head || document.documentElement).appendChild(style);

function getChannelKeyFromPath(pathname) {
    const match = pathname.match(
        /^\/(?:@([^/]+)|(?:channel|c|user)\/([^/]+))/
    );

    if (!match) {
        return null;
    }

    return normalizeEntry(match[1] || match[2]);
}

function getChannelKey(link) {
    if (link.hostname && !/(^|\.)youtube\.com$/.test(link.hostname)) {
        return null;
    }

    return getChannelKeyFromPath(link.pathname);
}

function getLookupTarget(card) {
    for (const link of card.querySelectorAll(LOOKUP_LINK_SELECTOR)) {
        const href = link.getAttribute("href") || "";

        const shorts = href.match(SHORTS_ID_PATTERN);

        if (shorts) {
            return {
                key: `v:${shorts[1]}`,
                url: `https://www.youtube.com/watch?v=${shorts[1]}`
            };
        }

        for (const pattern of PLAYLIST_ID_PATTERNS) {
            const playlist = href.match(pattern);

            if (playlist) {
                return {
                    key: `p:${playlist[1]}`,
                    url: `https://www.youtube.com/playlist?list=${playlist[1]}`
                };
            }
        }
    }

    return null;
}

function fetchAuthor(url) {
    return new Promise((resolve) => {
        GM_xmlhttpRequest({
            method: "GET",
            url:
                "https://www.youtube.com/oembed?format=json&url=" +
                encodeURIComponent(url),
            timeout: 10000,
            onload(response) {
                if (response.status < 200 || response.status >= 300) {
                    resolve("");
                    return;
                }

                try {
                    const data = JSON.parse(response.responseText);
                    const authorUrl = new URL(
                        data.author_url,
                        location.origin
                    );
                    resolve(
                        getChannelKeyFromPath(authorUrl.pathname) || ""
                    );
                } catch (error) {
                    resolve("");
                }
            },
            onerror() {
                resolve("");
            },
            ontimeout() {
                resolve("");
            }
        });
    });
}

function pumpLookupQueue() {
    while (lookupsActive < MAX_LOOKUPS && lookupQueue.length > 0) {
        const target = lookupQueue.shift();

        lookupsActive++;

        fetchAuthor(target.url)
            .then((key) => {
                lookupAuthors.set(target.key, key);
            })
            .finally(() => {
                lookupsActive--;
                lookupPending.delete(target.key);
                scheduleLookupRescan();
                pumpLookupQueue();
            });
    }
}

function requestAuthor(target) {
    if (lookupPending.has(target.key)) {
        return;
    }

    lookupPending.add(target.key);
    lookupQueue.push(target);
    pumpLookupQueue();
}

function scheduleLookupRescan() {
    if (lookupRescanTimer) {
        return;
    }

    lookupRescanTimer = setTimeout(() => {
        lookupRescanTimer = null;
        scanPage();
    }, 100);
}

function cardHasBlockedChannel(card) {
    let sawChannelLink = false;

    for (const link of card.querySelectorAll(CHANNEL_LINK_SELECTOR)) {
        const key = getChannelKey(link);

        if (!key) {
            continue;
        }

        sawChannelLink = true;

        if (blocklist.has(key)) {
            return true;
        }
    }

    if (sawChannelLink) {
        return false;
    }

    const target = getLookupTarget(card);

    if (!target) {
        return false;
    }

    if (!lookupAuthors.has(target.key)) {
        requestAuthor(target);
        return false;
    }

    return blocklist.has(lookupAuthors.get(target.key));
}

function evaluateCard(card) {
    const blocked = cardHasBlockedChannel(card);
    const isShort = blocked && card.matches(SHORTS_CARD_SELECTOR);

    const wrapsShort =
        blocked &&
        !isShort &&
        card.querySelector(SHORTS_CARD_SELECTOR) !== null;

    if (blocked && !wrapsShort) {
        card.setAttribute(BLOCKED_ATTRIBUTE, "true");
    } else {
        card.removeAttribute(BLOCKED_ATTRIBUTE);
    }

    if (isShort) {
        card.setAttribute(TILE_ATTRIBUTE, "true");
    } else {
        card.removeAttribute(TILE_ATTRIBUTE);
    }
}

function processNode(node) {
    if (!(node instanceof Element) || !node.isConnected) {
        return;
    }

    const cards = new Set();

    let ancestor = node.closest(CARD_SELECTOR);

    while (ancestor) {
        cards.add(ancestor);
        ancestor = ancestor.parentElement
            ? ancestor.parentElement.closest(CARD_SELECTOR)
            : null;
    }

    for (const card of node.querySelectorAll(CARD_SELECTOR)) {
        cards.add(card);
    }

    for (const card of cards) {
        evaluateCard(card);
    }
}

function scanPage() {
    for (const card of document.querySelectorAll(CARD_SELECTOR)) {
        evaluateCard(card);
    }

}

function queueScan(node) {
    if (!(node instanceof Element)) {
        return;
    }

    pendingNodes.add(node);

    if (scanScheduled) {
        return;
    }

    scanScheduled = true;

    requestAnimationFrame(() => {
        scanScheduled = false;

        for (const pendingNode of pendingNodes) {
            processNode(pendingNode);
        }

        pendingNodes.clear();
        });
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "attributes") {
            queueScan(mutation.target);
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
        subtree: true,
        attributes: true,
        attributeFilter: ["href"]
    });

    scanPage();
}

start();

window.addEventListener("yt-navigate-finish", scanPage);

})();
