// ==UserScript==
// @name         Auto Check Username Instagram (Bypass CSP)
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  Auto Check Username với tính năng Random hoặc qua văn bản cần kiểm tra, Bypass CSP gọi Telegram API
// @author       tn2am x Gemini
// @match        https://accountscenter.instagram.com/profiles/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // 1. DỌN DẸP BẢNG CŨ
    const existingUI = document.getElementById('nam-checker-ui');
    if (existingUI) existingUI.remove();

    // 2. TẠO GIAO DIỆN (UI)
    const ui = document.createElement('div');
    ui.id = 'nam-checker-ui';
    ui.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; width: 340px;
        background: #1e1e1e; color: #ecf0f1; z-index: 999999; padding: 15px;
        border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        font-family: Arial, sans-serif; font-size: 13px; border: 1px solid #333;
    `;

    ui.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #3498db; text-align: center;">🚀 Auto Check Username Instagram</h3>

        <label>Chế độ:</label>
        <select id="ui-mode" style="width:100%; background: #2c3e50; color:white; border:none; padding:5px; margin-bottom:8px; border-radius:4px;">
            <option value="auto" selected>1 - Tự động sinh (Mặc định)</option>
            <option value="user">2 - Dùng danh sách / File TXT</option>
        </select>

        <div id="ui-user-block" style="display:none;">
            <label style="color: #f1c40f; font-weight:bold;">Tải file .txt lên:</label>
            <input type="file" id="ui-file-upload" accept=".txt" style="width: 100%; margin-bottom: 5px; color: white;">

            <label>Hoặc nhập danh sách (Mỗi dòng 1 tên):</label>
            <textarea id="ui-usernames" style="width: 100%; height: 60px; background: #2c3e50; color: white; border: none; padding: 5px; margin-bottom: 10px; border-radius: 4px;" placeholder="ten_so_1\nten_so_2"></textarea>
        </div>

        <div id="ui-auto-block">
            <label>Kiểu sinh:</label>
            <select id="ui-gen-type" style="width:100%; background:#2c3e50; color:white; border:none; padding:5px; margin-bottom:8px; border-radius:4px;">
                <option value="random" selected>Random (Ngẫu nhiên - Khuyên dùng)</option>
                <option value="sequence">Sequence (Theo thứ tự từ điển)</option>
            </select>

            <div style="display:flex; gap:8px; margin-bottom:8px;">
                <div style="flex:1;">
                    <label>Độ dài tối thiểu:</label>
                    <input id="ui-min-len" type="number" value="4" min="1" style="width:100%; background:#2c3e50; color:white; border:none; padding:5px; border-radius:4px;">
                </div>
                <div style="flex:1;">
                    <label>Độ dài tối đa:</label>
                    <input id="ui-max-len" type="number" value="6" min="1" style="width:100%; background:#2c3e50; color:white; border:none; padding:5px; border-radius:4px;">
                </div>
            </div>

            <label>Số lượng sinh (0 = Chạy vô hạn):</label>
            <input id="ui-count" type="number" value="0" min="0" style="width:100%; background:#2c3e50; color:white; border:none; padding:5px; margin-bottom:8px; border-radius:4px;">
        </div>

        <label>Telegram Bot Token (Tùy chọn):</label>
        <input type="text" id="ui-tele-token" style="width: 100%; background: #2c3e50; color: white; border: none; padding: 5px; margin-bottom: 5px; border-radius: 4px;">

        <label>Telegram Chat ID:</label>
        <input type="text" id="ui-tele-chatid" style="width: 100%; background: #2c3e50; color: white; border: none; padding: 5px; margin-bottom: 10px; border-radius: 4px;">

        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <input id="ui-send-file-tele" type="checkbox" style="margin-right:6px;" />
            <label for="ui-send-file-tele">Gửi file kết quả lên Tele khi dừng</label>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button id="ui-btn-start" style="flex: 1; background: #2ecc71; border: none; color: white; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold;">▶ Bắt đầu</button>
            <button id="ui-btn-stop" style="flex: 1; background: #e74c3c; border: none; color: white; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold;" disabled>⏹ Dừng & Lưu file</button>
        </div>

        <div id="ui-status" style="background: #000; padding: 8px; border-radius: 4px; color: #f1c40f; text-align: center; font-weight: bold;">Trạng thái: Sẵn sàng</div>
    `;

    document.body.appendChild(ui);

    // 3. BIẾN TOÀN CỤC & TRẠNG THÁI
    let isRunning = false;
    let successList = [];
    let failList = [];
    let rawUsernames = [];
    let currentIndex = 0;

    document.getElementById('ui-file-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('ui-usernames').value = event.target.result;
            document.getElementById('ui-status').innerHTML = `<span style='color:#2ecc71;'>Đã tải file: ${file.name}</span>`;
        };
        reader.readAsText(file);
    });

    // Hàm gửi tin nhắn Telegram (Dùng GM_xmlhttpRequest bypass CSP)
    function sendTelegramMessage(token, chatId, message) {
        return new Promise((resolve, reject) => {
            if (!token || !chatId) return resolve();
            GM_xmlhttpRequest({
                method: "POST",
                url: `https://api.telegram.org/bot${token}/sendMessage`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
                onload: (res) => resolve(res.responseText),
                onerror: (err) => {
                    console.error("Lỗi gửi Telegram (Text):", err);
                    reject(err);
                }
            });
        });
    }

    // Gửi file (document) lên Telegram (Dùng GM_xmlhttpRequest)
    function sendTelegramFile(token, chatId, blob, filename) {
        return new Promise((resolve, reject) => {
            if (!token || !chatId) return resolve();
            const form = new FormData();
            form.append('chat_id', chatId);
            form.append('document', blob, filename);

            GM_xmlhttpRequest({
                method: "POST",
                url: `https://api.telegram.org/bot${token}/sendDocument`,
                data: form,
                onload: (res) => resolve(res.responseText),
                onerror: (err) => {
                    console.error('Lỗi gửi file Telegram:', err);
                    reject(err);
                }
            });
        });
    }

    const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789._'.split('');

    function generateRandomName(minLen, maxLen) {
        const targetLen = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
        let s = '';
        for(let i = 0; i < targetLen; i++){
            s += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        return s;
    }

    function* sequenceGenerator(minLen, maxLen) {
        for (let len = minLen; len <= maxLen; len++) {
            const idx = new Array(len).fill(0);
            while (true) {
                yield idx.map(i => CHARS[i]).join('');
                let pos = len - 1;
                while (pos >= 0) {
                    idx[pos]++;
                    if (idx[pos] < CHARS.length) break;
                    idx[pos] = 0;
                    pos--;
                }
                if (pos < 0) break;
            }
        }
    }

    async function downloadResults() {
        let content = "=== DANH SÁCH TÊN ĐẶT ĐƯỢC (THÀNH CÔNG) ===\n";
        content += successList.length > 0 ? successList.join("\n") : "(Không có tên nào)";

        content += "\n\n=== DANH SÁCH ĐÃ BỊ TRÙNG (THẤT BẠI) ===\n";
        content += failList.length > 0 ? failList.join("\n") : "(Không có tên nào)";

        const mode = document.getElementById('ui-mode').value;
        if (mode === 'user') {
            const uncheckedList = rawUsernames.slice(currentIndex);
            content += "\n\n=== DANH SÁCH CHƯA KIỂM TRA ===\n";
            content += uncheckedList.length > 0 ? uncheckedList.join("\n") : "(Đã kiểm tra hết toàn bộ)";
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);

        const now = new Date();
        const timeStr = `${now.getHours()}h${now.getMinutes()}p_${now.getDate()}-${now.getMonth()+1}`;
        a.download = `KetQua_Username_${timeStr}.txt`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        try {
            const sendFile = document.getElementById('ui-send-file-tele') && document.getElementById('ui-send-file-tele').checked;
            const token = document.getElementById('ui-tele-token').value.trim();
            const chatId = document.getElementById('ui-tele-chatid').value.trim();
            if (sendFile && token && chatId) {
                const blobCopy = blob.slice(0, blob.size, blob.type);
                await sendTelegramFile(token, chatId, blobCopy, a.download);
            }
        } catch (e) {
            console.error('Không thể gửi file tự động qua GM_xmlhttpRequest:', e);
        }
    }

    async function runChecker() {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const xpathSelector = "/html/body/div[1]/div/div/div/div/div[4]/div/div/div[2]/div/div/div/div/div/div/div/div[2]/div[2]/div[3]/div/div/div[4]/div/div/div[1]/input";
        const usernameInput = document.evaluate(xpathSelector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const statusDiv = document.getElementById('ui-status');

        if (!usernameInput) {
            statusDiv.innerHTML = "<span style='color:red;'>LỖI: Chưa mở bảng nhập Username!</span>";
            return;
        }

        const token = document.getElementById('ui-tele-token').value.trim();
        const chatId = document.getElementById('ui-tele-chatid').value.trim();

        successList = [];
        failList = [];
        currentIndex = 0;
        isRunning = true;

        document.getElementById('ui-btn-start').disabled = true;
        document.getElementById('ui-btn-stop').disabled = false;

        function setReactInputValue(input, value) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const mode = document.getElementById('ui-mode').value;

        if (mode === 'user') {
            rawUsernames = document.getElementById('ui-usernames').value.split('\n').map(n => n.trim()).filter(n => n !== '');
            if (rawUsernames.length === 0) {
                statusDiv.innerHTML = "<span style='color:red;'>Chưa nhập danh sách!</span>";
                isRunning = false;
                document.getElementById('ui-btn-start').disabled = false;
                document.getElementById('ui-btn-stop').disabled = true;
                return;
            }

            for (; currentIndex < rawUsernames.length; currentIndex++) {
                if (!isRunning) break;
                const currentName = rawUsernames[currentIndex];
                statusDiv.innerHTML = `Đang check: <b>${currentName}</b> (${currentIndex + 1}/${rawUsernames.length})`;

                setReactInputValue(usernameInput, currentName);

                const delay = 4000 + Math.floor(Math.random() * 1000);
                await sleep(delay);

                let isSuccess = false;
                const inputContainer = usernameInput.parentElement.parentElement;
                const iconSVG = inputContainer.querySelector('svg');

                if (iconSVG) {
                    const containerText = inputContainer.innerText.toLowerCase();
                    const hasErrorText = containerText.includes("isn't available") || containerText.includes("không khả dụng") || containerText.includes("chứa ký tự");
                    const iconColor = window.getComputedStyle(iconSVG).color || "";
                    const isRedIcon = iconColor.includes('rgb(255') || iconColor.includes('rgb(237');

                    if (!hasErrorText && !isRedIcon) isSuccess = true;
                }

                if (isSuccess) {
                    successList.push(currentName);
                    console.log(`%c[XANH] ✅ ${currentName}`, "color: #2ecc71;");
                    if (token && chatId) {
                        await sendTelegramMessage(token, chatId, `✅ <b>TÊN ĐẸP KHÔNG AI TRÙNG:</b>\n👉 <code>${currentName}</code>`);
                    }
                } else {
                    failList.push(currentName);
                    console.log(`%c[ĐỎ] ❌ ${currentName}`, "color: #e74c3c;");
                }
            }
        } else {
            const genType = document.getElementById('ui-gen-type').value;
            const minLen = parseInt(document.getElementById('ui-min-len').value, 10) || 4;
            const maxLen = parseInt(document.getElementById('ui-max-len').value, 10) || 6;
            const totalCount = parseInt(document.getElementById('ui-count').value, 10) || 0;

            let generated = 0;
            const seen = new Set();
            const seqIter = genType === 'sequence' ? sequenceGenerator(minLen, maxLen) : null;

            while (isRunning) {
                if (totalCount > 0 && generated >= totalCount) break;

                let currentName;
                if (genType === 'random') {
                    let tries = 0;
                    do {
                        currentName = generateRandomName(minLen, maxLen);
                        tries++;
                    } while (seen.has(currentName) && tries < 10);
                } else {
                    const nxt = seqIter.next();
                    if (nxt.done) break;
                    currentName = nxt.value;
                }

                if (!currentName) break;
                seen.add(currentName);

                generated++;
                statusDiv.innerHTML = `Đang check: <b>${currentName}</b> (${generated}/${totalCount || '∞'})`;

                setReactInputValue(usernameInput, currentName);

                const delay = 4000 + Math.floor(Math.random() * 1000);
                await sleep(delay);

                let isSuccess = false;
                const inputContainer = usernameInput.parentElement.parentElement;
                const iconSVG = inputContainer.querySelector('svg');

                if (iconSVG) {
                    const containerText = inputContainer.innerText.toLowerCase();
                    const hasErrorText = containerText.includes("isn't available") || containerText.includes("không khả dụng") || containerText.includes("chứa ký tự");
                    const iconColor = window.getComputedStyle(iconSVG).color || "";
                    const isRedIcon = iconColor.includes('rgb(255') || iconColor.includes('rgb(237');

                    if (!hasErrorText && !isRedIcon) isSuccess = true;
                }

                if (isSuccess) {
                    successList.push(currentName);
                    console.log(`%c[XANH] ✅ ${currentName}`, "color: #2ecc71;");
                    if (token && chatId) {
                        await sendTelegramMessage(token, chatId, `✅ <b>TÊN ĐẸP KHÔNG AI TRÙNG:</b>\n👉 <code>${currentName}</code>`);
                    }
                } else {
                    failList.push(currentName);
                    console.log(`%c[ĐỎ] ❌ ${currentName}`, "color: #e74c3c;");
                }
            }
        }

        if (isRunning) {
            isRunning = false;
            statusDiv.innerHTML = "<span style='color:#2ecc71;'>Đã quét xong! Đang xuất file...</span>";
            await downloadResults();
        }

        document.getElementById('ui-btn-start').disabled = false;
        document.getElementById('ui-btn-stop').disabled = true;
    }

    document.getElementById('ui-btn-start').addEventListener('click', runChecker);

    document.getElementById('ui-btn-stop').addEventListener('click', async () => {
        if (isRunning) {
            isRunning = false;
            document.getElementById('ui-status').innerHTML = "<span style='color:#e67e22;'>Đã dừng! Đang gửi/xuất báo cáo...</span>";
            await downloadResults();

            document.getElementById('ui-btn-start').disabled = false;
            document.getElementById('ui-btn-stop').disabled = true;
        }
    });

    const modeSelect = document.getElementById('ui-mode');
    const userBlock = document.getElementById('ui-user-block');
    const autoBlock = document.getElementById('ui-auto-block');
    function updateModeUI() {
        if (modeSelect.value === 'auto') {
            userBlock.style.display = 'none';
            autoBlock.style.display = 'block';
        } else {
            userBlock.style.display = 'block';
            autoBlock.style.display = 'none';
        }
    }
    modeSelect.addEventListener('change', updateModeUI);
    updateModeUI();

})();