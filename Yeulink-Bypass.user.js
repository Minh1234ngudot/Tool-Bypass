// ==UserScript==
// @name         MinhZ Bypass Yeulink
// @namespace    minhz.bypass.yeulink
// @version      1.0
// @description  MinhZ Bypass Yeulink
// @author       MinhZ
// @match        *://*/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function(){

GM_registerMenuCommand("Bypass Yeulink", ()=>{
  window.postMessage({type:"start_gift_listen"},"*");
});

const inject = document.createElement("script");
inject.textContent = `
(function(){

const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "width=device-width,initial-scale=1,maximum-scale=1";
document.head.appendChild(meta);

let giftCode  = null;
let giftToken = null;
let polling   = false;
let listening = false;
let stepTimer = null;
let lastCode  = null;

const fontLink = document.createElement("link");
fontLink.rel  = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = \`
  :root {
    --bg: #0e0e12;
    --surface: #18181f;
    --border: #2a2a35;
    --accent: #0df0c0;
    --accent2: #f0590d;
    --text: #e8e8f0;
    --muted: #6b6b80;
    --radius: 16px;
    --shadow: 0 24px 60px rgba(0,0,0,.7), 0 0 0 1px var(--border);
  }
  #bpm-fab {
    position: fixed;
    bottom: 28px;
    right: 20px;
    z-index: 2147483646;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 0 rgba(13,240,192,.5);
    animation: bpm-pulse 2.5s infinite;
    transition: transform .18s cubic-bezier(.34,1.56,.64,1);
    font-size: 22px;
    touch-action: none;
    user-select: none;
  }
  #bpm-fab:active { transform: scale(.88); }
  #bpm-fab.open   { transform: rotate(45deg) scale(1.05); }
  @keyframes bpm-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(13,240,192,.45); }
    50%      { box-shadow: 0 0 0 12px rgba(13,240,192,0); }
  }
  #bpm-panel {
    position: fixed;
    bottom: 92px;
    right: 20px;
    z-index: 2147483645;
    width: 300px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    font-family: 'Space Mono', monospace;
    overflow: hidden;
    transform-origin: bottom right;
    transform: scale(.85) translateY(12px);
    opacity: 0;
    pointer-events: none;
    transition: transform .22s cubic-bezier(.34,1.56,.64,1), opacity .18s ease;
  }
  #bpm-panel.open {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  #bpm-header {
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  #bpm-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -.3px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #bpm-title span { color: var(--accent); }
  #bpm-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--muted);
    transition: background .3s, box-shadow .3s;
    flex-shrink: 0;
  }
  #bpm-status-dot.listening { background: #eab308; box-shadow: 0 0 8px #eab308; animation: bpm-blink .8s infinite; }
  #bpm-status-dot.polling   { background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: bpm-blink .6s infinite; }
  #bpm-status-dot.done      { background: #22c55e; box-shadow: 0 0 8px #22c55e; animation: none; }
  #bpm-status-dot.error     { background: var(--accent2); box-shadow: 0 0 8px var(--accent2); animation: bpm-blink .4s infinite; }
  @keyframes bpm-blink {
    0%,100% { opacity: 1; } 50% { opacity: .3; }
  }
  #bpm-status-bar {
    margin: 12px 16px 0;
    padding: 10px 12px;
    background: var(--surface);
    border-radius: 10px;
    border: 1px solid var(--border);
    font-size: 11.5px;
    color: var(--muted);
    min-height: 38px;
    line-height: 1.5;
    transition: color .2s;
    word-break: break-all;
  }
  #bpm-status-bar.highlight { color: var(--accent); }
  #bpm-status-bar.error     { color: var(--accent2); }
  #bpm-code-box {
    margin: 10px 16px 0;
    padding: 10px 12px;
    background: var(--surface);
    border-radius: 10px;
    border: 1px solid var(--border);
    display: none;
    align-items: center;
    gap: 8px;
  }
  #bpm-code-box.show { display: flex; }
  #bpm-code-val {
    flex: 1;
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: .5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #bpm-copy-inline {
    background: none;
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 10px;
    font-family: 'Space Mono', monospace;
    cursor: pointer;
    transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  #bpm-copy-inline:hover { background: var(--accent); color: #000; }
  #bpm-actions {
    padding: 12px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bpm-btn {
    width: 100%;
    padding: 11px 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 9px;
    transition: border-color .15s, background .15s, transform .12s;
    text-align: left;
  }
  .bpm-btn:active { transform: scale(.97); }
  .bpm-btn.primary {
    background: var(--accent);
    color: #000;
    border-color: var(--accent);
    font-weight: 700;
  }
  .bpm-btn.primary:hover { background: #0acfaa; border-color: #0acfaa; }
  .bpm-btn:not(.primary):hover { border-color: var(--accent); color: var(--accent); }
  .bpm-btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }
  .bpm-btn-icon { font-size: 15px; line-height: 1; flex-shrink: 0; }
  #bpm-footer {
    padding: 8px 16px 14px;
    font-size: 10px;
    color: var(--muted);
    text-align: center;
    border-top: 1px solid var(--border);
    margin-top: 2px;
  }
  #bpm-footer a { color: var(--accent); text-decoration: none; }
\`;
document.head.appendChild(style);

function buildUI(){
  const fab = document.createElement("button");
  fab.id = "bpm-fab";
  fab.textContent = "⚡";
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.id = "bpm-panel";
  panel.innerHTML = \`
    <div id="bpm-header">
      <div id="bpm-status-dot"></div>
      <div id="bpm-title">MinhZ <span>Bypass Yeulink</span></div>
    </div>
    <div id="bpm-status-bar">Ready To Bypass 🔓</div>
    <div id="bpm-code-box">
      <div id="bpm-code-val">—</div>
      <button id="bpm-copy-inline">COPY</button>
    </div>
    <div id="bpm-actions">
      <button class="bpm-btn primary" id="bpm-btn-bypass">
        <span class="bpm-btn-icon">🚀</span> Bypass Yeulink
      </button>
      <button class="bpm-btn" id="bpm-btn-reload">
        <span class="bpm-btn-icon">🔄</span> Reload Page
      </button>
    </div>
    <div id="bpm-footer">
      Made By MinhZ · <a href="https://discord.gg/q2DzqWgpTC" target="_blank">Discord</a>
    </div>
  \`;
  document.body.appendChild(panel);

  let open = false;

  function makeDraggable(el, handle){
    let startX, startY, startRight, startBottom, dragging = false, moved = false;

    handle.addEventListener("pointerdown", (e)=>{
      if(e.button !== undefined && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      startRight  = window.innerWidth  - rect.right;
      startBottom = window.innerHeight - rect.bottom;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    handle.addEventListener("pointermove", (e)=>{
      if(!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if(Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      const newRight  = Math.max(0, Math.min(window.innerWidth  - 52, startRight  - dx));
      const newBottom = Math.max(0, Math.min(window.innerHeight - 52, startBottom - dy));
      el.style.right  = newRight  + "px";
      el.style.bottom = newBottom + "px";
      el.style.left   = "auto";
      el.style.top    = "auto";
    });

    handle.addEventListener("pointerup", ()=>{ dragging = false; });
    handle.addEventListener("lostpointercapture", ()=>{ dragging = false; });

    handle.addEventListener("click", (e)=>{ if(moved){ e.stopImmediatePropagation(); moved = false; } });
  }

  makeDraggable(fab, fab);

  fab.addEventListener("click", ()=>{
    open = !open;
    fab.classList.toggle("open", open);
    panel.classList.toggle("open", open);
    if(open){
      const fabRect = fab.getBoundingClientRect();
      panel.style.right  = (window.innerWidth  - fabRect.right)  + "px";
      panel.style.bottom = (window.innerHeight - fabRect.top + 8) + "px";
      panel.style.left   = "auto";
      panel.style.top    = "auto";
    }
  });

  document.getElementById("bpm-btn-bypass").addEventListener("click", ()=>{
    window.postMessage({type:"start_gift_listen"},"*");
  });

  document.getElementById("bpm-btn-reload").addEventListener("click", ()=>{
    location.reload();
  });

  document.getElementById("bpm-copy-inline").addEventListener("click", ()=>{
    if(!lastCode) return;
    copyCode(lastCode);
    const btn = document.getElementById("bpm-copy-inline");
    btn.textContent = "✓ Copied!";
    btn.style.background = "var(--accent)";
    btn.style.color = "#000";
    setTimeout(()=>{
      btn.textContent = "COPY";
      btn.style.background = "";
      btn.style.color = "";
    }, 2000);
  });
}

function setStatus(msg, cls=""){
  const el = document.getElementById("bpm-status-bar");
  if(!el) return;
  el.textContent = msg;
  el.className = cls;
}

function setDot(state){
  const el = document.getElementById("bpm-status-dot");
  if(!el) return;
  el.className = state;
}

function showCodeBox(code){
  const box = document.getElementById("bpm-code-box");
  const val = document.getElementById("bpm-code-val");
  if(!box || !val) return;
  val.textContent = code;
  box.classList.add("show");
}

function copyCode(code){
  try{ navigator.clipboard.writeText(code); }catch{}
}

function failReload(){
  listening = false;
  polling   = false;
  setDot("error");
  setStatus("❌ Reload Page And Try Again!", "error");
  document.getElementById("bpm-btn-bypass")?.removeAttribute("disabled");
}

function hook(win){
  const nativeFetch = win.fetch;
  win.fetch = async function(...args){
    const [url, opt] = args;
    if(listening && typeof url === "string" && url.includes("/step") && opt?.body){
      clearTimeout(stepTimer);
      try{
        if(opt.body instanceof FormData){
          giftCode  = opt.body.get("code");
          giftToken = opt.body.get("token");
        } else {
          const p = new URLSearchParams(opt.body);
          giftCode  = p.get("code");
          giftToken = p.get("token");
        }
        if(giftCode && giftToken){ listening = false; startPolling(); }
        else failReload();
      } catch{ failReload(); }
    }
    return nativeFetch.apply(this, args);
  };

  const xhrOpen = win.XMLHttpRequest.prototype.open;
  win.XMLHttpRequest.prototype.open = function(m, u){
    this._url = u;
    return xhrOpen.apply(this, arguments);
  };

  const xhrSend = win.XMLHttpRequest.prototype.send;
  win.XMLHttpRequest.prototype.send = function(body){
    if(listening && this._url?.includes("/step")){
      clearTimeout(stepTimer);
      try{
        if(body instanceof FormData){
          giftCode  = body.get("code");
          giftToken = body.get("token");
        } else {
          const p = new URLSearchParams(body);
          giftCode  = p.get("code");
          giftToken = p.get("token");
        }
        if(giftCode && giftToken){ listening = false; startPolling(); }
        else failReload();
      } catch{ failReload(); }
    }
    return xhrSend.apply(this, arguments);
  };
}

hook(window);

new MutationObserver(()=>{
  document.querySelectorAll("iframe").forEach(f=>{
    try{ if(f.contentWindow) hook(f.contentWindow); }catch{}
  });
}).observe(document, {childList:true, subtree:true});

function startPolling(){
  let fail = 0;
  polling  = true;
  setDot("polling");
  setStatus("⏳ Fetching Code...", "highlight");

  const iv = setInterval(async()=>{
    try{
      const res = await fetch("https://yeulink.com/continue",{
        method: "POST",
        headers: {"content-type":"application/x-www-form-urlencoded"},
        body: "code="+encodeURIComponent(giftCode)+"&token="+encodeURIComponent(giftToken)
      });
      const d = await res.json();

      if(d?.success && d.code){
        clearInterval(iv);
        polling  = false;
        lastCode = d.code;
        setDot("done");
        setStatus("🎉 Success!", "highlight");
        showCodeBox(d.code);
        copyCode(d.code);
        document.getElementById("bpm-btn-bypass")?.removeAttribute("disabled");

        const fab   = document.getElementById("bpm-fab");
        const panel = document.getElementById("bpm-panel");
        if(fab && panel){
          fab.classList.add("open");
          panel.classList.add("open");
          fab.textContent = "✅";
          setTimeout(()=>{ fab.textContent = "⚡"; }, 3000);
        }
      }
    } catch{
      fail++;
      if(fail >= 5){ clearInterval(iv); failReload(); }
    }
  }, 2000);

  setTimeout(()=>{
    if(polling){
      clearInterval(iv);
      polling = false;
      setDot("error");
      setStatus("⏱️ Timed Out, Reload The Page!", "error");
      document.getElementById("bpm-btn-bypass")?.removeAttribute("disabled");
    }
  }, 45000);
}

window.addEventListener("message", (e)=>{
  if(e.data?.type !== "start_gift_listen") return;

  giftCode  = null;
  giftToken = null;
  polling   = false;
  listening = true;

  setDot("listening");
  setStatus("👀 Waiting For Request...", "");
  document.getElementById("bpm-btn-bypass")?.setAttribute("disabled","");

  stepTimer = setTimeout(()=>{
    if(listening) failReload();
  }, 5000);

  const b = [...document.querySelectorAll("button")]
    .find(x => getComputedStyle(x).backgroundColor.includes("13, 148, 135"));

  if(!b){ failReload(); return; }
  b.disabled = false;
  b.removeAttribute("disabled");
  b.click();
});

if(document.body) buildUI();
else document.addEventListener("DOMContentLoaded", buildUI);

})();
`;

document.documentElement.appendChild(inject);
inject.remove();

})();
