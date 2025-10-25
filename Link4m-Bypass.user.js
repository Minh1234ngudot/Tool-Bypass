// ==UserScript==
// @name         Bypass Link4m
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Bypass-link4m
// @author       Trieudzvcl
// @match        https://link4m.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ========== CONFIG ==========
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/ugphone839/bypass-link4m/refs/heads/main/Code';
    // Logo image you provided (will be loaded from this URL)
    const LOGO_URL = 'https://i.postimg.cc/Qxt5ND3S/IMG-3686.jpg';
    // If you prefer data URI (embedded), tell me and I will provide a version with base64 embedded.
    // ============================

    GM_addStyle(`
        /* Panel core */
        #bypass-control-panel-minimal {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 9999999;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.18);
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            width: 320px;
            max-width: calc(100% - 24px);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 8px;
            transition: transform 0.12s ease, opacity 0.12s ease;
            touch-action: none;
            -webkit-user-select: none;
        }
        #bypass-control-panel-minimal.minimized {
            height: 46px;
            width: 240px;
            overflow: visible;
        }

        /* Header */
        #panel-header {
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:8px;
            padding:6px;
            cursor: grab;
            background: linear-gradient(180deg,#ffffff,#fafafa);
            border-radius: 6px;
        }
        /* Left side: icon + title */
        #panel-header .panel-left { display:flex; align-items:center; gap:8px; flex:1; }
        #panel-icon-img { width:28px; height:28px; object-fit:cover; border-radius:6px; display:inline-block; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
        #panel-title { font-weight:700; font-size:13px; color:#222; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* Toggle button */
        #btn-toggle {
            background: none;
            border: none;
            font-size:20px;
            font-weight:700;
            cursor: pointer;
            padding: 2px 8px;
            line-height:1;
            color:#333;
        }

        /* Content */
        #panel-content { display:flex; flex-direction:column; gap:8px; transition: max-height 0.18s ease-out, opacity 0.18s; max-height: 120px; }
        .minimized #panel-content { max-height:0; opacity:0; padding:0; margin:0; }

        #btn-bypass {
            padding:10px 12px;
            border:none;
            border-radius:6px;
            cursor:pointer;
            font-weight:700;
            font-size:15px;
            width:100%;
            box-sizing:border-box;
            color:#fff;
            background:#dc3545;
            transition: background 0.12s;
        }
        #btn-bypass:hover { background:#c82333; }

        #status-line { font-size:12px; color:#333; background:#fff; padding:8px; border-radius:6px; border:1px solid #eee; }

        /* footer controls */
        #panel-footer { display:flex; gap:8px; justify-content:space-between; align-items:center; }
        #panel-footer button { padding:6px 8px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer; font-size:13px; }
    `);

    // Remove previously existing panel to avoid duplicates
    try { document.getElementById('bypass-control-panel-minimal')?.remove(); } catch(e){}

    function createMinimalControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'bypass-control-panel-minimal';
        panel.classList.add('minimized');

        // Header
        const header = document.createElement('div');
        header.id = 'panel-header';

        const left = document.createElement('div');
        left.className = 'panel-left';

        const img = document.createElement('img');
        img.id = 'panel-icon-img';
        img.src = LOGO_URL;
        img.alt = 'Logo';

        const title = document.createElement('div');
        title.id = 'panel-title';
        title.textContent = 'Bypass Link4m (Trieuskid)';

        left.appendChild(img);
        left.appendChild(title);

        const toggleButton = document.createElement('button');
        toggleButton.id = 'btn-toggle';
        toggleButton.textContent = '+';

        header.appendChild(left);
        header.appendChild(toggleButton);
        panel.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.id = 'panel-content';

        const status = document.createElement('div');
        status.id = 'status-line';
        status.textContent = 'Ready. Click to fetch bypass code (no auto-run).';

        const bypassBtn = document.createElement('button');
        bypassBtn.id = 'btn-bypass';
        bypassBtn.textContent = 'KÍCH HOẠT BYPASS';

        const footer = document.createElement('div');
        footer.id = 'panel-footer';
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Tải lại';
        const helpBtn = document.createElement('button');
        helpBtn.textContent = 'Hướng dẫn';
        footer.appendChild(copyBtn);
        footer.appendChild(helpBtn);

        content.appendChild(status);
        content.appendChild(bypassBtn);
        content.appendChild(footer);

        panel.appendChild(content);
        document.body.appendChild(panel);

        // Dragging support (pointer events)
        (function makeDraggable(elem, handle){
            let dragging=false, startX=0, startY=0, origLeft=0, origTop=0;
            handle.addEventListener('pointerdown', ev => {
                ev.preventDefault();
                dragging = true;
                handle.setPointerCapture(ev.pointerId);
                startX = ev.clientX; startY = ev.clientY;
                const rect = elem.getBoundingClientRect();
                origLeft = rect.left; origTop = rect.top;
                elem.style.transition = 'none';
            });
            window.addEventListener('pointermove', ev => {
                if(!dragging) return;
                const dx = ev.clientX - startX, dy = ev.clientY - startY;
                let left = origLeft + dx, top = origTop + dy;
                left = Math.max(6, Math.min(left, window.innerWidth - elem.offsetWidth - 6));
                top = Math.max(6, Math.min(top, window.innerHeight - elem.offsetHeight - 6));
                elem.style.left = left + 'px';
                elem.style.top = top + 'px';
                elem.style.right = 'auto';
                elem.style.bottom = 'auto';
                elem.style.position = 'fixed';
            });
            window.addEventListener('pointerup', ev => {
                dragging = false;
                elem.style.transition = '';
            });
        })(panel, header);

        // Execute bypass (fetch + eval)
        function executeBypass() {
            bypassBtn.disabled = true;
            bypassBtn.textContent = 'Đang tải...';
            status.textContent = 'Đang tải code từ GitHub...';

            GM_xmlhttpRequest({
                method: "GET",
                url: GITHUB_RAW_URL,
                onload: function(res) {
                    if(res.status === 200) {
                        const txt = res.responseText || '';
                        try {
                            // IMPORTANT: this executes remote code. Keep for compatibility with your original script.
                            unsafeWindow.eval(txt);
                            status.textContent = 'ezggezggezgg.';
                            bypassBtn.textContent = 'THÀNH CÔNG';
                            bypassBtn.style.background = '#28a745';
                        } catch(e) {
                            console.error('Run error:', e);
                            status.textContent = 'Lỗi khi chạy code: ' + (e.message || e);
                            bypassBtn.textContent = 'LỖI';
                            bypassBtn.style.background = '#ffc107';
                        }
                    } else {
                        status.textContent = 'Lỗi tải code (HTTP ' + res.status + ')';
                        bypassBtn.textContent = 'LỖI TẢI';
                        bypassBtn.style.background = '#dc3545';
                    }
                    setTimeout(()=>{ bypassBtn.disabled = false; bypassBtn.textContent = 'đang bypass'; bypassBtn.style.background = ''; }, 3500);
                },
                onerror: function(err) {
                    console.error('Request error', err);
                    status.textContent = 'Lỗi kết nối khi tải code.';
                    bypassBtn.textContent = 'LỖI KẾT NỐI';
                    bypassBtn.style.background = '#dc3545';
                    setTimeout(()=>{ bypassBtn.disabled = false; bypassBtn.textContent = 'KÍCH HOẠT BYPASS'; bypassBtn.style.background = ''; }, 3500);
                }
            });
        }

        bypassBtn.addEventListener('click', executeBypass);
        copyBtn.addEventListener('click', () => {
            // just refetch and show status
            status.textContent = 'Tải lại';
            bypassBtn.click();
        });
        helpBtn.addEventListener('click', () => {
            alert('Hướng dẫn:\n1) Bấm "địt mẹ mày');
        });

        // Toggle panel minimize
        toggleButton.addEventListener('click', () => {
            panel.classList.toggle('minimized');
            toggleButton.textContent = panel.classList.contains('minimized') ? '+' : '-';
        });

        // Also toggle when clicking header (except toggle button)
        header.addEventListener('click', (e) => {
            if(e.target && e.target.id === 'btn-toggle') return;
            // ignore clicks on buttons inside header
            if(e.target.closest('button')) return;
            // toggle
            panel.classList.toggle('minimized');
            toggleButton.textContent = panel.classList.contains('minimized') ? '+' : '-';
        });
    }

    createMinimalControlPanel();

})();
