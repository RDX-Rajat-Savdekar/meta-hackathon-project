// reelgen web UI: a home page of samples from the library, and a studio where each request streams
// structured events (stages, script, voice, per-scene attempts and errors) from /jobs/{id}/events.

const SUGGESTIONS = [
  "How does the TCP handshake work?",
  "Why is quicksort fast?",
  "How does DNA store data?",
  "What makes a black hole black?",
  "How does public-key encryption work?",
  "Why does ice float?",
  "How do vaccines train the immune system?",
  "What is a hash table really doing?",
  "How does GPS know where you are?",
  "Why is the sky blue?",
];

const ENGINES = [
  { key: "manim", name: "Manim", blurb: "Math-grade animation for algorithms, graphs, equations and proofs." },
  { key: "remotion", name: "Motion graphics", blurb: "Kinetic type, diagrams, code walkthroughs, UI mockups and charts." },
  { key: "three", name: "3D", blurb: "Molecules, orbits, hardware and anything that needs depth — rendered in Three.js." },
];
const RENDERER = { manim: "Manim", remotion: "2D motion", three: "3D" };
const STAGES = [
  ["script", "Script"],
  ["voice", "Voice"],
  ["align", "Word sync"],
  ["plan", "Direct"],
  ["render", "Animate"],
  ["assemble", "Assemble"],
];
const STORE_KEY = "reelgen.chat.v2";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

async function getJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch {}
    throw Object.assign(new Error(detail), { status: res.status });
  }
  return res.json();
}

function loadChat() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; } }
function saveChat() { try { localStorage.setItem(STORE_KEY, JSON.stringify(chat.slice(-30))); } catch {} }
let chat = loadChat();

// Background (bg3d.js) reacts to activity.
const activeJobs = new Set();
const signal = (kind) => window.dispatchEvent(new CustomEvent("reel:activity", { detail: { kind, active: activeJobs.size } }));

// Play muted previews only while they're on screen.
const autoplay = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().catch(() => {});
    } else v.pause();
  }
}, { threshold: 0.25 });
const watch = (root) => $$("video[data-auto]", root).forEach((v) => autoplay.observe(v));

// =====================================================================
// Router
// =====================================================================
function route() {
  const h = location.hash || "#/";
  const job = h.match(/^#\/job\/([a-z0-9]+)/i);
  const studio = h.startsWith("#/create") || !!job;
  $("#home").hidden = studio;
  $("#studio").hidden = !studio;
  document.title = studio ? "Studio — reelgen" : "reelgen — any question, a 60-second reel";
  if (studio) openStudio(job?.[1]);
  else { loadHome(); window.scrollTo(0, 0); }
}
addEventListener("hashchange", route);
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-scroll]");
  if (!a) return;
  e.preventDefault();
  $(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth", block: "start" });
});

function goCreate(prefill = "") {
  pendingPrefill = prefill;
  if (location.hash.startsWith("#/create")) applyPrefill();
  else location.hash = "#/create";
}
let pendingPrefill = "";
function applyPrefill() {
  if (!pendingPrefill) return;
  input.value = pendingPrefill;
  pendingPrefill = "";
  autosize(); updateSend(); input.focus();
}

// =====================================================================
// Home
// =====================================================================
let homeLoaded = false;
let reels = [];

async function loadHome() {
  if (homeLoaded) return;
  homeLoaded = true;
  const chips = [...SUGGESTIONS, ...SUGGESTIONS].map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join("");
  $("#marquee").innerHTML = chips;
  $("#marquee").onclick = (e) => { const c = e.target.closest(".chip"); if (c) goCreate(c.textContent); };

  try { reels = await getJSON("/library/reels"); } catch { reels = []; }
  let scenes = [];
  try { scenes = await getJSON("/library/scenes"); } catch {}

  // hero phones
  const playable = reels.filter((r) => r.has_video).slice(0, 3);
  const order = playable.length === 3 ? [playable[1], playable[0], playable[2]] : playable;
  $("#heroPhones").innerHTML = order.map((r) => `
    <div class="phone">
      <video data-auto data-src="/library/reels/${encodeURIComponent(r.name)}/video" muted loop playsinline preload="none"></video>
      <div class="label">${esc(r.title)}</div>
    </div>`).join("") || `<div class="phone"><div style="display:grid;place-items:center;height:100%;color:var(--muted);padding:20px;text-align:center">Your first reel will appear here.</div></div>`;

  // samples grid
  $("#reelsGrid").innerHTML = reels.map((r, i) => `
    <button class="reel-card" type="button" data-reel="${i}" aria-label="Watch: ${esc(r.title)}">
      ${r.has_video
        ? `<video data-auto data-src="/library/reels/${encodeURIComponent(r.name)}/video#t=0.5" muted loop playsinline preload="none"></video>`
        : `<img src="/library/reels/${encodeURIComponent(r.name)}/strip" alt="" loading="lazy" />`}
      <div class="shade"></div>
      <span class="play" aria-hidden="true"></span>
      ${r.duration ? `<span class="dur">${fmt(r.duration)}</span>` : ""}
      <div class="meta">
        <div class="tags">${r.renderers.map((x) => `<span class="tag" data-r="${esc(x)}">${esc(RENDERER[x] || x)}</span>`).join("")}</div>
        <strong>${esc(r.title)}</strong>
        <span class="hook">“${esc(r.hook)}”</span>
      </div>
    </button>`).join("") + `
    <a class="reel-card make" href="#/create"><div><span class="plus">+</span><strong>Your idea here</strong><span>Ask anything — get a reel like these in minutes.</span></div></a>`;
  $("#reelsGrid").onclick = (e) => {
    const card = e.target.closest("[data-reel]");
    if (card) openPlayer(reels[+card.dataset.reel]);
  };

  // engines
  $("#engineGrid").innerHTML = ENGINES.map((eng) => {
    const clips = scenes.filter((s) => s.renderer === eng.key && s.has_clip)
      .sort((a, b) => (b.starred - a.starred)).slice(0, 2);
    const cells = clips.map((s) => `<video data-auto data-src="/library/scenes/${encodeURIComponent(s.id)}/clip" muted loop playsinline preload="none" title="${esc(s.topic)} — ${esc(s.role)}"></video>`);
    while (cells.length < 2) cells.push(`<div class="empty-clip">More ${esc(eng.name)} scenes appear as you make reels</div>`);
    const n = scenes.filter((s) => s.renderer === eng.key).length;
    return `
      <article class="engine">
        <div class="clips">${cells.join("")}</div>
        <div class="body">
          <span class="tag" data-r="${eng.key}">${n} scene${n === 1 ? "" : "s"} in library</span>
          <h3>${esc(eng.name)}</h3>
          <p>${esc(eng.blurb)}</p>
        </div>
      </article>`;
  }).join("");

  // "you're in control" demo: two real scene clips
  const demo = scenes.filter((s) => s.has_clip).slice(-2);
  $("#controlDemo").innerHTML = demo.map((s, i) => `
    <div class="reel-card" style="cursor:default">
      <video data-auto data-src="/library/scenes/${encodeURIComponent(s.id)}/clip" muted loop playsinline preload="none"></video>
      <div class="shade"></div>
      <div class="meta">
        <div class="tags"><span class="tag" data-r="${s.renderer}">${esc(RENDERER[s.renderer])}</span><span class="tag" style="color:var(--good)">✓ rendered</span></div>
        <strong>${esc(cap(s.role) || `Scene ${i + 1}`)}</strong>
        <span class="hook">${esc(s.topic)}</span>
      </div>
    </div>`).join("");

  watch($("#home"));
}

function openPlayer(r) {
  if (!r) return;
  if (!r.has_video) { goCreate(r.topic); return; }
  const dlg = $("#player");
  $("#playerVideo").src = `/library/reels/${encodeURIComponent(r.name)}/video`;
  $("#playerTitle").textContent = r.title;
  $("#playerMake").onclick = () => { dlg.close(); goCreate(r.topic); };
  dlg.showModal();
  $("#playerVideo").play().catch(() => {});
}
$("#player").addEventListener("close", () => $("#playerVideo").pause());

// =====================================================================
// Studio
// =====================================================================
const thread = $("#thread");
const threadWrap = $("#threadWrap");
const form = $("#form");
const input = $("#input");
const send = $("#send");
const engineWrap = $("#engineWrap");
const engineBtn = $("#engineBtn");
const engineMenu = $("#engineMenu");
const engineLabel = $("#engineLabel");
let engineValue = "";
function setEngine(v, name, logo) {
  engineValue = v;
  engineLabel.textContent = name;
  const slot = $(".eng-logo", engineBtn);
  const src = $(`.eng-menu > button[data-v="${CSS.escape(v)}"] .eng-logo`, engineWrap);
  if (slot && src) slot.setAttribute("data-logo", logo);
  for (const b of $$(".eng-menu > button", engineWrap)) b.setAttribute("aria-selected", String(b.dataset.v === v));
  engineBtn.setAttribute("aria-label", `Animation engine: ${name}`);
}
function placeMenu(menu, anchor, dir) {
  // Hoist to body + fixed positioning: escapes every ancestor clip/stacking context.
  if (menu.parentElement !== document.body) document.body.appendChild(menu);
  menu.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = Math.min(280, innerWidth - 16);
  menu.style.minWidth = Math.min(248, innerWidth - 16) + "px";
  menu.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + "px";
  menu.style.bottom = "auto";
  if (dir === "up") menu.style.top = Math.max(8, r.top - menu.offsetHeight - 10) + "px";
  else menu.style.top = Math.min(innerHeight - 16, r.bottom + 10) + "px";
}
function engineOpen(open) {
  if (open) placeMenu(engineMenu, engineBtn, "up");
  else engineMenu.hidden = true;
  engineBtn.setAttribute("aria-expanded", String(open));
}
function repositionMenus() {
  if (!engineMenu.hidden && engineBtn) placeMenu(engineMenu, engineBtn, "up");
  const demoBtn = $("#demoBtn"), demoMenu = $("#demoMenu");
  if (demoBtn && demoMenu && !demoMenu.hidden) placeMenu(demoMenu, demoBtn, "down");
}
addEventListener("resize", repositionMenus);
threadWrap?.addEventListener("scroll", () => { engineOpen(false); const m = $("#demoMenu"); if (m) m.hidden = true; }, { passive: true });
engineBtn?.addEventListener("click", (e) => { e.stopPropagation(); engineOpen(engineMenu.hidden); });
engineMenu?.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-v]");
  if (!b) return;
  setEngine(b.dataset.v, b.dataset.name, b.dataset.logo);
  const svg = $("svg", $(".eng-logo", engineBtn));
  if (svg && b.dataset.logo) {
    const menuSvg = $("svg", $(`.eng-logo[data-logo="${b.dataset.logo}"]`, b));
    if (menuSvg) $(".eng-logo", engineBtn).innerHTML = menuSvg.outerHTML;
  }
  engineOpen(false);
  input.focus();
});
document.addEventListener("click", (e) => { if (!e.target.closest("#engineWrap")) engineOpen(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") engineOpen(false); });
const views = new Map(); // jobId → JobView
let studioReady = false;

function openStudio(jobId) {
  if (!studioReady) {
    studioReady = true;
    $("#studioChips").innerHTML = SUGGESTIONS.slice(0, 6).map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join("");
    $("#studioChips").onclick = (e) => { const c = e.target.closest(".chip"); if (c) { input.value = c.textContent; autosize(); updateSend(); input.focus(); } };
    for (const item of chat) mountJob(item.jobId, item.topic, item.renderer);
  }
  if (jobId && !views.has(jobId)) {
    getJSON(`/jobs/${jobId}`).then((job) => {
      chat.push({ jobId: job.id, topic: job.topic, renderer: job.preferred_renderer || undefined });
      saveChat();
      mountJob(job.id, job.topic, job.preferred_renderer || undefined);
      views.get(job.id)?.el.scrollIntoView({ block: "start" });
    }).catch(() => {});
  } else if (jobId) {
    views.get(jobId)?.el.scrollIntoView({ block: "start" });
  }
  applyPrefill();
  if (!pendingPrefill) input.focus();
}

function scrollDown() { requestAnimationFrame(() => (threadWrap.scrollTop = threadWrap.scrollHeight)); }

function addUser(text, renderer) {
  $("#studioEmpty")?.remove();
  const el = document.createElement("div");
  el.className = "msg user";
  el.innerHTML = `<div class="bubble">${esc(text)}${renderer ? ` <span class="tag" data-r="${esc(renderer)}">${esc(RENDERER[renderer] || renderer)}</span>` : ""}</div>`;
  thread.append(el);
}

function mountJob(jobId, topic, renderer) {
  if (views.has(jobId)) return;
  addUser(topic, renderer);
  const el = document.createElement("div");
  el.className = "msg bot";
  thread.append(el);
  views.set(jobId, new JobView(el, jobId, topic));
  scrollDown();
}

async function submit(topic) {
  topic = topic.trim();
  if (topic.length < 3) return;
  const renderer = engineValue || undefined;
  input.value = ""; autosize(); updateSend();
  try {
    const body = { topic };
    if (renderer) body.renderer = renderer;
    const job = await getJSON("/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    chat.push({ jobId: job.id, topic, renderer });
    saveChat();
    mountJob(job.id, topic, renderer);
    history.replaceState(null, "", `#/job/${job.id}`);
  } catch (e) {
    addUser(topic);
    const el = document.createElement("div");
    el.className = "msg bot";
    el.innerHTML = `<div class="bubble"><div class="failbox"><strong>Couldn't start</strong><p>${esc(e.message)}</p></div></div>`;
    thread.append(el);
    scrollDown();
  }
}

function autosize() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 160) + "px"; }
function updateSend() { send.disabled = input.value.trim().length < 3; }
form.addEventListener("submit", (e) => { e.preventDefault(); submit(input.value); });
input.addEventListener("input", () => { autosize(); updateSend(); });
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!send.disabled) submit(input.value); }
});
$("#newChat").onclick = () => {
  for (const v of views.values()) v.close();
  views.clear();
  chat = []; saveChat();
  thread.innerHTML = `<section class="studio-empty" id="studioEmpty"><h2>What should we explain?</h2><p>Describe the idea you want to understand. You'll see every step as it happens.</p><div class="chips" id="studioChips"></div></section>`;
  studioReady = false;
  history.replaceState(null, "", "#/create");
  openStudio();
};

// ---------------------------------------------------------------------
// One request's live view, driven entirely by the server's event stream.
// ---------------------------------------------------------------------
class JobView {
  constructor(el, id, topic, opts = {}) {
    this.el = el;
    this.id = id;
    this.topic = topic;
    this.demo = !!opts.demo;
    this.urls = opts.urls || null;
    this.demoTimers = [];
    this.s = { stages: {}, scenes: {}, plan: null, script: null, voice: null, done: null, failed: null, t0: null, t1: null, lastSeq: -1, running: true };
    el.innerHTML = `
      <div class="bubble">
        <div class="job-head"><span class="live">Live</span><strong>Making your reel</strong><span class="elapsed"></span></div>
        <div class="pipeline">${STAGES.map(([k, l]) => `<div class="pipe" data-stage="${k}"><span class="ic"></span>${l}</div>`).join("")}</div>
        <div class="feed" aria-label="Live log"></div>
        <div class="slot-script"></div>
        <div class="slot-voice"></div>
        <div class="scenes"></div>
        <div class="slot-final"></div>
      </div>`;
    this.feed = $(".feed", el);
    this.tick = setInterval(() => this.renderClock(), 1000);
    this.connect();
  }

  sceneClipURL(i, v) { return this.urls ? this.urls.scene(i) : `/jobs/${this.id}/scenes/${i}/clip?v=${v}`; }
  finalURL(seq) { return this.urls ? this.urls.final : `/jobs/${this.id}/video?v=${seq}#t=0.8`; }
  finalDownloadURL() { return this.urls ? this.urls.final : `/jobs/${this.id}/video`; }

  connect() {
    this.es?.close();
    activeJobs.add(this.id); signal("start");
    this.s.running = true;
    if (this.demo) return; // demo views are fed canned events, no EventSource
    const es = new EventSource(`/jobs/${this.id}/events?after=${this.s.lastSeq}`);
    this.es = es;
    es.onmessage = (m) => {
      const ev = JSON.parse(m.data);
      if (ev.seq <= this.s.lastSeq) return;
      this.s.lastSeq = ev.seq;
      this.apply(ev);
    };
    es.addEventListener("end", () => {
      es.close();
      this.s.running = false;
      activeJobs.delete(this.id);
      signal(this.s.failed ? "error" : "done");
      this.render();
    });
    es.onerror = async () => {
      if (es.readyState !== EventSource.CLOSED) return; // browser will retry on its own
      try { await getJSON(`/jobs/${this.id}`); } catch (e) {
        if (e.status === 404) { this.apply({ type: "failed", t: Date.now() / 1000, error: "This job no longer exists on the server.", stage: "" }); this.s.running = false; this.render(); }
      }
    };
  }

  close() { this.es?.close(); clearInterval(this.tick); activeJobs.delete(this.id); for (const t of this.demoTimers) clearTimeout(t); this.demoTimers = []; }

  sceneLabel(i) {
    const p = this.s.plan?.find((x) => x.index === i);
    return `Scene ${i + 1}${p ? ` · ${cap(p.role)}` : ""}`;
  }

  log(ev, text, cls = "") {
    const t = this.s.t0 ? fmt(Math.max(0, ev.t - this.s.t0)) : "0:00";
    const row = document.createElement("div");
    row.innerHTML = `<time>${t}</time><span class="${cls}">${esc(text)}</span>`;
    const atBottom = this.feed.scrollTop + this.feed.clientHeight >= this.feed.scrollHeight - 8;
    this.feed.append(row);
    if (atBottom) this.feed.scrollTop = this.feed.scrollHeight;
  }

  apply(ev) {
    const s = this.s;
    s.t0 ??= ev.t;
    switch (ev.type) {
      case "queued":
        this.log(ev, "Request received — starting the pipeline");
        break;
      case "stage":
        for (const [k] of STAGES) if (s.stages[k] === "active") s.stages[k] = "done";
        s.stages[ev.stage] = "active";
        s.failed = null;
        this.log(ev, `${ev.label}…`);
        break;
      case "script":
        s.script = ev.script;
        this.log(ev, `Script ready: “${ev.script.title}”`, "ok");
        break;
      case "voice":
        s.voice = ev;
        this.log(ev, `Voiceover recorded: ${ev.duration}s (${ev.provider === "gemini" ? "Gemini · Puck" : "macOS fallback voice"})`, ev.provider === "gemini" ? "ok" : "warn");
        break;
      case "plan":
        s.plan = ev.scenes;
        for (const p of ev.scenes) s.scenes[p.index] ??= { status: "queued", renderer: p.renderer, errors: [], attempt: 0, max: 3 };
        this.log(ev, `Directed ${ev.scenes.length} scenes: ${ev.scenes.map((p) => `${cap(p.role)} → ${RENDERER[p.renderer]}`).join(", ")}`);
        break;
      case "scene": {
        const sc = (s.scenes[ev.index] ??= { status: "queued", renderer: ev.renderer, errors: [], attempt: 0, max: 3 });
        Object.assign(sc, { status: ev.status, renderer: ev.renderer || sc.renderer, attempt: ev.attempt ?? sc.attempt, max: ev.max_attempts ?? sc.max });
        const name = this.sceneLabel(ev.index);
        const R = RENDERER[sc.renderer] || sc.renderer;
        if (ev.status === "coding") this.log(ev, `${name}: writing ${R} code (attempt ${ev.attempt}/${ev.max_attempts})`);
        else if (ev.status === "fixing") this.log(ev, `${name}: fixing the error (attempt ${ev.attempt}/${ev.max_attempts})`, "warn");
        else if (ev.status === "checking") this.log(ev, `${name}: checking the code`);
        else if (ev.status === "rendering") this.log(ev, `${name}: rendering`);
        else if (ev.status === "error") {
          sc.errors.push({ attempt: ev.attempt, stage: ev.stage, error: ev.error, detail: ev.detail });
          this.log(ev, `✕ ${name} failed while ${ev.stage}: ${ev.error}`, "err");
        } else if (ev.status === "done") { sc.v = ev.seq; this.log(ev, `✓ ${name} rendered${ev.attempt > 1 ? ` after ${ev.attempt} attempts` : ""}`, "ok"); }
        else if (ev.status === "fallback_rendering") this.log(ev, `${name}: all attempts failed — making a title card instead`, "warn");
        else if (ev.status === "fallback") { sc.v = ev.seq; this.log(ev, `⚠ ${name} is using a title card`, "warn"); }
        else if (ev.status === "failed") this.log(ev, `✕ ${name} could not be rendered: ${ev.error}`, "err");
        break;
      }
      case "retry": {
        s.done = null; s.failed = null; s.t1 = null;
        s.stages.render = "active"; s.stages.assemble = undefined;
        const sc = (s.scenes[ev.index] ??= { errors: [] });
        Object.assign(sc, { status: "queued", renderer: ev.renderer, errors: [], attempt: 0, redo: false, v: null });
        if (s.plan) { const p = s.plan.find((x) => x.index === ev.index); if (p) p.renderer = ev.renderer; }
        this.log(ev, `Redoing ${this.sceneLabel(ev.index)} with ${RENDERER[ev.renderer]}${ev.note ? ` — “${ev.note}”` : ""}`);
        break;
      }
      case "done":
        for (const [k] of STAGES) s.stages[k] = "done";
        s.done = ev; s.t1 = ev.t;
        this.log(ev, `✓ Reel ready — ${ev.duration}s`, "ok");
        break;
      case "failed":
        s.failed = ev; s.t1 = ev.t;
        for (const [k] of STAGES) if (s.stages[k] === "active") s.stages[k] = "failed";
        this.log(ev, `✕ Stopped${ev.stage ? ` during ${ev.stage}` : ""}: ${ev.error}`, "err");
        break;
    }
    this.render();
    if (["scene", "done", "failed", "plan"].includes(ev.type) && ev.status !== "checking") signal("pulse");
  }

  renderClock() {
    const s = this.s;
    if (!s.t0) return;
    const end = s.t1 ?? Date.now() / 1000;
    $(".elapsed", this.el).textContent = s.t1 ? `${s.failed ? "stopped" : "done"} in ${fmt(end - s.t0)}` : fmt(end - s.t0);
  }

  render() {
    const s = this.s;
    const el = this.el;
    const live = $(".live", el);
    live.className = `live${s.running ? "" : s.failed ? " bad" : " off"}`;
    live.textContent = s.running ? "Live" : s.failed ? "Stopped" : "Finished";
    $(".job-head strong", el).textContent = s.done ? "Your reel is ready" : s.failed ? "This run hit a problem" : "Making your reel";
    for (const [k] of STAGES) $(`.pipe[data-stage="${k}"]`, el).className = `pipe ${s.stages[k] || ""}`;
    this.renderClock();

    // script
    const ss = $(".slot-script", el);
    if (s.script && !ss.dataset.done) {
      ss.dataset.done = 1;
      const segs = s.script.segments || [];
      ss.innerHTML = `
        <div class="script-card">
          <div class="title">${esc(s.script.title)}</div>
          <div class="hook">“${esc(segs[0]?.narration)}”</div>
          <details><summary>Read the full script</summary>
            <ol>${segs.map((g) => `<li><b>${esc(g.role)}:</b> ${esc(g.narration)}</li>`).join("")}</ol>
          </details>
        </div>`;
    }
    const sv = $(".slot-voice", el);
    if (s.voice && s.voice.provider !== "gemini" && !sv.dataset.done) {
      sv.dataset.done = 1;
      sv.innerHTML = `<div class="notice">${esc(s.voice.note || "Used the fallback voice.")}</div>`;
    }

    // scenes
    const box = $(".scenes", el);
    const idx = Object.keys(s.scenes).map(Number).sort((a, b) => a - b);
    for (const i of idx) this.renderScene(box, i);

    // final / failure
    const fin = $(".slot-final", el);
    const key = s.done ? `done-${s.done.seq}` : s.failed ? `fail-${s.failed.seq}` : "";
    if (fin.dataset.key !== key) {
      fin.dataset.key = key;
      if (s.done) {
        const engines = [...new Set(Object.values(s.scenes).map((x) => RENDERER[x.renderer]))].join(", ");
        const cards = Object.values(s.scenes).filter((x) => x.status === "fallback").length;
        fin.innerHTML = `
          <div class="final">
            <video src="${esc(this.finalURL(s.done.seq))}" controls playsinline preload="metadata"></video>
            <div class="side">
              <h3>${esc(s.script?.title || "Your reel")}</h3>
              <p>${s.done.duration}s · animated with ${esc(engines || "code")}${cards ? ` · ${cards} scene${cards > 1 ? "s" : ""} used a title card — redo ${cards > 1 ? "them" : "it"} above` : ""}.</p>
              ${this.demo ? `<p style="color:var(--accent3)">Demo preview — clips from the library, no pipeline run.</p>` : ""}
              <div class="row">
                <a class="cta small" href="${esc(this.finalDownloadURL())}" download="reel-${this.id}.mp4">Download MP4</a>
                <button class="btn" type="button" data-share>Copy link</button>
              </div>
              <p>Not quite right? Use <b>Redo scene</b> on any scene above — add a note or switch its engine.</p>
            </div>
          </div>`;
        $("[data-share]", fin).onclick = async (e) => {
          try { await navigator.clipboard.writeText(`${location.origin}/#/job/${this.id}`); e.target.textContent = "Copied!"; } catch { e.target.textContent = `${location.origin}/#/job/${this.id}`; }
        };
      } else if (s.failed) {
        const hasScenes = idx.length > 0 && s.stages.render;
        fin.innerHTML = `
          <div class="failbox">
            <strong>Stopped${s.failed.stage ? ` during “${esc(s.failed.stage)}”` : ""}</strong>
            <p>${esc(s.failed.error)}</p>
            ${s.failed.detail ? `<details><summary>Technical details</summary><pre>${esc(s.failed.detail)}</pre></details>` : ""}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button class="cta small" type="button" data-again>Start over</button>
              ${hasScenes ? `<span style="color:var(--muted);font-size:13px;align-self:center">or redo a single scene above</span>` : ""}
            </div>
          </div>`;
        $("[data-again]", fin).onclick = () => {
        if (this.demo) { input.value = this.topic; autosize(); updateSend(); input.focus(); form.scrollIntoView({ behavior: "smooth", block: "end" }); }
        else submit(this.topic);
      };
      } else fin.innerHTML = "";
    }
  }

  renderScene(box, i) {
    const s = this.s;
    const sc = s.scenes[i];
    const p = s.plan?.find((x) => x.index === i);
    let card = $(`.scene[data-i="${i}"]`, box);
    if (!card) {
      card = document.createElement("article");
      card.className = "scene";
      card.dataset.i = i;
      box.append(card);
    }
    const canRedo = !s.running && ["done", "fallback", "error", "failed", "queued"].includes(sc.status);
    const sig = JSON.stringify([sc.status, sc.attempt, sc.errors.length, sc.renderer, sc.v, canRedo, sc.redo]);
    if (card.dataset.sig === sig) return;
    card.dataset.sig = sig;

    const working = ["coding", "fixing", "checking", "rendering", "fallback_rendering"].includes(sc.status);
    const failing = sc.errors.length > 0 && working;
    card.className = `scene ${sc.status === "done" ? "done" : sc.status === "fallback" ? "fallback" : failing || sc.status === "failed" ? "failing" : ""}`;

    const STATUS = {
      queued: ["Waiting to start", ""],
      coding: [`Writing ${RENDERER[sc.renderer]} code · attempt ${sc.attempt}/${sc.max}`, ""],
      fixing: [`Fixing the error · attempt ${sc.attempt}/${sc.max}`, "warn"],
      checking: [`Checking the code · attempt ${sc.attempt}/${sc.max}`, ""],
      rendering: [`Rendering · attempt ${sc.attempt}/${sc.max}`, ""],
      error: [`Attempt ${sc.attempt} failed — retrying`, "bad"],
      done: [sc.attempt > 1 ? `Rendered after ${sc.attempt} attempts` : "Rendered on the first try", "ok"],
      fallback_rendering: ["All attempts failed — making a title card", "warn"],
      fallback: [`Title card used after ${sc.max} failed attempts`, "warn"],
      failed: ["Could not be rendered", "bad"],
    };
    const [statusText, statusCls] = STATUS[sc.status] || [sc.status, ""];
    const preview = sc.v != null
      ? `<video src="${esc(this.sceneClipURL(i, sc.v))}" muted loop autoplay playsinline></video>
         ${sc.status === "fallback" ? `<span class="tag badge" style="color:var(--accent3)">title card</span>` : ""}`
      : working ? `<div class="spinner" aria-hidden="true"></div>` : `<div class="wait">${sc.status === "queued" ? "Queued" : ""}</div>`;

    const errors = sc.errors.map((e) => `
      <div class="attempt">
        <b>Attempt ${e.attempt} failed</b> while ${esc(e.stage || "running")}
        <code>${esc(e.error)}</code>
        ${e.detail ? `<details><summary>Full error</summary><pre>${esc(e.detail)}</pre></details>` : ""}
      </div>`).join("");

    const redo = canRedo ? (sc.redo ? `
      <form class="redo">
        <textarea rows="2" name="note" placeholder="What should change? e.g. bigger text, show it as a 3D model, slower"></textarea>
        <div class="row">
          <select name="renderer" aria-label="Engine">
            <option value="">Keep ${esc(RENDERER[sc.renderer])}</option>
            ${Object.entries(RENDERER).filter(([k]) => k !== sc.renderer).map(([k, v]) => `<option value="${k}">Switch to ${v}</option>`).join("")}
          </select>
          <button class="cta small" type="submit">Redo</button>
        </div>
        <button class="btn sm" type="button" data-cancel>Cancel</button>
      </form>` : `<button class="btn sm" type="button" data-redo>↻ Redo scene</button>`)
      : (s.running && sc.errors.length ? `<span style="font-size:12px;color:var(--muted)">You can redo this scene once the run finishes.</span>` : "");

    card.innerHTML = `
      <div class="preview">${preview}</div>
      <div class="head"><strong>${esc(this.sceneLabel(i).replace(/^Scene \d+ · /, "") || `Scene ${i + 1}`)}</strong><span class="tag" data-r="${esc(sc.renderer)}">${esc(RENDERER[sc.renderer] || sc.renderer)}</span></div>
      <div class="body">
        <div class="status ${statusCls}">${esc(statusText)}</div>
        ${p?.duration ? `<div style="font-size:12px;color:var(--muted)">Scene ${i + 1} · ${p.duration.toFixed(1)}s</div>` : ""}
        ${errors ? `<div class="attempts">${errors}</div>` : ""}
        ${redo}
      </div>`;

    $("[data-redo]", card)?.addEventListener("click", () => { sc.redo = true; this.renderScene(box, i); $("textarea", card)?.focus(); });
    $("[data-cancel]", card)?.addEventListener("click", () => { sc.redo = false; this.renderScene(box, i); });
    $("form.redo", card)?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = { note: fd.get("note")?.trim() || "" };
      if (fd.get("renderer")) body.renderer = fd.get("renderer");
      e.target.querySelector("button[type=submit]").disabled = true;
      try {
        await getJSON(`/jobs/${this.id}/scenes/${i}/retry`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        sc.redo = false;
        this.connect();
      } catch (err) {
        e.target.insertAdjacentHTML("beforeend", `<div class="status bad">${esc(err.message)}</div>`);
        e.target.querySelector("button[type=submit]").disabled = false;
      }
    });
  }
}

// =====================================================================
// UI demo — canned JobViews for previewing chat states without a pipeline run.
// =====================================================================
const demoBtn = $("#demoBtn");
const demoMenu = $("#demoMenu");
demoBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (demoMenu.hidden) placeMenu(demoMenu, demoBtn, "down");
  else demoMenu.hidden = true;
  demoBtn.setAttribute("aria-expanded", String(!demoMenu.hidden));
});
document.addEventListener("click", (e) => { if (demoMenu && !e.target.closest("#demoMenu") && !e.target.closest("#demoBtn")) demoMenu.hidden = true; });
demoMenu?.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-demo]");
  if (!b) return;
  demoMenu.hidden = true;
  demoBtn.setAttribute("aria-expanded", "false");
  runDemo(b.dataset.demo);
});

async function demoClips(n) {
  const all = await getJSON("/library/scenes");
  const clips = all.filter((s) => s.has_clip);
  if (!clips.length) throw new Error("No rendered clips in the library yet — run a reel first.");
  return Array.from({ length: n }, (_, i) => clips[i % clips.length]);
}

function mountDemoView(topic, urls) {
  $("#studioEmpty")?.remove();
  const el = document.createElement("div");
  el.className = "msg bot";
  thread.append(el);
  const id = `demo-${Date.now().toString(36)}`;
  const view = new JobView(el, id, `${topic} (demo)`, { demo: true, urls });
  views.set(id, view);
  el.scrollIntoView({ block: "start" });
  return view;
}

function feedDemo(view, steps) {
  let seq = 0;
  const clearEnd = () => {
    view.s.running = false;
    activeJobs.delete(view.id);
    signal(view.s.failed ? "error" : "done");
    view.render();
  };
  steps.forEach(([ms, build], k) => {
    view.demoTimers.push(setTimeout(() => {
      const ev = build(seq++, Date.now() / 1000);
      if (ev === null) { clearEnd(); return; }
      view.apply(ev);
      if (k === steps.length - 1 && ev.type !== "failed") clearEnd();
      if (ev.type === "failed") clearEnd();
    }, ms));
  });
}

const demoScript = {
  title: "Three knocks: the TCP handshake",
  segments: [
    { role: "hook", narration: "The internet starts every chat with three knocks." },
    { role: "setup", narration: "Two machines must agree on the rules before a single byte flows." },
    { role: "mechanism", narration: "SYN, SYN-ACK, ACK — each knock answered in turn." },
    { role: "payoff", narration: "Three packets, and strangers become a connection." },
  ],
};

async function runDemo(kind) {
  if ($("#studio").hidden) { location.hash = "#/create"; await new Promise((r) => setTimeout(r, 400)); }
  const topic = "How does the TCP handshake work?";
  try {
    if (kind === "happy") {
      const picks = await demoClips(4);
      const urls = { scene: (i) => `/library/scenes/${picks[i].id}/clip`, final: `/library/scenes/${picks[0].id}/clip` };
      const view = mountDemoView(topic, urls);
      const plan = picks.map((p, i) => ({ index: i, role: p.role || ["hook", "setup", "mechanism", "payoff"][i], renderer: p.renderer, duration: 3.0, description: (p.description || "").slice(0, 140) }));
      const steps = [
        [100, (q, t) => ({ type: "queued", t, seq: q, topic })],
        [500, (q, t) => ({ type: "stage", t, seq: q, stage: "script", label: "Writing the script" })],
        [1200, (q, t) => ({ type: "script", t, seq: q, script: demoScript })],
        [1600, (q, t) => ({ type: "stage", t, seq: q, stage: "voice", label: "Recording the voiceover" })],
        [2400, (q, t) => ({ type: "voice", t, seq: q, duration: 41.0, provider: "gemini" })],
        [2800, (q, t) => ({ type: "stage", t, seq: q, stage: "plan", label: "Directing the scenes" })],
        [3400, (q, t) => ({ type: "plan", t, seq: q, scenes: plan })],
        [3800, (q, t) => ({ type: "stage", t, seq: q, stage: "render", label: "Animating scenes" })],
      ];
      plan.forEach((p, i) => {
        const b = 4200 + i * 1600;
        steps.push([b, (q, t) => ({ type: "scene", t, seq: q, index: i, renderer: p.renderer, status: "coding", attempt: 1, max_attempts: 3 })]);
        steps.push([b + 500, (q, t) => ({ type: "scene", t, seq: q, index: i, renderer: p.renderer, status: "rendering", attempt: 1, max_attempts: 3 })]);
        steps.push([b + 1100, (q, t) => ({ type: "scene", t, seq: q, index: i, renderer: p.renderer, status: "done", attempt: 1, max_attempts: 3 })]);
      });
      steps.push([4200 + plan.length * 1600 + 400, (q, t) => ({ type: "done", t, seq: q, duration: 41.0 })]);
      feedDemo(view, steps);
    } else if (kind === "live") {
      const picks = await demoClips(2);
      const urls = { scene: (i) => `/library/scenes/${picks[i].id}/clip`, final: `/library/scenes/${picks[0].id}/clip` };
      const view = mountDemoView(topic, urls);
      const r0 = picks[0].renderer, r1 = picks[1].renderer;
      feedDemo(view, [
        [100, (q, t) => ({ type: "queued", t, seq: q, topic })],
        [500, (q, t) => ({ type: "script", t, seq: q, script: demoScript })],
        [900, (q, t) => ({ type: "voice", t, seq: q, duration: 12.4, provider: "gemini" })],
        [1300, (q, t) => ({ type: "plan", t, seq: q, scenes: [
          { index: 0, role: picks[0].role || "hook", renderer: r0, duration: 3.0, description: "" },
          { index: 1, role: picks[1].role || "setup", renderer: r1, duration: 3.0, description: "" }] })],
        [1700, (q, t) => ({ type: "scene", t, seq: q, index: 0, renderer: r0, status: "rendering", attempt: 1, max_attempts: 3 })],
        [2600, (q, t) => ({ type: "scene", t, seq: q, index: 0, renderer: r0, status: "done", attempt: 1, max_attempts: 3 })],
        [3000, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "coding", attempt: 1, max_attempts: 3 })],
        [3800, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "error", attempt: 1, max_attempts: 3, stage: "rendering", error: "TypeError: x is undefined", detail: "Demo error — watch it recover." })],
        [4600, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "fixing", attempt: 2, max_attempts: 3 })],
        [5600, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "rendering", attempt: 2, max_attempts: 3 })],
        [6800, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "done", attempt: 2, max_attempts: 3 })],
      ]);
    } else if (kind === "fallback") {
      const picks = await demoClips(2);
      const urls = { scene: (i) => `/library/scenes/${picks[i].id}/clip`, final: `/library/scenes/${picks[0].id}/clip` };
      const view = mountDemoView(topic, urls);
      const r0 = picks[0].renderer, r1 = picks[1].renderer;
      feedDemo(view, [
        [100, (q, t) => ({ type: "queued", t, seq: q, topic })],
        [500, (q, t) => ({ type: "script", t, seq: q, script: demoScript })],
        [900, (q, t) => ({ type: "voice", t, seq: q, duration: 12.4, provider: "gemini" })],
        [1300, (q, t) => ({ type: "plan", t, seq: q, scenes: [
          { index: 0, role: picks[0].role || "hook", renderer: r0, duration: 3.0, description: "" },
          { index: 1, role: picks[1].role || "setup", renderer: r1, duration: 3.0, description: "" }] })],
        [1700, (q, t) => ({ type: "scene", t, seq: q, index: 0, renderer: r0, status: "done", attempt: 1, max_attempts: 3 })],
        [2100, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "error", attempt: 1, max_attempts: 3, stage: "coding", error: "Banned: useFrame from @react-three/fiber", detail: "Demo error." })],
        [2800, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "error", attempt: 2, max_attempts: 3, stage: "rendering", error: "Render timed out", detail: "Demo error." })],
        [3500, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "fallback_rendering", attempt: 3, max_attempts: 3 })],
        [4300, (q, t) => ({ type: "scene", t, seq: q, index: 1, renderer: r1, status: "fallback", attempt: 3, max_attempts: 3 })],
        [4900, (q, t) => ({ type: "done", t, seq: q, duration: 12.4 })],
      ]);
    } else if (kind === "voice") {
      const view = mountDemoView(topic, { scene: () => "", final: "" });
      feedDemo(view, [
        [100, (q, t) => ({ type: "queued", t, seq: q, topic })],
        [500, (q, t) => ({ type: "script", t, seq: q, script: demoScript })],
        [1200, (q, t) => ({ type: "voice", t, seq: q, duration: 9.8, provider: "macos", note: "All Gemini keys are out of quota; used the Samantha voice instead." })],
        [1800, (q, t) => ({ type: "plan", t, seq: q, scenes: [{ index: 0, role: "hook", renderer: "remotion", duration: 3.0, description: "" }] })],
      ]);
    } else if (kind === "failed") {
      const view = mountDemoView(topic, { scene: () => "", final: "" });
      feedDemo(view, [
        [100, (q, t) => ({ type: "queued", t, seq: q, topic })],
        [600, (q, t) => ({ type: "stage", t, seq: q, stage: "voice", label: "Recording the voiceover" })],
        [1600, (q, t) => ({ type: "failed", t, seq: q, stage: "voice", error: "429 RESOURCE_EXHAUSTED — Gemini daily quota used up", detail: "Demo error. Keys rotate automatically; try again after reset." })],
      ]);
    }
  } catch (e) {
    addUser(topic);
    const el = document.createElement("div");
    el.className = "msg bot";
    el.innerHTML = `<div class="bubble"><div class="failbox"><strong>Demo unavailable</strong><p>${esc(e.message)}</p></div></div>`;
    thread.append(el);
    scrollDown();
  }
}

route();
