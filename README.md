# 🚫 MrBeast Video Blocker

A lightweight **Violentmonkey userscript** that hides videos from selected MrBeast channels on YouTube.

## ⚡ Installation

### 1. Install Violentmonkey

First, install Violentmonkey for your browser:

- [Firefox](https://addons.mozilla.org/firefox/addon/violentmonkey/)
- [Chrome](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomkbblakfjhde)

### 2. Install MrBeast Video Blocker

After installing Violentmonkey, click the button below:

<a href="https://raw.githubusercontent.com/PorkSandwitch/MrBeast-Video-Blocker/main/mrbeast-video-blocker.user.js">
<img src="https://img.shields.io/badge/INSTALL%20WITH-VIOLENTMONKEY-7c3aed?style=for-the-badge" alt="Install with Violentmonkey">
</a>

Then click **Install** in Violentmonkey.

That's it. 🎉

---

## ✨ Features

- 🚫 Hides videos from selected MrBeast channels
- 🏠 Works on YouTube Home
- 🔎 Works on Search results
- 📺 Works on Subscriptions
- 🎬 Works with Shorts feeds
- 🔄 Handles dynamically loaded videos
- ⚡ Lightweight and runs locally
- 🔒 No tracking or external requests

> **Note:** Shorts appearing directly in YouTube Search results cannot currently be hidden. Regular videos from blocked channels are still hidden normally.

### Currently Blocked

```text
@MrBeast
@MrBeastGaming
@BeastReacts
@BeastPhilanthropy
@MrBeast2
@BeastAnimations
```

---

## ⚙️ Customize

Want to block another channel?

Open the userscript and find:

```javascript
const BLOCKED_HANDLES = new Set([
    "mrbeast",
    "mrbeastgaming",
    "beastreacts",
    "beastphilanthropy",
    "mrbeast2",
    "beastanimations"
]);
```

Add the channel handle without the `@`:

```javascript
"examplechannel"
```

---

## 🔒 Privacy

MrBeast Video Blocker runs entirely in your browser.

- No data collection
- No tracking
- No external APIs
- No account required
- No external requests

---

## ⚠️ Disclaimer

MrBeast Video Blocker is an **unofficial userscript**.

It is **not affiliated with, endorsed by, or sponsored by YouTube, Google, or MrBeast**.

YouTube is a trademark of Google LLC.

---

## 📦 Project

**Version:** `1.0` · **License:** [MIT](LICENSE) · **Author:** [PorkSandwitch](https://github.com/PorkSandwitch)

[⭐ View the repository](https://github.com/PorkSandwitch/MrBeast-Video-Blocker)
