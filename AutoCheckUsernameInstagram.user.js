// ==UserScript==
// @name         Auto Check Username Instagram (Bypass CSP) - Pro UI
// @namespace    http://tampermonkey.net/
// @version      5.2
// @description  Auto Check Username với tính năng Random hoặc qua văn bản cần kiểm tra, Bypass CSP gọi Telegram API. Giao diện mượt mà, hỗ trợ bật/tắt lưu file.
// @author       tn2am x Gemini
// @match        https://accountscenter.instagram.com/profiles/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // 1. DỌN DẸP BẢNG CŨ VÀ CSS CŨ
    const existingUI = document.getElementById('nam-checker-ui');
    if (existingUI) existingUI.remove();
    const existingStyle = document.getElementById('nam-checker-style');
    if (existingStyle) existingStyle.remove();

    // 2. THÊM CSS ĐỂ GIAO DIỆN CHUYÊN NGHIỆP, CÔNG NGHỆ HƠN
    const style = document.createElement('style');
    style.id = 'nam-checker-style';
    style.innerHTML = `
        #nam-checker-ui {
            position: fixed; bottom: 20px; right: 20px; width: 360px;
            background: rgba(20, 24, 36, 0.95); backdrop-filter: blur(12px);
            color: #e2e8f0; z-index: 999999; padding: 20px;
            border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px; border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        #nam-checker-ui h3 {
            margin: 0 0 15px 0; color: #00d2ff; text-align: center;
            font-size: 16px; font-weight: 600; letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        #nam-checker-ui label {
            display: block; margin-bottom: 5px; color: #94a3b8; font-weight: 500; font-size: 12px;
        }
        #nam-checker-ui input[type="text"], #nam-checker-ui input[type="number"], 
        #nam-checker-ui select, #nam-checker-ui textarea, #nam-checker-ui input[type="file"] {
            width: 100%; background: rgba(255, 255, 255, 0.05); color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.15); padding: 8px 10px;
            margin-bottom: 12px; border-radius: 8px; outline: none;
            box-sizing: border-box; transition: border 0.2s;
        }
        #nam-checker-ui input:focus, #nam-checker-ui select:focus, #nam-checker-ui textarea:focus {
            border-color: #00d2ff; background: rgba(255, 255, 255, 0.08);
        }
        #nam-checker-ui textarea { resize: vertical; min-height: 60px; }
        
        /* Checkbox styling */
        .cyber-checkbox-wrapper {
            display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
        }
        .cyber-checkbox-wrapper input[type="checkbox"] {
            width: 16px; height: 16px; accent-color: #00d2ff; cursor: pointer; margin: 0;
        }
        .cyber-checkbox-wrapper label { margin-bottom: 0; cursor: pointer; color: #cbd5e1; }

        /* Button styling */
        .cyber-btn {
            flex: 1; border: none; color: white; padding: 10px; border-radius: 8px;
            cursor: pointer; font-weight: bold; text-transform: uppercase; font-size: 12px;
            transition: all 0.2s ease; display: flex; justify-content: center; align-items: center; gap: 5px;
        }
        #ui-btn-start { background: linear-gradient(135deg, #00c6ff, #0072ff); box-shadow: 0 4px 15px rgba(0, 114, 255, 0.3); }
        #ui-btn-start:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 114, 255, 0.5); }
        
        #ui-btn-stop { background: linear-gradient(135deg, #f85032, #e73827); box-shadow: 0 4px 15px rgba(231, 56, 39, 0.3); }
        #ui-btn-stop:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(231, 56, 39, 0.5); }
        
        .cyber-btn:disabled { background: #334155 !important; color: #94a3b8 !important; cursor: not-allowed; box-shadow: none !important; transform: none !important; }

        #ui-status {
            background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 8px;
            color: #fbbf24; text-align: center; font-weight: bold; border: 1px dashed rgba(255,255,255,0.2);
            margin-top: 5px; word-break: break-all;
        }
    `;
    document.head.appendChild(style);

    // 3. TẠO GIAO DIỆN (UI)
    const ui = document.createElement('div');
    ui.id = 'nam-checker-ui';

    ui.innerHTML = `
        <h3>⚡ Auto Check Username</h3>

        <label>Chế độ kiểm tra:</label>
        <select id="ui-mode">
            <option value="auto" selected>1 - Tự động sinh (Khuyên dùng)</option>
            <option value="user">2 - Dùng danh sách / File TXT</option>
        </select>

        <div id="ui-user-block" style="display:none;">
            <label style="color: #fbd38d;">Tải file .txt lên:</label>
            <input type="file" id="ui-file-upload" accept=".txt">

            <label>Hoặc dán danh sách (Mỗi dòng 1 tên):</label>
            <textarea id="ui-usernames" placeholder="ten_so_1\nten_so_2"></textarea>
        </div>

        <div id="ui-auto-block">
            <label>Thuật toán sinh tên:</label>
            <select id="ui-gen-type">
                <option value="random" selected>Random (Ngẫu nhiên - Nên dùng)</option>
                <option value="sequence">Sequence (Tuần tự từ điển)</option>
            </select>

            <div style="display:flex; gap:12px;">
                <div style="flex:1;">
                    <label>Độ dài Min:</label>
                    <input id="ui-min-len" type="number" value="4" min="1">
                </div>
                <div style="flex:1;">
                    <label>Độ dài Max:</label>
                    <input id="ui-max-len" type="number" value="6" min="1">
                </div>
            </div>

            <label>Số lượng giới hạn (0 = Chạy vô hạn):</label>
            <input id="ui-count" type="number" value="0" min="0">
        </div>

        <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1); margin: 5px 0 15px 0;"></div>

        <label>Telegram Bot Token (Tùy chọn):</label>
        <input type="text" id="ui-tele-token" placeholder="123456789:AAH_xxx...">

        <label>Telegram Chat ID:</label>
        <input type="text" id="ui-tele-chatid" placeholder="ID của bạn hoặc Group">

        <div class="cyber-checkbox-wrapper">
            <input id="ui-send-file-tele" type="checkbox" />
            <label for="ui-send-file-tele">Gửi file báo cáo lên Telegram khi dừng</label>
        </div>

        <div class="cyber-checkbox-wrapper" style="margin-bottom: 15px;">
            <input id="ui-auto-save" type="checkbox" checked />
            <label for="ui-auto-save" style="color: #6ee7b7;">Tự động tải File (.txt) về máy khi xong</label>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button id="ui-btn-start" class="cyber-btn">▶ Bắt đầu</button>
            <button id="ui-btn-stop" class="cyber-btn" disabled>⏹ Dừng lại</button>
        </div>

        <div id="ui-status">Trạng thái: Sẵn sàng</div>
    `;

    document.body.appendChild(ui);

    // 4. BIẾN TOÀN CỤC & TRẠNG THÁI
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
            document.getElementById('ui-status').innerHTML = `<span style='color:#34d399;'>Đã tải: ${file.name}</span>`;
        };
        reader.readAsText(file);
    });

    // Hàm gửi tin nhắn Telegram
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

    // Gửi file (document) lên Telegram
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

    async function processResults() {
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

        // Tạo File Blob
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const now = new Date();
        const timeStr = `${now.getHours()}h${now.getMinutes()}p_${now.getDate()}-${now.getMonth()+1}`;
        const fileName = `KetQua_Username_${timeStr}.txt`;

        // Tính năng mới: Kiểm tra xem user có bật tự động tải file không
        const isAutoSave = document.getElementById('ui-auto-save').checked;
        if (isAutoSave) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        // Gửi Telegram (nếu có chọn)
        try {
            const sendFile = document.getElementById('ui-send-file-tele') && document.getElementById('ui-send-file-tele').checked;
            const token = document.getElementById('ui-tele-token').value.trim();
            const chatId = document.getElementById('ui-tele-chatid').value.trim();
            if (sendFile && token && chatId) {
                const blobCopy = blob.slice(0, blob.size, blob.type);
                await sendTelegramFile(token, chatId, blobCopy, fileName);
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
            statusDiv.innerHTML = "<span style='color:#ef4444;'>LỖI: Chưa mở bảng nhập Username!</span>";
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
                statusDiv.innerHTML = "<span style='color:#ef4444;'>Lỗi: Chưa nhập danh sách!</span>";
                isRunning = false;
                document.getElementById('ui-btn-start').disabled = false;
                document.getElementById('ui-btn-stop').disabled = true;
                return;
            }

            for (; currentIndex < rawUsernames.length; currentIndex++) {
                if (!isRunning) break;
                const currentName = rawUsernames[currentIndex];
                statusDiv.innerHTML = `Đang check:<br><span style="color:#00d2ff; font-size:15px;">${currentName}</span><br>(${currentIndex + 1}/${rawUsernames.length})`;

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
                statusDiv.innerHTML = `Đang check:<br><span style="color:#00d2ff; font-size:15px;">${currentName}</span><br>(${generated}/${totalCount || '∞'})`;

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
            statusDiv.innerHTML = "<span style='color:#34d399;'>Đã quét xong! Đang xuất dữ liệu...</span>";
            await processResults();
        }

        document.getElementById('ui-btn-start').disabled = false;
        document.getElementById('ui-btn-stop').disabled = true;
        statusDiv.innerHTML = "<span style='color:#34d399;'>Hoàn thành. Sẵn sàng!</span>";
    }

    document.getElementById('ui-btn-start').addEventListener('click', runChecker);

    document.getElementById('ui-btn-stop').addEventListener('click', async () => {
        if (isRunning) {
            isRunning = false;
            document.getElementById('ui-status').innerHTML = "<span style='color:#fbbf24;'>Đang dừng & Xử lý báo cáo...</span>";
            await processResults();

            document.getElementById('ui-btn-start').disabled = false;
            document.getElementById('ui-btn-stop').disabled = true;
            document.getElementById('ui-status').innerHTML = "<span style='color:#fbbf24;'>Đã dừng an toàn!</span>";
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
