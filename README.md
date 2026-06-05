[🇻🇳 Đọc bằng Tiếng Việt](./README-vi.md) | [🇺🇸 Read in English](./README.md)

# 🚀 Instagram Auto Username Checker
... (giữ nguyên phần tiếng Anh ở dưới)
# 🚀 Instagram Auto Username Checker

An automated Tampermonkey userscript to check and generate available Instagram usernames. 

## ⚙️ Installation (1-Click Install)

**Step 1:** Install the [Tampermonkey](https://www.tampermonkey.net/) extension for your web browser (Chrome, Edge, Firefox).

**Step 2:** Click the button below to automatically install the script:

[![Install Script](https://img.shields.io/badge/Install-Userscript-2ecc71?style=for-the-badge&logo=tampermonkey)](https://www.tampermonkey.net/script_installation.php#url=https://github.com/tn2am/instagram-username-checker/raw/refs/heads/main/AutoCheckUsernameInstagram.user.js)

---

## ✨ Features
- **Auto Generate:** Randomly generates usernames (4-6 characters) using alphabets, numbers, `.`, and `_`.
- **Custom List:** Upload a `.txt` file to check your specific list of usernames.
- **Bypass CSP:** Uses `GM_xmlhttpRequest` to bypass Content Security Policy.
- **Telegram Notification:** Automatically sends successful usernames and final `.txt` reports to your Telegram Bot.
- **Human-like Delay:** Adds jitter delays to prevent rate-limiting and bans.

## 📝 How to use
1. Go to your Meta Accounts Center (Instagram Profile section).
2. The UI will automatically pop up in the bottom right corner.
3. Choose your mode, configure length/quantity, and hit **Start**.
