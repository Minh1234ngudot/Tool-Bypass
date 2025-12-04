// ==UserScript==
// @name         Link4m Tool Bypass
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bypass-link4m
// @author       SigmaBou_VN
// @match        https://link4m.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Minh1234ngudot/-/refs/heads/main/Code';
    const LOGO_URL = 'https://i.pinimg.com/736x/59/4f/e8/594fe82da47f9bb9f66f15cf76571172.jpg';
    const STORAGE_KEY = 'bypassLink4mSettings';

    const defaultSettings = {
        delayTime: 0,
        autoBypass: false,
        panelLeft: 10,
        panelTop: 10,
        minimized: true
    };

    let settings = { ...defaultSettings };
    let panel, bypassExecuted = false;
    let countdownInterval;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) settings = { ...settings, ...JSON.parse(saved) };
    } catch (e) {}

    document.getElementById('bypass-control-panel-minimal')?.remove();

    const CSS = `
    #bypass-control-panel-minimal {
        position:fixed;z-index:10000;background:#fff;border:1px solid #e0e0e0;border-radius:10px;
        padding:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-family:'Segoe UI',system-ui,sans-serif;
        width:300px;box-sizing:border-box;transition:all .3s ease;user-select:none;
    }
    #bypass-control-panel-minimal.minimized{width:200px;height:40px;padding:8px 10px;}
    #bypass-control-panel-minimal.minimized #panel-content{display:none!important;}
    #panel-header{display:flex;justify-content:space-between;align-items:center;cursor:grab;height:24px;}
    .header-left{display:flex;align-items:center;gap:8px;flex:1;}
    #panel-icon{width:24px;height:24px;border-radius:4px;object-fit:cover;}
    #panel-title{font-weight:600;font-size:13px;color:#333;line-height:1;margin:0;padding:0;display:flex;align-items:center;height:24px;}
    #toggle-btn{background:none;border:none;font-size:16px;cursor:pointer;padding:0;width:20px;height:20px;color:#666;border-radius:3px;display:flex;align-items:center;justify-content:center;transition:all .2s ease;margin:0;}
    #toggle-btn:hover{background:#f0f0f0;}
    #panel-content{margin-top:5px;}
    .settings-section{margin-bottom:8px;padding:8px;background:#f8f9fa;border-radius:6px;border:1px solid #e9ecef;}
    .setting-item{display:flex;justify-content:space-between;align-items:center;margin:0;font-size:11px;color:#333;height:20px;}
    .setting-label{display:flex;align-items:center;gap:6px;}
    .setting-switch{position:relative;display:inline-block;width:30px;height:16px;}
    .setting-switch input{opacity:0;width:0;height:0;}
    .setting-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#ccc;transition:.4s;border-radius:16px;}
    .setting-slider:before{position:absolute;content:"";height:12px;width:12px;left:2px;bottom:2px;background:#fff;transition:.4s;border-radius:50%;}
    input:checked + .setting-slider{background:#4caf50;}
    input:checked + .setting-slider:before{transform:translateX(14px);}
    .delay-section{margin-bottom:10px;padding:10px 8px 8px;background:#f8f9fa;border-radius:6px;border:1px solid #e9ecef;}
    .delay-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;color:#333;}
    .delay-value{font-weight:600;color:#d32f2f;font-size:12px;}
    .delay-slider{width:100%;height:6px;border-radius:3px;background:#ddd;outline:none;-webkit-appearance:none;margin:2px 0;}
    .delay-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#d32f2f;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
    .delay-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#d32f2f;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
    #bypass-btn{width:100%;padding:12px;background:#d32f2f;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;margin-bottom:8px;transition:background .2s ease;font-size:14px;}
    #bypass-btn:hover{background:#b71c1c;}
    #bypass-btn:disabled{background:#ccc;cursor:not-allowed;}
    #bypass-btn.countdown{background:#ff9800;}
    #status{font-size:11px;color:#666;background:#f8f9fa;padding:6px 8px;border-radius:5px;margin-bottom:8px;border:1px solid #e9ecef;min-height:20px;display:flex;align-items:center;}
    .panel-footer{display:flex;gap:6px;}
    .footer-btn{flex:1;padding:6px;border:1px solid #ddd;background:#f9f9f9;border-radius:5px;cursor:pointer;font-size:11px;transition:background .2s ease;height:28px;display:flex;align-items:center;justify-content:center;}
    .footer-btn:hover{background:#e9ecef;}
    `;

    GM_addStyle(CSS);

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    function createPanel() {
        panel = document.createElement('div');
        panel.id = 'bypass-control-panel-minimal';
        panel.style.left = settings.panelLeft + 'px';
        panel.style.top = settings.panelTop + 'px';

        panel.innerHTML = `
            <div id="panel-header">
                <div class="header-left">
                    <img id="panel-icon" src="${LOGO_URL}" alt="Logo">
                    <span id="panel-title">Link4m Tool Bypass (SigmaBou_VN)</span>
                </div>
                <button id="toggle-btn">${settings.minimized ? '+' : '−'}</button>
            </div>
            <div id="panel-content">
                <div class="delay-section">
                    <div class="delay-label">
                        <span>Thời Gian Delay:</span>
                        <span class="delay-value" id="delay-value">${settings.delayTime} Giây</span>
                    </div>
                    <input type="range" min="0" max="100" value="${settings.delayTime}" class="delay-slider" id="delay-slider">
                </div>
                <div class="settings-section">
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Auto Bypass</span>
                        </div>
                        <label class="setting-switch">
                            <input type="checkbox" id="auto-bypass" ${settings.autoBypass ? 'checked' : ''}>
                            <span class="setting-slider"></span>
                        </label>
                    </div>
                </div>
                <div id="status">Sẵn Sàng...</div>
                <button id="bypass-btn">KÍCH HOẠT BYPASS</button>
                <div class="panel-footer">
                    <button class="footer-btn" id="reload-btn">Tải Lại</button>
                    <button class="footer-btn" id="help-btn">Hướng Dẫn</button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    function makeDraggable(elem, handle) {
        let dragging = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;

        function startDrag(e) {
            if (e.target.id === 'toggle-btn' || e.target.closest('#toggle-btn')) return;
            e.preventDefault();
            e.stopPropagation();
            dragging = true;

            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            startX = clientX;
            startY = clientY;

            const rect = elem.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;

            elem.style.transition = 'none';
            handle.style.cursor = 'grabbing';

            document.addEventListener('mousemove', drag, { passive: false });
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', stopDrag, { passive: false });
            document.addEventListener('touchend', stopDrag, { passive: false });
        }

        function drag(e) {
            if (!dragging) return;
            e.preventDefault();
            e.stopPropagation();

            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const dx = clientX - startX;
            const dy = clientY - startY;

            let left = Math.max(6, Math.min(origLeft + dx, window.innerWidth - elem.offsetWidth - 6));
            let top = Math.max(6, Math.min(origTop + dy, window.innerHeight - elem.offsetHeight - 6));

            elem.style.left = left + 'px';
            elem.style.top = top + 'px';
            elem.style.right = 'auto';
            elem.style.bottom = 'auto';

            settings.panelLeft = left;
            settings.panelTop = top;
        }

        function stopDrag() {
            dragging = false;
            elem.style.transition = '';
            handle.style.cursor = 'grab';
            saveSettings();

            ['mousemove', 'touchmove', 'mouseup', 'touchend'].forEach(event => {
                document.removeEventListener(event, drag);
                document.removeEventListener(event, stopDrag);
            });
        }

        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag);
    }

    function setupMinimize() {
        const toggleBtn = document.getElementById('toggle-btn');
        
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            togglePanel();
        });

        document.getElementById('panel-header').addEventListener('dblclick', function(e) {
            if (e.target.id === 'toggle-btn' || e.target.closest('#toggle-btn')) return;
            e.stopPropagation();
            togglePanel();
        });

        function togglePanel() {
            const isMinimized = panel.classList.contains('minimized');
            panel.classList.toggle('minimized');
            toggleBtn.textContent = isMinimized ? '−' : '+';
            settings.minimized = !isMinimized;
            saveSettings();
        }
    }

    function setupControls() {
        const slider = document.getElementById('delay-slider');
        const delayValue = document.getElementById('delay-value');
        const autoBypass = document.getElementById('auto-bypass');

        slider.addEventListener('input', function() {
            const seconds = parseInt(this.value);
            delayValue.textContent = seconds + ' Giây';
            settings.delayTime = seconds;
            saveSettings();
        });

        autoBypass.addEventListener('change', function() {
            settings.autoBypass = this.checked;
            saveSettings();
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (!e.ctrlKey) return;
            
            const keyActions = {
                'b': () => !bypassExecuted && document.getElementById('bypass-btn')?.click(),
                'r': () => window.location.reload(),
                'h': () => document.getElementById('help-btn')?.click(),
                'm': () => document.getElementById('toggle-btn')?.click()
            };

            if (keyActions[e.key]) {
                e.preventDefault();
                keyActions[e.key]();
            }
        });
    }

    function checkAutoBypass() {
        if (settings.autoBypass) {
            setTimeout(() => !bypassExecuted && executeBypass(), 1000);
        }
    }

    function executeBypass() {
        if (bypassExecuted) return;
        bypassExecuted = true;

        const btn = document.getElementById('bypass-btn');
        const status = document.getElementById('status');
        const delaySeconds = settings.delayTime;

        if (delaySeconds > 0) {
            btn.disabled = true;
            btn.classList.add('countdown');

            let remaining = delaySeconds;
            status.textContent = `⏳ Đang Đợi ${remaining} Giây...`;

            countdownInterval = setInterval(() => {
                remaining--;
                status.textContent = `⏳ Đang Đợi ${remaining} Giây...`;
                btn.textContent = `ĐỢI ${remaining}s`;

                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                    performBypass();
                }
            }, 1000);
        } else {
            performBypass();
        }
    }

    function performBypass() {
        const btn = document.getElementById('bypass-btn');
        const status = document.getElementById('status');

        btn.disabled = true;
        btn.textContent = 'ĐANG BYPASS...';
        status.textContent = '🔄 Đang Bypass Vui Lòng Đợi Một Chút...';

        GM_xmlhttpRequest({
            method: "GET",
            url: GITHUB_RAW_URL,
            onload: function(res) {
                if (res.status === 200) {
                    try {
                        unsafeWindow.eval(res.responseText);
                        status.textContent = '✅ Bypass Thành Công!';
                        btn.textContent = 'THÀNH CÔNG';
                        btn.style.background = '#4caf50';
                    } catch (e) {
                        status.textContent = '❌ Lỗi Khi Bypass Vui Lòng Thử Lại';
                        btn.textContent = 'LỖI';
                        btn.style.background = '#ff9800';
                    }
                } else {
                    status.textContent = '❌ Lỗi Tải Trang: ' + res.status;
                    btn.textContent = 'LỖI TẢI';
                    btn.style.background = '#f44336';
                }
                resetButton();
            },
            onerror: function() {
                status.textContent = '❌ Lỗi Kết Nối';
                btn.textContent = 'LỖI MẠNG';
                btn.style.background = '#f44336';
                resetButton();
            }
        });
    }

    function resetButton() {
        const btn = document.getElementById('bypass-btn');
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'KÍCH HOẠT BYPASS';
            btn.style.background = '';
            btn.classList.remove('countdown');
            bypassExecuted = false;
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }, 3000);
    }

    function showHelp() {
        alert(`HƯỚNG DẪN SỬ DỤNG Link4m Tool Bypass

1. Auto Bypass: Tự Động Bypass Khi Vào Trang

2. Điều Chỉnh Thanh Thời Gian: Đợi Bypass (0-100 Giây)

3. Phím Tắt:
   - Ctrl+B: Kích Hoạt Bypass
   - Ctrl+R: Reload Trang
   - Ctrl+H: Hiện Hướng Dẫn
   - Ctrl+M: Thu/Phóng Tool

4. Bấm "Tải Lại" Để Reload Trang

5. Kéo Tool Để Di Chuyển Tool

Phiên Bản 1.0 - By SigmaBou_VN`);
    }

    function init() {
        panel = createPanel();
        const header = document.getElementById('panel-header');

        if (settings.minimized) {
            panel.classList.add('minimized');
        } else {
            panel.classList.remove('minimized');
        }

        makeDraggable(panel, header);
        setupMinimize();
        setupControls();
        setupKeyboardShortcuts();

        document.getElementById('bypass-btn').addEventListener('click', e => {
            e.stopPropagation();
            executeBypass();
        });

        document.getElementById('reload-btn').addEventListener('click', e => {
            e.stopPropagation();
            window.location.reload();
        });

        document.getElementById('help-btn').addEventListener('click', e => {
            e.stopPropagation();
            showHelp();
        });

        checkAutoBypass();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();