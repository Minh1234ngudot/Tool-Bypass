// ==UserScript==
// @name         Bypass Link4m
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bypass-link4m
// @author       SigmaBou_VN
// @match        https://link4m.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Minh1234ngudot/-/refs/heads/main/Code';
    const LOGO_URL = 'https://i.pinimg.com/736x/59/4f/e8/594fe82da47f9bb9f66f15cf76571172.jpg';

    const existingPanel = document.getElementById('bypass-control-panel-minimal');
    if (existingPanel) existingPanel.remove();

    GM_addStyle(`
        #bypass-control-panel-minimal {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 10000;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', system-ui, sans-serif;
            width: 300px;
            box-sizing: border-box;
            transition: all 0.3s ease;
            user-select: none;
        }

        #bypass-control-panel-minimal.minimized {
            width: 200px;
            height: 40px;
            padding: 8px 10px;
        }

        #bypass-control-panel-minimal.minimized #panel-content {
            display: none !important;
        }

        #panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: grab;
            height: 24px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }

        #panel-icon {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            object-fit: cover;
        }

        #panel-title {
            font-weight: 600;
            font-size: 13px;
            color: #333;
            line-height: 1;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            height: 24px;
        }

        #toggle-btn {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            color: #666;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            margin: 0;
        }

        #toggle-btn:hover {
            background: #f0f0f0;
        }

        #panel-content {
            margin-top: 12px;
        }

        .delay-section {
            margin-bottom: 12px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }

        .delay-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            color: #333;
        }

        .delay-value {
            font-weight: 600;
            color: #d32f2f;
        }

        .delay-slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #ddd;
            outline: none;
            -webkit-appearance: none;
        }

        .delay-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #d32f2f;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .delay-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #d32f2f;
            cursor: pointer;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        #bypass-btn {
            width: 100%;
            padding: 12px;
            background: #d32f2f;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 10px;
            transition: background 0.2s ease;
        }

        #bypass-btn:hover {
            background: #b71c1c;
        }

        #bypass-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        #bypass-btn.countdown {
            background: #ff9800;
        }

        #status {
            font-size: 12px;
            color: #666;
            background: #f8f9fa;
            padding: 8px 10px;
            border-radius: 6px;
            margin-bottom: 10px;
            border: 1px solid #e9ecef;
        }

        .panel-footer {
            display: flex;
            gap: 8px;
        }

        .footer-btn {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            background: #f9f9f9;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s ease;
        }

        .footer-btn:hover {
            background: #e9ecef;
        }
    `);

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'bypass-control-panel-minimal';

        panel.innerHTML = `
            <div id="panel-header">
                <div class="header-left">
                    <img id="panel-icon" src="${LOGO_URL}" alt="Logo">
                    <span id="panel-title">Bypass Link4m (SigmaBou_VN)</span>
                </div>
                <button id="toggle-btn">+</button>
            </div>
            <div id="panel-content">
                <div class="delay-section">
                    <div class="delay-label">
                        <span>Thời Gian Delay:</span>
                        <span class="delay-value" id="delay-value">0 Giây</span>
                    </div>
                    <input type="range" min="0" max="100" value="0" class="delay-slider" id="delay-slider">
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

        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag);

        function startDrag(e) {
            if (e.target.id === 'toggle-btn' || e.target.closest('#toggle-btn')) {
                return;
            }

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

            let left = origLeft + dx;
            let top = origTop + dy;

            left = Math.max(6, Math.min(left, window.innerWidth - elem.offsetWidth - 6));
            top = Math.max(6, Math.min(top, window.innerHeight - elem.offsetHeight - 6));

            elem.style.left = left + 'px';
            elem.style.top = top + 'px';
            elem.style.right = 'auto';
            elem.style.bottom = 'auto';
            elem.style.position = 'fixed';
        }

        function stopDrag(e) {
            dragging = false;
            elem.style.transition = '';
            handle.style.cursor = 'grab';

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }

    function setupMinimize() {
        const toggleBtn = document.getElementById('toggle-btn');
        const panel = document.getElementById('bypass-control-panel-minimal');

        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            if (panel.classList.contains('minimized')) {
                panel.classList.remove('minimized');
                toggleBtn.textContent = '−';
            } else {
                panel.classList.add('minimized');
                toggleBtn.textContent = '+';
            }
        });

        const header = document.getElementById('panel-header');
        header.addEventListener('dblclick', function(e) {
            if (e.target === toggleBtn || e.target.closest('#toggle-btn')) {
                return;
            }
            e.stopPropagation();

            if (panel.classList.contains('minimized')) {
                panel.classList.remove('minimized');
                toggleBtn.textContent = '−';
            } else {
                panel.classList.add('minimized');
                toggleBtn.textContent = '+';
            }
        });
    }

    function setupDelaySlider() {
        const slider = document.getElementById('delay-slider');
        const delayValue = document.getElementById('delay-value');

        slider.addEventListener('input', function() {
            const seconds = parseInt(this.value);
            delayValue.textContent = seconds + ' Giây';
        });

        delayValue.textContent = slider.value + ' Giây';
    }

    function executeBypass() {
        const btn = document.getElementById('bypass-btn');
        const status = document.getElementById('status');
        const delaySeconds = parseInt(document.getElementById('delay-slider').value);

        if (delaySeconds > 0) {
            btn.disabled = true;
            btn.classList.add('countdown');

            let remaining = delaySeconds;
            status.textContent = `⏳ Đang Đợi ${remaining} Giây...`;

            const countdownInterval = setInterval(() => {
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
                        btn.classList.remove('countdown');
                    } catch (e) {
                        status.textContent = '❌ Lỗi Thực Hành Khi Bypass';
                        btn.textContent = 'LỖI';
                        btn.style.background = '#ff9800';
                        btn.classList.remove('countdown');
                    }
                } else {
                    status.textContent = '❌ Lỗi Tải Trang: ' + res.status;
                    btn.textContent = 'LỖI TẢI';
                    btn.style.background = '#f44336';
                    btn.classList.remove('countdown');
                }

                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'KÍCH HOẠT BYPASS';
                    btn.style.background = '';
                    btn.classList.remove('countdown');
                }, 3000);
            },
            onerror: function() {
                status.textContent = '❌ Lỗi Kết Nối';
                btn.textContent = 'LỖI MẠNG';
                btn.style.background = '#f44336';
                btn.classList.remove('countdown');

                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'KÍCH HOẠT BYPASS';
                    btn.style.background = '';
                    btn.classList.remove('countdown');
                }, 3000);
            }
        });
    }

    const panel = createPanel();
    const header = document.getElementById('panel-header');

    panel.classList.add('minimized');

    makeDraggable(panel, header);
    setupMinimize();
    setupDelaySlider();

    document.getElementById('bypass-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        executeBypass();
    });

    document.getElementById('reload-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.reload();
    });

    document.getElementById('help-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        alert(`
HƯỚNG DẪN SỬ DỤNG Bypass Link4m

1. Điều Chỉnh Slider Để Set Thời Gian Delay (0-100 Giây)
2. Bấm "KÍCH HOẠT BYPASS" - Nếu Có Delay Sẽ Đếm Ngược
3. Bấm "Tải Lại" Để Reload Trang
4. Bấm Nút "+,−" Để Phóng To/Thu Nhỏ Panel
5. Kéo Panel Để Di Chuyển Panel

Phiên Bản 1.0 - By SigmaBou_VN`);
    });

})();
