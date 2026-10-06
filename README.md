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
<img src="https://img.shields.io/badge/INSTALL-7c3aed?style=for-the-badge" alt="Install">
</a>

Then click **Install** in Violentmonkey.

That's it. 🎉

### 🧪 Beta — Shorts Support

Want Shorts hidden too? Try the beta version:

<a href="https://raw.githubusercontent.com/PorkSandwitch/MrBeast-Video-Blocker/main/mrbeast-video-blocker-beta.user.js">
<img src="https://img.shields.io/badge/BETA%20%7C%20HIDES%20SHORTS-7c3aed?style=for-the-badge" alt="Beta - Hides Shorts">
</a>

> ⚠️ Beta version — may have bugs or changes before becoming stable.

---

## ✨ Features

- 🚫 Hides videos from selected MrBeast channels
- 🏠 Works on YouTube Home
- 🔎 Works on Search results
- 📺 Works on Subscriptions
- 🔄 Handles dynamically loaded videos
- ⚡ Lightweight and runs locally
- 🔒 No tracking or external requests

> **Note:** Shorts are not hidden by the stable version. Use the **Beta** version above if you want Shorts hidden too.

### Currently Blocked

```text
@MrBeast
@MrBeastGaming
@BeastReacts
@BeastPhilanthropy
@MrBeast2
@BeastAnimations
@MrBeastClips
@MrBeastHindi
@MrBeastBrasil
@MrBeastGamingBrasil
@MrBeastEnEspanol
@MrBeastGamingEspanol
@BeastReactsEspanol
@MrBeastEnFrancais
@MrBeastJapan
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

MrBeast Video Blocker runs in your browser.

- No data collection
- No tracking
- No account required

---

## ⚠️ Disclaimer

MrBeast Video Blocker is an **unofficial userscript**.

It is **not affiliated with, endorsed by, or sponsored by YouTube, Google, or MrBeast**.

YouTube is a trademark of Google LLC.

---

## 📦 Project

**Version:** `1.0` · **License:** [MIT](LICENSE) · **Author:** [PorkSandwitch](https://github.com/PorkSandwitch)

[⭐ View the repository](https://github.com/PorkSandwitch/MrBeast-Video-Blocker)
