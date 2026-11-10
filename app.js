/* Security LernApp – Lern-App für die Sachkundeprüfung nach § 34a GewO */
(function () {
  "use strict";

  // ---------- Speicher ----------
  const KEY = "slapp-v1";
  const defaults = { prog: {}, custom: [], exams: [], flags: {} };
  let S = load();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign({}, defaults, JSON.parse(raw)); } catch (e) {}
    return JSON.parse(JSON.stringify(defaults));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  S.settings = Object.assign({ showCount: true }, S.settings || {});
  // KI-Zugang wird getrennt gespeichert und ist NICHT im Backup enthalten
  const AIKEY = "slapp-ai";
  // Nur Google-Gemini-Schlüssel im Format „AQ.…“ werden akzeptiert
  const isGemKey = k => /^AQ\./.test(k || "");
  function aiConf() {
    let c; try { c = JSON.parse(localStorage.getItem(AIKEY)) || {}; } catch (e) { c = {}; }
    return isGemKey(c.key) ? c : {}; // alte Claude- oder AIza-Schlüssel gelten als nicht eingerichtet
  }
  function aiSave(c) { try { localStorage.setItem(AIKEY, JSON.stringify(c)); } catch (e) {} }
  // Versionsstand aus updates.js (neueste Version steht oben)
  const UPDATES = window.SL_UPDATES || [];
  const VERSION = UPDATES.length ? UPDATES[0].v : "";
  const fmtDate = d => new Date(d + "T12:00:00").toLocaleDateString("de-DE");
  const countText = q => q.c.length === 1 ? "1 Antwort ist richtig" : q.c.length + " Antworten sind richtig";

  // ---------- Daten ----------
  const TOPICS = (window.SL_TOPICS || []).slice();
  const ORDER = ["rdoeso", "gewo", "ds", "bgb", "stgb", "umw", "dguv", "umm", "sit"];
  TOPICS.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  TOPICS.forEach(t => t.questions.forEach((q, i) => { q.id = t.id + "-" + i; q.topic = t.id; }));
  const topicById = id => TOPICS.find(t => t.id === id);
  function questionsOf(tid) {
    const t = topicById(tid);
    const own = S.custom.filter(c => c.topic === tid);
    return t.questions.concat(own);
  }
  const allQuestions = () => TOPICS.flatMap(t => questionsOf(t.id));
  const qById = id => allQuestions().find(q => q.id === id);

  // Status: 0 neu (grau), 1 falsch (rot), 2 einmal richtig (gelb), 3 sicher (grün = 2x in Folge richtig)
  function status(q) {
    const p = S.prog[q.id];
    if (!p || !p.n) return 0;
    if (p.last === false) return 1;
    return p.s >= 2 ? 3 : 2;
  }
  function record(q, ok) {
    const p = S.prog[q.id] || { n: 0, s: 0, w: 0 };
    p.n++; p.t = Date.now(); p.last = ok;
    if (ok) p.s++; else { p.s = 0; p.w++; }
    S.prog[q.id] = p; save();
  }
  function counts(list) {
    const c = [0, 0, 0, 0];
    list.forEach(q => c[status(q)]++);
    return { neu: c[0], rot: c[1], gelb: c[2], gruen: c[3], total: list.length };
  }

  // ---------- Hilfen ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2000); }
  function bar(c) {
    const T = c.total || 1;
    return `<div class="bar"><span class="g" style="width:${c.gruen / T * 100}%"></span><span class="y" style="width:${c.gelb / T * 100}%"></span><span class="r" style="width:${c.rot / T * 100}%"></span></div>`;
  }
  function ring(pct) {
    const r = 46, C = 2 * Math.PI * r, off = C * (1 - pct / 100);
    return `<svg class="ring" viewBox="0 0 110 110"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--grey)" stroke-width="10"/>
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--green)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" transform="rotate(-90 55 55)"/>
      <text x="55" y="61" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text)">${Math.round(pct)}%</text></svg>`;
  }
  function setHeader(title, back) {
    $("#title").textContent = title;
    $("#back").style.visibility = back ? "visible" : "hidden";
    $("#back").onclick = () => { if (typeof back === "function") back(); else go(back); };
  }
  function foot(html) { $("#foot").innerHTML = html ? `<div class="inner">${html}</div>` : ""; $("#foot").style.display = html ? "block" : "none"; }
  function go(hash) { location.hash = hash; }
  let timerHandle = null;
  function clearTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }

  // ---------- Startseite ----------
  function home() {
    clearTimer();
    setHeader("Security LernApp", null);
    const all = allQuestions(), c = counts(all);
    const pct = c.total ? c.gruen / c.total * 100 : 0;
    const wrong = all.filter(q => status(q) === 1).length;
    const lastExam = S.exams[S.exams.length - 1];
    let html = `<div class="card hero">${ring(pct)}<div><h2 style="margin:0 0 4px">Dein Lernstand</h2>
      <div class="muted">${c.gruen} von ${c.total} Fragen sicher</div>
      <div class="muted">${c.neu} neu · ${c.rot} falsch · ${c.gelb} 1× richtig</div>
      ${lastExam ? `<div class="muted">Letzte Prüfung: <b class="${lastExam.pass ? "pass" : "fail"}">${lastExam.pct}%</b></div>` : ""}</div></div>
      <button class="btn" data-go="#/lernen/mix">▶ Weiterlernen (alle Themen)</button>
      <div class="grid2">
        <button class="tile" data-go="#/lernen/fehler"><span class="big">🔁</span><b>Fehler wiederholen</b><span class="muted">${wrong} Fragen</span></button>
        <button class="tile" data-go="#/pruefung"><span class="big">📝</span><b>Prüfung simulieren</b><span class="muted">82 Fragen · 120 Min.</span></button>
        <button class="tile" data-go="#/markiert"><span class="big">⭐</span><b>Markierte Fragen</b><span class="muted">${Object.keys(S.flags).length} Fragen</span></button>
        <button class="tile" data-go="#/eigene"><span class="big">✏️</span><b>Eigene Fragen</b><span class="muted">${S.custom.length} Fragen</span></button>
      </div>
      <button class="btn sec" id="aihome">🤖 KI-Lernhelfer fragen</button>
      <h2 style="margin-top:20px">Sachgebiete</h2>`;
    TOPICS.forEach(t => {
      const tc = counts(questionsOf(t.id));
      html += `<div class="card topic" data-go="#/thema/${t.id}"><div class="ico">${t.icon}</div><div class="info">
        <div class="name">${esc(t.name)}</div><div class="muted">${tc.gruen}/${tc.total} sicher · ${t.examCount} Fragen in der Prüfung</div>${bar(tc)}</div></div>`;
    });
    html += `<div class="legend"><span><i class="g"></i>sicher (2× richtig)</span><span><i class="y"></i>1× richtig</span><span><i class="r"></i>zuletzt falsch</span><span><i style="background:var(--grey)"></i>neu</span></div>
      <button class="btn ghost" style="margin-top:20px" data-go="#/einstellungen">⚙️ Einstellungen & Backup</button>
      ${VERSION ? `<button class="version" data-go="#/neu">Version ${esc(VERSION)} · Stand ${fmtDate(UPDATES[0].d)} · Was ist neu?</button>` : ""}`;
    $("#app").innerHTML = html; foot("");
    // Einmaliger Hinweis nach einem Update
    if (VERSION && S.seenVersion !== VERSION) {
      const first = !S.seenVersion && !Object.keys(S.prog).length;
      S.seenVersion = VERSION; save();
      if (!first) toast("Update auf Version " + VERSION + " – tippe unten auf „Was ist neu?“");
    }
    $("#aihome").onclick = () => openAI(null);
  }

  // ---------- Themenseite ----------
  function topicPage(tid) {
    clearTimer();
    const t = topicById(tid); if (!t) return go("#/");
    setHeader(t.short, "#/");
    const list = questionsOf(tid), c = counts(list);
    $("#app").innerHTML = `<div class="card"><div class="topic"><div class="ico">${t.icon}</div><div class="info"><h2 style="margin:0">${esc(t.name)}</h2>
      <div class="muted">${list.length} Fragen · ${t.examCount} davon kommen in der Prüfung</div></div></div>${bar(c)}
      <div class="legend"><span>${c.gruen} sicher</span><span>${c.gelb} 1× richtig</span><span>${c.rot} falsch</span><span>${c.neu} neu</span></div></div>
      <button class="btn sec" data-go="#/kapitel/${tid}">📖 Lernkapitel lesen</button>
      <button class="btn" data-go="#/lernen/t-${tid}">▶ Üben (Wichtigste zuerst)</button>
      <button class="btn sec" data-go="#/lernen/f-${tid}">🔁 Nur Fehler (${c.rot})</button>
      <button class="btn sec" data-go="#/lernen/a-${tid}">📋 Alle Fragen der Reihe nach</button>
      <button class="btn sec" data-go="#/lernen/q-${tid}">⚡ Schnelltest (10 Zufallsfragen)</button>`;
    foot("");
  }

  function lessonPage(tid) {
    const t = topicById(tid); if (!t) return go("#/");
    setHeader("Lernkapitel " + t.short, "#/thema/" + tid);
    $("#app").innerHTML = `<div class="card lesson"><h2>${t.icon} ${esc(t.name)}</h2>${t.lesson}</div>`;
    foot(`<button class="btn" data-go="#/lernen/t-${tid}">Jetzt Fragen üben ▶</button>`);
    window.scrollTo(0, 0);
  }

  // ---------- Lernmodus ----------
  let session = null;
  function pickSmart(list, n) {
    const prio = q => ({ 1: 0, 0: 1, 2: 2, 3: 3 })[status(q)];
    const age = q => (S.prog[q.id] && S.prog[q.id].t) || 0;
    return shuffle(list).sort((a, b) => prio(a) - prio(b) || age(a) - age(b)).slice(0, n);
  }
  function startLearn(mode) {
    let list, title, back = "#/";
    if (mode === "mix") { list = pickSmart(allQuestions(), 20); title = "Weiterlernen"; }
    else if (mode === "fehler") { list = shuffle(allQuestions().filter(q => status(q) === 1)); title = "Fehler wiederholen"; }
    else if (mode === "markiert") { list = shuffle(allQuestions().filter(q => S.flags[q.id])); title = "Markierte Fragen"; }
    else {
      const [k, tid] = [mode[0], mode.slice(2)]; const all = questionsOf(tid); back = "#/thema/" + tid;
      const t = topicById(tid); if (!t) return go("#/");
      if (k === "t") { list = pickSmart(all, 20); title = t.short + " üben"; }
      else if (k === "f") { list = shuffle(all.filter(q => status(q) === 1)); title = t.short + " Fehler"; }
      else if (k === "a") { list = all.slice(); title = t.short + " alle Fragen"; }
      else { list = shuffle(all).slice(0, 10); title = t.short + " Schnelltest"; }
    }
    if (!list.length) {
      setHeader(title, back);
      $("#app").innerHTML = `<div class="card"><h2>Nichts zu tun 🎉</h2><p>Hier gibt es gerade keine Fragen. Wähle einen anderen Lernmodus.</p></div>`;
      foot(`<button class="btn" data-go="${back}">Zurück</button>`); return;
    }
    session = { list, i: 0, sel: [], checked: false, right: 0, title, back, order: null };
    renderQ();
  }
  function prepOrder(q) { return shuffle(q.a.map((_, i) => i)); }
  function renderQ() {
    const s = session, q = s.list[s.i];
    if (!s.order) s.order = prepOrder(q);
    setHeader(s.title, s.back);
    const t = topicById(q.topic);
    let html = `<div class="progress"><div style="width:${s.i / s.list.length * 100}%"></div></div>
      <div class="qhead"><span>Frage ${s.i + 1} von ${s.list.length} · <span class="pill">${t ? t.short : ""}</span>${q.own ? '<span class="pill">eigene</span>' : ""}</span>
      <span><button class="flagbtn" id="aiq">🤖 KI-Hilfe</button> <button class="flagbtn ${S.flags[q.id] ? "on" : ""}" id="flag">⭐ ${S.flags[q.id] ? "markiert" : "merken"}</button></span></div>
      <div class="card"><div class="qtext">${esc(q.q)}</div><div class="hint">${S.settings.showCount ? `<span class="count">👉 ${countText(q)}</span> · ${s.sel.length} gewählt` : "Wähle alle richtigen Antworten aus (eine oder mehrere)."}</div>`;
    s.order.forEach((ai, k) => {
      let cls = s.sel.includes(ai) ? "sel" : "";
      if (s.checked) {
        const good = q.c.includes(ai);
        if (good && s.sel.includes(ai)) cls = "ok sel"; else if (good) cls = "ok miss"; else if (s.sel.includes(ai)) cls = "bad";
      }
      const mark = s.checked ? (q.c.includes(ai) ? "✓" : (s.sel.includes(ai) ? "✗" : "")) : (s.sel.includes(ai) ? "✓" : "");
      html += `<button class="ans ${cls}" data-a="${ai}" ${s.checked ? "disabled" : ""}><span class="box">${mark}</span><span>${String.fromCharCode(65 + k)}) ${esc(q.a[ai])}</span></button>`;
    });
    if (s.checked) {
      const ok = isRight(q, s.sel);
      html += `<div class="expl ${ok ? "ok" : "bad"}"><b>${ok ? "✅ Richtig!" : "❌ Leider falsch."}</b> ${esc(q.e || "")}${q.p ? `<br><span class="para">📌 ${esc(q.p)}</span>` : ""}</div>`;
    }
    html += `</div>`;
    $("#app").innerHTML = html;
    $("#flag").onclick = () => { if (S.flags[q.id]) delete S.flags[q.id]; else S.flags[q.id] = 1; save(); renderQ(); };
    $("#aiq").onclick = () => openAI(q, s.checked ? s.sel : null, s.order);
    document.querySelectorAll(".ans").forEach(b => b.onclick = () => {
      const a = +b.dataset.a; const i = s.sel.indexOf(a);
      if (i >= 0) s.sel.splice(i, 1); else s.sel.push(a); renderQ();
    });
    if (!s.checked) foot(`<button class="btn" id="check" ${s.sel.length ? "" : "disabled"}>Antwort prüfen</button>`);
    else foot(`<button class="btn" id="next">${s.i + 1 < s.list.length ? "Nächste Frage ▶" : "Auswertung ▶"}</button>`);
    const ch = $("#check"); if (ch) ch.onclick = () => { s.checked = true; const ok = isRight(q, s.sel); if (ok) s.right++; record(q, ok); renderQ(); };
    const nx = $("#next"); if (nx) nx.onclick = () => { s.i++; s.sel = []; s.checked = false; s.order = null; if (s.i >= s.list.length) learnDone(); else { renderQ(); window.scrollTo(0, 0); } };
  }
  function isRight(q, sel) { return sel.length === q.c.length && sel.every(a => q.c.includes(a)); }
  function learnDone() {
    const s = session, pct = Math.round(s.right / s.list.length * 100);
    $("#app").innerHTML = `<div class="card" style="text-align:center"><h2>Runde geschafft!</h2>
      <div class="result ${pct >= 50 ? "pass" : "fail"}">${s.right} / ${s.list.length}</div><p class="muted">${pct}% richtig</p>
      <p>${pct >= 80 ? "Stark! Weiter so 💪" : pct >= 50 ? "Gut! Die falschen Fragen kommen bald wieder." : "Dranbleiben! Lies ggf. das Lernkapitel noch einmal."}</p></div>`;
    foot(`<button class="btn sec" data-go="${s.back}">Zurück</button><button class="btn" id="again">Neue Runde</button>`);
    $("#again").onclick = () => router(true);
  }

  // ---------- Prüfungssimulation ----------
  let exam = null;
  const EXAM_MIN = 120;
  function examIntro() {
    clearTimer();
    setHeader("Prüfungssimulation", "#/");
    const hist = S.exams.slice(-5).reverse();
    $("#app").innerHTML = `<div class="card"><h2>📝 Wie in der IHK-Prüfung</h2>
      <ul><li><b>82 Fragen</b> aus allen 9 Sachgebieten, verteilt wie in der Prüfung</li>
      <li><b>120 Minuten</b> Zeit</li><li>Eine oder mehrere Antworten können richtig sein. Punkte gibt es nur, wenn <b>alle</b> richtigen Antworten gewählt sind.</li>
      <li>Bestanden ab <b>50%</b> (Richtwert, entspricht der IHK-Grenze)</li><li>Die Lösungen siehst du erst am Ende.</li></ul>
      <table><tr><th>Sachgebiet</th><th class="n">Fragen</th></tr>${TOPICS.map(t => `<tr><td>${t.icon} ${esc(t.name)}</td><td class="n">${t.examCount}</td></tr>`).join("")}</table></div>
      ${hist.length ? `<div class="card"><h3>Deine letzten Prüfungen</h3><table>${hist.map(h => `<tr><td>${new Date(h.d).toLocaleDateString("de-DE")} ${new Date(h.d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</td><td class="n">${h.right}/${h.total}</td><td class="n ${h.pass ? "pass" : "fail"}"><b>${h.pct}%</b></td></tr>`).join("")}</table></div>` : ""}`;
    foot(`<button class="btn" id="startExam">Prüfung starten</button>`);
    $("#startExam").onclick = startExam;
  }
  function startExam() {
    let list = [];
    TOPICS.forEach(t => { list = list.concat(shuffle(t.questions).slice(0, t.examCount)); });
    exam = { list, order: list.map(prepOrder), ans: list.map(() => []), flag: {}, i: 0, end: Date.now() + EXAM_MIN * 60000, done: false };
    go("#/pruefung/laeuft");
  }
  function examRender() {
    if (!exam) return go("#/pruefung");
    if (exam.done) return examResult();
    const e = exam, q = e.list[e.i];
    setHeader("Prüfung", () => { if (confirm("Prüfung abbrechen? Der Fortschritt dieser Prüfung geht verloren.")) { exam = null; clearTimer(); go("#/pruefung"); } });
    let html = `<div class="qhead"><span>Frage ${e.i + 1} / ${e.list.length} · <span class="pill">${topicById(q.topic).short}</span></span><span class="timer" id="timer"></span></div>
      <div class="card"><div class="qtext">${esc(q.q)}</div><div class="hint">${S.settings.showCount ? `<span class="count">👉 ${countText(q)}</span> · ${e.ans[e.i].length} gewählt` : "Eine oder mehrere Antworten sind richtig."}</div>`;
    e.order[e.i].forEach((ai, k) => {
      const sel = e.ans[e.i].includes(ai);
      html += `<button class="ans ${sel ? "sel" : ""}" data-a="${ai}"><span class="box">${sel ? "✓" : ""}</span><span>${String.fromCharCode(65 + k)}) ${esc(q.a[ai])}</span></button>`;
    });
    html += `<button class="flagbtn ${e.flag[e.i] ? "on" : ""}" id="eflag" style="margin-top:6px">⚑ ${e.flag[e.i] ? "zur Kontrolle markiert" : "später prüfen"}</button></div>
      <div class="card"><div class="muted" style="margin-bottom:8px">Übersicht (blau = beantwortet, gelber Rand = markiert)</div><div class="navgrid">
      ${e.list.map((_, i) => `<button data-n="${i}" class="${i === e.i ? "cur" : ""} ${e.ans[i].length ? "done" : ""} ${e.flag[i] ? "flag" : ""}">${i + 1}</button>`).join("")}</div>
      <button class="btn danger" id="submit" style="margin-top:14px">Prüfung abgeben</button></div>`;
    $("#app").innerHTML = html;
    document.querySelectorAll(".ans").forEach(b => b.onclick = () => {
      const a = +b.dataset.a, arr = e.ans[e.i], i = arr.indexOf(a);
      if (i >= 0) arr.splice(i, 1); else arr.push(a); examRender();
    });
    document.querySelectorAll(".navgrid button").forEach(b => b.onclick = () => { e.i = +b.dataset.n; examRender(); window.scrollTo(0, 0); });
    $("#eflag").onclick = () => { e.flag[e.i] = !e.flag[e.i]; examRender(); };
    $("#submit").onclick = () => {
      const open = e.ans.filter(a => !a.length).length;
      if (confirm(open ? `Noch ${open} Fragen unbeantwortet. Trotzdem abgeben?` : "Prüfung jetzt abgeben?")) finishExam();
    };
    foot(`<button class="btn sec" id="prev" ${e.i ? "" : "disabled"}>◀ Zurück</button><button class="btn" id="nextq">${e.i + 1 < e.list.length ? "Weiter ▶" : "Zur Abgabe"}</button>`);
    $("#prev").onclick = () => { e.i--; examRender(); window.scrollTo(0, 0); };
    $("#nextq").onclick = () => { if (e.i + 1 < e.list.length) { e.i++; examRender(); window.scrollTo(0, 0); } else $("#submit").scrollIntoView({ behavior: "smooth" }); };
    tick(); clearTimer(); timerHandle = setInterval(tick, 1000);
  }
  function tick() {
    if (!exam) return clearTimer();
    const left = Math.max(0, exam.end - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
    const el = $("#timer"); if (el) { el.textContent = "⏱ " + m + ":" + String(s).padStart(2, "0"); el.style.color = left < 600000 ? "var(--red)" : ""; }
    if (left <= 0) { clearTimer(); alert("Die Zeit ist abgelaufen. Die Prüfung wird ausgewertet."); finishExam(); }
  }
  function finishExam() {
    clearTimer();
    const e = exam; e.done = true;
    e.res = e.list.map((q, i) => isRight(q, e.ans[i]));
    e.list.forEach((q, i) => record(q, e.res[i]));
    const right = e.res.filter(Boolean).length, pct = Math.round(right / e.list.length * 100);
    S.exams.push({ d: Date.now(), right, total: e.list.length, pct, pass: pct >= 50 }); save();
    go("#/pruefung/ergebnis");
  }
  function examResult() {
    if (!exam || !exam.done) return go("#/pruefung");
    clearTimer();
    const e = exam, right = e.res.filter(Boolean).length, pct = Math.round(right / e.list.length * 100), pass = pct >= 50;
    setHeader("Ergebnis", "#/");
    const per = TOPICS.map(t => { const idx = e.list.map((q, i) => i).filter(i => e.list[i].topic === t.id); const r = idx.filter(i => e.res[i]).length; return { t, r, n: idx.length }; });
    $("#app").innerHTML = `<div class="card" style="text-align:center"><div class="result ${pass ? "pass" : "fail"}">${pct}%</div>
      <h2>${pass ? "Bestanden ✅" : "Nicht bestanden ❌"}</h2><p class="muted">${right} von ${e.list.length} Fragen vollständig richtig</p></div>
      <div class="card"><h3>Nach Sachgebiet</h3><table>${per.map(x => `<tr><td>${x.t.icon} ${esc(x.t.short)}</td><td class="n">${x.r}/${x.n}</td><td class="n ${x.r / x.n >= .5 ? "pass" : "fail"}">${Math.round(x.r / x.n * 100)}%</td></tr>`).join("")}</table></div>
      <div class="card"><h3>Fragen ansehen</h3><div class="muted" style="margin-bottom:8px">Grün = richtig, Rot = falsch. Tippe auf eine Nummer.</div>
      <div class="navgrid">${e.list.map((_, i) => `<button data-n="${i}" class="${e.res[i] ? "ok" : "no"}">${i + 1}</button>`).join("")}</div></div>
      <div id="review"></div>`;
    document.querySelectorAll(".navgrid button").forEach(b => b.onclick = () => showReview(+b.dataset.n));
    foot(`<button class="btn sec" data-go="#/lernen/fehler">Fehler üben</button><button class="btn" id="newExam">Neue Prüfung</button>`);
    $("#newExam").onclick = startExam;
  }
  function showReview(i) {
    const e = exam, q = e.list[i], sel = e.ans[i];
    let h = `<div class="card"><div class="qhead"><span>Frage ${i + 1} · ${topicById(q.topic).short} · ${countText(q)}</span><button class="flagbtn" id="aiq">🤖 KI-Hilfe</button></div><div class="qtext">${esc(q.q)}</div>`;
    e.order[i].forEach((ai, k) => {
      const good = q.c.includes(ai), s = sel.includes(ai);
      const cls = good && s ? "ok sel" : good ? "ok miss" : s ? "bad" : "";
      h += `<button class="ans ${cls}" disabled><span class="box">${good ? "✓" : s ? "✗" : ""}</span><span>${String.fromCharCode(65 + k)}) ${esc(q.a[ai])}</span></button>`;
    });
    h += `<div class="expl ${e.res[i] ? "ok" : "bad"}">${esc(q.e || "")}${q.p ? `<br><span class="para">📌 ${esc(q.p)}</span>` : ""}</div></div>`;
    $("#review").innerHTML = h; $("#review").scrollIntoView({ behavior: "smooth" });
    $("#aiq").onclick = () => openAI(q, sel, e.order[i]);
  }

  // ---------- KI-Lernhelfer ----------
  const AI_SYSTEM = `Du bist ein geduldiger Lernhelfer für die IHK-Sachkundeprüfung nach § 34a GewO (Bewachungsgewerbe) in Deutschland.
Der Lernende fängt bei null an. Erkläre in einfachem Deutsch, kurz und klar, mit Beispielen aus dem Wachdienst-Alltag.
Nenne die passenden Paragraphen (z. B. § 32 StGB, § 127 StPO, § 34a GewO, BewachV, DSGVO, BGB, WaffG, DGUV Vorschrift 1/23).
Wenn der Lernende eine Frage noch NICHT beantwortet hat, gib zuerst nur Denkanstöße und Hinweise, ohne die Lösung zu verraten – außer er bittet ausdrücklich um die Lösung.
Wenn er schon geantwortet hat, erkläre, warum die richtigen Antworten richtig und die falschen falsch sind.
Gib Merkhilfen (Eselsbrücken), wenn sie helfen. Sei ehrlich, wenn du dir unsicher bist, und verweise dann auf den Gesetzestext oder den Dozenten.
Antworte ohne lange Einleitung. Nutze höchstens kurze Listen.`;
  let ai = null;
  function qContext(q, sel, order) {
    if (!q) return "";
    const ord = order || q.a.map((_, i) => i);
    let t = `Prüfungsfrage (${topicById(q.topic) ? topicById(q.topic).name : ""}): ${q.q}\nAntwortmöglichkeiten (${countText(q)}):\n`;
    ord.forEach((ai2, k) => { t += `${String.fromCharCode(65 + k)}) ${q.a[ai2]}\n`; });
    if (sel) {
      t += `\nMeine Auswahl: ${sel.length ? ord.map((x, k) => sel.includes(x) ? String.fromCharCode(65 + k) : null).filter(Boolean).join(", ") : "keine"}`;
      t += `\nRichtig ist: ${ord.map((x, k) => q.c.includes(x) ? String.fromCharCode(65 + k) : null).filter(Boolean).join(", ")}`;
      if (q.e) t += `\nErklärung aus der App: ${q.e}${q.p ? " (" + q.p + ")" : ""}`;
    } else t += `\n(Ich habe die Frage noch nicht beantwortet.)`;
    return t;
  }
  function md(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^#{1,4} (.+)$/gm, "<b>$1</b>").replace(/^[-*] (.+)$/gm, "• $1").replace(/\n/g, "<br>");
  }
  function openAI(q, sel, order) {
    ai = { ctx: qContext(q, sel, order), msgs: [], busy: false, answered: !!sel, hasQ: !!q };
    renderAI();
  }
  function closeAI() { $("#ai").style.display = "none"; ai = null; }
  function renderAI() {
    const box = $("#ai"), conf = aiConf();
    box.style.display = "flex";
    let quick = "";
    if (ai.hasQ) quick = ai.answered
      ? ["Erklär mir die Lösung einfach", "Warum ist meine Antwort falsch?", "Gib mir eine Eselsbrücke"]
      : ["Gib mir einen Tipp (ohne Lösung)", "Erklär mir die Begriffe", "Sag mir die Lösung"];
    else quick = ["Erklär mir Notwehr einfach", "Unterschied § 127 StPO und § 229 BGB?", "Wie lerne ich am besten für die Prüfung?"];
    let body = "";
    if (!conf.key) {
      const prompt = (ai.ctx ? ai.ctx + "\n\n" : "") + "Bitte hilf mir als Lernhelfer für die Sachkundeprüfung § 34a GewO" + (ai.hasQ && !ai.answered ? " – gib mir zuerst nur einen Tipp, nicht die Lösung." : ".");
      body = `<p>Die KI kann auf zwei Arten helfen:</p>
        <a class="btn" id="aigem" target="_blank" rel="noopener" href="https://gemini.google.com/app">💬 In Gemini öffnen (kostenlos mit Google-Konto)</a>
        <p class="muted" style="margin-top:-2px">Die Frage wird dabei automatisch kopiert. In Gemini einfach ins Eingabefeld tippen und „Einfügen“ wählen.</p>
        <button class="btn sec" id="aicopy">📋 Nur Frage kopieren</button>
        <p class="muted">Oder richte unter <a href="#/einstellungen" id="aiset">Einstellungen</a> einen eigenen KI-Schlüssel ein, dann chattest du direkt hier in der App.</p>`;
      box.querySelector(".aibody").innerHTML = (ai.ctx ? `<div class="aictx">${md(ai.ctx)}</div>` : "") + body;
      box.querySelector(".aifoot").style.display = "none";
      const full = AI_SYSTEM + "\n\n" + prompt;
      const copy = () => navigator.clipboard ? navigator.clipboard.writeText(full) : Promise.reject();
      $("#aigem").onclick = () => { copy().then(() => toast("Frage kopiert – in Gemini einfügen")).catch(() => toast("Kopieren nicht möglich – bitte „Nur Frage kopieren“ nutzen")); };
      const cp = $("#aicopy"); if (cp) cp.onclick = () => { navigator.clipboard.writeText(AI_SYSTEM + "\n\n" + prompt).then(() => toast("Kopiert – jetzt in der KI einfügen")).catch(() => toast("Kopieren nicht möglich")); };
      $("#aiset").onclick = () => closeAI();
      return;
    }
    body = (ai.ctx ? `<div class="aictx">${md(ai.ctx)}</div>` : `<p class="muted">Stell mir jede Frage zum Prüfungsstoff.</p>`);
    ai.msgs.forEach(m => { body += `<div class="msg ${m.role}">${m.role === "user" ? esc(m.content) : md(m.content)}</div>`; });
    if (ai.busy) body += `<div class="msg assistant muted">schreibt …</div>`;
    if (!ai.msgs.length) body += `<div class="quick">${quick.map(x => `<button class="flagbtn" data-q="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;
    const b = box.querySelector(".aibody"); b.innerHTML = body; b.scrollTop = b.scrollHeight;
    box.querySelector(".aifoot").style.display = "flex";
    b.querySelectorAll("[data-q]").forEach(x => x.onclick = () => askAI(x.dataset.q));
  }
  async function askAI(text) {
    if (!text || !ai || ai.busy) return;
    const conf = aiConf();
    ai.msgs.push({ role: "user", content: text }); ai.busy = true; renderAI();
    const msgs = ai.msgs.map((m, i) => ({ role: m.role, content: i === 0 && ai.ctx ? ai.ctx + "\n\n" + m.content : m.content }));
    try {
      const txt = await callAI(conf, msgs);
      if (ai) ai.msgs.push({ role: "assistant", content: txt || "(keine Antwort)" });
    } catch (err) {
      if (ai) ai.msgs.push({ role: "assistant", content: "⚠️ Die KI ist gerade nicht erreichbar: " + err.message + (navigator.onLine ? "" : " (Du bist offline.)") + "\n\nTipp: Unter Einstellungen → „KI testen“ siehst du, woran es liegt." });
    }
    if (ai) { ai.busy = false; renderAI(); }
  }
  // KI-Anbieter: ausschließlich Google Gemini
  const GEM = "https://generativelanguage.googleapis.com/v1beta/";
  // Übertragungswege. Safari auf dem iPhone blockiert manche Anfragen mit „Load failed“,
  // deshalb werden mehrere Wege probiert; der funktionierende wird gespeichert.
  // "simple" schickt den Schlüssel in der Adresse und keinen JSON-Header -> keine Vorab-Anfrage (Preflight).
  const WAYS = ["header", "query", "simple"];
  function gemFetch(url, opt, key, way, ms) {
    opt = Object.assign({}, opt); const h = Object.assign({}, opt.headers || {});
    if (way === "header") h["x-goog-api-key"] = key;
    else url += (url.includes("?") ? "&" : "?") + "key=" + encodeURIComponent(key);
    if (way === "simple") delete h["content-type"];
    opt.headers = h;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 60000);
    opt.signal = ctl.signal;
    return fetch(url, opt).finally(() => clearTimeout(t));
  }
  const SAFETY = ["HARASSMENT", "HATE_SPEECH", "SEXUALLY_EXPLICIT", "DANGEROUS_CONTENT"].map(c => ({ category: "HARM_CATEGORY_" + c, threshold: "BLOCK_ONLY_HIGH" }));
  function thinkingFor(model) {
    if (/gemini-2\.5/.test(model)) return { thinkingBudget: /pro/.test(model) ? 128 : 0 };
    if (/gemini-[3-9]/.test(model)) return { thinkingLevel: "low" };
    return null;
  }
  function genBody(model, msgs, withThinking) {
    const gc = { maxOutputTokens: 8192 }, th = withThinking && thinkingFor(model);
    if (th) gc.thinkingConfig = th;
    return JSON.stringify({
      system_instruction: { parts: [{ text: AI_SYSTEM }] },
      contents: msgs.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: gc, safetySettings: SAFETY
    });
  }
  function apiError(r, d) {
    const msg = (d && d.error && d.error.message) || ("Fehler " + r.status);
    const e = new Error(r.status === 429 ? "Kontingent erschöpft oder zu viele Anfragen (" + msg + ")" : msg);
    e.status = r.status; return e;
  }
  function netError(err) {
    if (err.name === "AbortError") return Object.assign(new Error("Keine Antwort innerhalb von 60 Sekunden"), { net: true });
    return Object.assign(new Error("Verbindung zu Google blockiert (" + err.message + ")"), { net: true });
  }
  // Eine Anfrage an ein Modell auf einem Weg
  async function genOnce(conf, model, way, msgs) {
    let r;
    try { r = await gemFetch(GEM + model + ":generateContent", { method: "POST", headers: { "content-type": "application/json" }, body: genBody(model, msgs, true) }, conf.key, way); }
    catch (err) { throw netError(err); }
    let d = await r.json().catch(() => ({}));
    // Falls das Modell die Denk-Einstellung nicht kennt: ohne noch einmal
    if (r.status === 400 && /thinking/i.test((d.error && d.error.message) || "")) {
      try { r = await gemFetch(GEM + model + ":generateContent", { method: "POST", headers: { "content-type": "application/json" }, body: genBody(model, msgs, false) }, conf.key, way); }
      catch (err) { throw netError(err); }
      d = await r.json().catch(() => ({}));
    }
    if (!r.ok) throw apiError(r, d);
    if (d.promptFeedback && d.promptFeedback.blockReason) throw new Error("Google hat die Frage blockiert (" + d.promptFeedback.blockReason + ")");
    const c = d.candidates && d.candidates[0];
    const txt = ((c && c.content && c.content.parts) || []).filter(p => !p.thought).map(p => p.text || "").join("").trim();
    if (!txt) throw new Error("Leere Antwort von Google" + (c && c.finishReason ? " (" + c.finishReason + ")" : ""));
    return txt;
  }
  // Probiert den gespeicherten Weg/Modell zuerst, dann die anderen. Merkt sich, was funktioniert.
  async function callAI(conf, msgs, log) {
    const ways = [conf.way || conf.auth].filter(w => WAYS.includes(w)).concat(WAYS).filter((w, i, a) => a.indexOf(w) === i);
    const models = [conf.model].concat(conf.models || []).filter((m, i, a) => m && a.indexOf(m) === i).slice(0, 4);
    let last = null;
    for (const model of models) {
      for (const way of ways) {
        try {
          const txt = await genOnce(conf, model, way, msgs);
          if (log) log(`✅ ${model.replace(/^models\//, "")} · Weg „${way}“: funktioniert`);
          if (way !== conf.way || model !== conf.model) { conf.way = way; conf.model = model; aiSave(conf); }
          return txt;
        } catch (err) {
          last = err;
          if (log) log(`❌ ${model.replace(/^models\//, "")} · Weg „${way}“: ${err.message}`);
          if (!err.net) break; // Google hat geantwortet -> anderer Weg hilft nicht, nächstes Modell
        }
      }
      if (last && !last.net && !(last.status === 404 || last.status === 429 || last.status >= 500)) break;
    }
    throw last || new Error("Unbekannter Fehler");
  }
  async function listModels(key) {
    let last;
    for (const way of WAYS) {
      try {
        const r = await gemFetch(GEM + "models?pageSize=1000", {}, key, way, 20000);
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw apiError(r, d);
        const ok = (d.models || []).filter(m => (m.supportedGenerationMethods || []).includes("generateContent")).map(m => m.name);
        const ver = n => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
        const byVer = (x, y) => ver(y) - ver(x);
        const stable = ok.filter(n => /gemini-[\d.]+-flash$/.test(n)).sort(byVer);
        const flash = ok.filter(n => /flash/.test(n) && !/lite|image|tts|live|audio|thinking/.test(n)).sort(byVer);
        const lite = ok.filter(n => /gemini-[\d.]+-flash-lite$/.test(n)).sort(byVer);
        const list = stable.concat(flash, lite, ok.filter(n => /gemini/.test(n))).filter((m, i, a) => a.indexOf(m) === i);
        return { way, models: list };
      } catch (err) { last = err.status ? err : netError(err); if (err.status) break; }
    }
    throw last;
  }
  // Fehlersuche: verschiedene Anfragen an Google, jeweils mit Ergebnis
  async function diagnoseAI(key, model, log) {
    const probe = async (name, url, opt) => {
      const t0 = Date.now();
      try {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
        const r = await fetch(url, Object.assign({ signal: ctl.signal }, opt)).finally(() => clearTimeout(to));
        const txt = await r.text().catch(() => "");
        let m = ""; try { const d = JSON.parse(txt); m = (d.error && (d.error.status + ": " + d.error.message)) || (d.candidates ? "Antwort erhalten" : d.models ? d.models.length + " Modelle" : d.totalTokens != null ? "Tokens: " + d.totalTokens : ""); } catch (e) { m = txt.slice(0, 80); }
        log(`${r.ok ? "✅" : "⚠️"} ${name}: HTTP ${r.status} ${m} (${Date.now() - t0} ms)`);
      } catch (err) { log(`❌ ${name}: ${err.name === "AbortError" ? "keine Antwort in 20 s" : err.name + " – " + err.message} (${Date.now() - t0} ms)`); }
    };
    const k = "key=" + encodeURIComponent(key), m = model || "models/gemini-2.5-flash";
    const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Antworte nur mit: OK" }] }] });
    log("Gerät: " + navigator.userAgent.replace(/^Mozilla\/5\.0 /, "").slice(0, 90) + (navigator.onLine ? " · online" : " · OFFLINE"));
    log("Modell: " + m.replace(/^models\//, ""));
    await probe("1 Google ohne Schlüssel", GEM + "models");
    await probe("2 Modellliste (Header)", GEM + "models?pageSize=5", { headers: { "x-goog-api-key": key } });
    await probe("3 Modellliste (?key)", GEM + "models?pageSize=5&" + k);
    await probe("4 Senden ohne Schlüssel", GEM + m + ":generateContent", { method: "POST", body });
    await probe("5 Tokens zählen (?key, einfach)", GEM + m + ":countTokens?" + k, { method: "POST", body });
    await probe("6 Senden (?key, einfach)", GEM + m + ":generateContent?" + k, { method: "POST", body });
    await probe("7 Senden (?key, JSON)", GEM + m + ":generateContent?" + k, { method: "POST", headers: { "content-type": "application/json" }, body });
    await probe("8 Senden (Header, JSON)", GEM + m + ":generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body });
    await probe("9 Streaming (?key, einfach)", GEM + m + ":streamGenerateContent?alt=sse&" + k, { method: "POST", body });
  }
  // Einrichten: Modelle holen und eine echte Testfrage schicken
  async function setupAI(key, log) {
    const { way, models } = await listModels(key);
    if (!models.length) throw new Error("Kein passendes Gemini-Modell gefunden");
    const conf = { key, provider: "gemini", way, model: models[0], models: models.slice(0, 6) };
    await callAI(conf, [{ role: "user", content: "Antworte nur mit: OK" }], log);
    aiSave(conf); return conf;
  }
  function initAIPanel() {
    const box = document.createElement("div"); box.id = "ai"; box.className = "aipanel";
    box.innerHTML = `<div class="aiwin"><div class="aihead"><b>🤖 KI-Lernhelfer</b><button class="flagbtn" id="aiclose">✕ Schließen</button></div>
      <div class="aibody"></div>
      <form class="aifoot" id="aiform"><input id="aiin" placeholder="Deine Frage an die KI …" autocomplete="off"><button class="btn" style="width:auto;margin:0">Senden</button></form>
      <div class="muted" style="font-size:12px;padding:0 14px 10px">KI-Antworten können Fehler enthalten. Im Zweifel gilt der Gesetzestext.</div></div>`;
    document.body.appendChild(box);
    $("#aiclose").onclick = closeAI;
    box.onclick = ev => { if (ev.target === box) closeAI(); };
    $("#aiform").onsubmit = ev => { ev.preventDefault(); const v = $("#aiin").value.trim(); $("#aiin").value = ""; askAI(v); };
  }

  // ---------- Eigene Fragen ----------
  function customPage() {
    clearTimer();
    setHeader("Eigene Fragen", "#/");
    let h = `<div class="card"><h2>✏️ Neue Frage anlegen</h2>
      <label>Sachgebiet</label><select id="ct">${TOPICS.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select>
      <label>Frage</label><textarea id="cq" placeholder="Frage eingeben"></textarea>
      <label>Antworten (richtige ankreuzen)</label>
      ${[0, 1, 2, 3, 4].map(i => `<div class="ansedit"><input type="checkbox" id="cc${i}" aria-label="Antwort ${i + 1} ist richtig"><input type="text" id="ca${i}" placeholder="Antwort ${String.fromCharCode(65 + i)}${i > 1 ? " (optional)" : ""}"></div>`).join("")}
      <label style="margin-top:8px;display:block">Erklärung (optional)</label><textarea id="ce" placeholder="Warum ist das richtig?"></textarea>
      <label>Paragraph (optional)</label><input id="cp" placeholder="z. B. § 32 StGB">
      <button class="btn" id="csave">Frage speichern</button></div>`;
    if (S.custom.length) {
      h += `<div class="card"><h3>Deine Fragen (${S.custom.length})</h3>`;
      S.custom.slice().reverse().forEach(c => {
        h += `<div style="border-bottom:1px solid var(--line);padding:8px 0"><span class="pill">${topicById(c.topic).short}</span><b>${esc(c.q)}</b>
          <div class="muted">✓ ${c.c.map(i => esc(c.a[i])).join(" · ")}</div><button class="flagbtn" data-del="${c.id}" style="margin-top:4px">🗑 Löschen</button></div>`;
      });
      h += `</div>`;
    }
    $("#app").innerHTML = h; foot("");
    $("#csave").onclick = () => {
      const q = $("#cq").value.trim(), a = [], c = [];
      [0, 1, 2, 3, 4].forEach(i => { const v = $("#ca" + i).value.trim(); if (v) { if ($("#cc" + i).checked) c.push(a.length); a.push(v); } });
      if (!q || a.length < 2) return toast("Bitte Frage und mindestens 2 Antworten eingeben");
      if (!c.length) return toast("Bitte mindestens eine richtige Antwort ankreuzen");
      S.custom.push({ id: "own-" + Date.now(), topic: $("#ct").value, q, a, c, e: $("#ce").value.trim(), p: $("#cp").value.trim(), own: true });
      save(); toast("Frage gespeichert ✅"); customPage();
    };
    document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
      if (!confirm("Diese Frage löschen?")) return;
      S.custom = S.custom.filter(c => c.id !== b.dataset.del); delete S.prog[b.dataset.del]; delete S.flags[b.dataset.del]; save(); customPage();
    });
  }

  // ---------- Einstellungen ----------
  function settingsPage() {
    setHeader("Einstellungen", "#/");
    const conf = aiConf();
    $("#app").innerHTML = `<div class="card"><h2>🔢 Anzeige</h2>
      <label style="display:flex;gap:10px;align-items:center;font-weight:500"><input type="checkbox" id="showc" style="width:22px;height:22px;margin:0" ${S.settings.showCount ? "checked" : ""}> Anzahl der richtigen Antworten bei jeder Frage anzeigen</label>
      <p class="muted">In der echten IHK-Prüfung wird das nicht angezeigt. Schalte es zum Üben ein und für eine realistische Prüfung aus.</p></div>
      <div class="card"><h2>🤖 KI-Lernhelfer</h2>
      <p class="muted"><b>Ohne Einrichtung:</b> Der Knopf „KI-Hilfe“ kopiert die Frage und öffnet Google Gemini (gemini.google.com, kostenloses Google-Konto genügt).<br>
      <b>Mit eigenem Schlüssel:</b> Chat direkt in der App. Es funktioniert nur ein <b>Google-Gemini-Schlüssel, der mit „AQ.“ beginnt</b> (kostenlos erhältlich auf <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com</a>). Der Schlüssel bleibt nur auf diesem Gerät und ist nicht im Backup.</p>
      ${conf.key ? `<p>✅ Eingerichtet · Google Gemini · Modell: <b>${esc((conf.model || "").replace(/^models\//, ""))}</b></p><button class="btn sec" id="aitest">🔍 KI testen</button><div id="ailog" class="muted" style="font-size:13px;word-break:break-word"></div><button class="btn ghost" id="aicopylog" style="display:none">📋 Testergebnis kopieren</button><button class="btn danger" id="aidel">Schlüssel entfernen</button>`
        : `<input type="password" id="aikey" placeholder="Gemini-Schlüssel (AQ.…)" autocomplete="off"><button class="btn sec" id="aisave">Speichern & testen</button>`}</div>
      <div class="card"><h2>💾 Backup</h2><p class="muted">Dein Fortschritt wird nur auf diesem Gerät gespeichert. Mit einem Backup kannst du ihn sichern oder auf ein anderes Gerät übertragen.</p>
      <button class="btn sec" id="exp">Backup herunterladen</button>
      <label class="btn sec" style="display:block">Backup laden<input type="file" id="imp" accept="application/json,.json" style="display:none"></label></div>
      <div class="card"><h2>📲 Als App installieren</h2><p class="muted"><b>iPhone (Safari):</b> Teilen-Symbol → „Zum Home-Bildschirm“.<br><b>Android (Chrome):</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.<br>Danach funktioniert die App auch offline.</p></div>
      <div class="card"><h2>🗑 Zurücksetzen</h2><button class="btn danger" id="reset">Lernfortschritt löschen</button><p class="muted">Eigene Fragen bleiben erhalten.</p></div>
      <div class="card"><p class="muted">Security LernApp · <a href="#/neu">Version ${esc(VERSION)}</a> · ${allQuestions().length} Fragen. Die Fragen sind selbst formuliert auf Grundlage der Gesetze (GG, GewO, BewachV, DSGVO, BDSG, BGB, StGB, StPO, WaffG, DGUV). Ohne Gewähr: Im Zweifel gilt der aktuelle Gesetzestext.</p></div>`;
    foot("");
    $("#showc").onchange = ev => { S.settings.showCount = ev.target.checked; save(); toast("Gespeichert"); };
    const del = $("#aidel"); if (del) del.onclick = () => { aiSave({}); settingsPage(); toast("Schlüssel entfernt"); };
    const logTo = el => line => { el.innerHTML += esc(line) + "<br>"; };
    const sv = $("#aisave"); if (sv) sv.onclick = async () => {
      const key = $("#aikey").value.trim(); if (!key) return toast("Bitte Schlüssel eingeben");
      if (!isGemKey(key)) return toast("Nur Gemini-Schlüssel, die mit „AQ.“ beginnen");
      sv.disabled = true; sv.textContent = "Teste … (bis zu 1 Min.)";
      let box = $("#ailog0"); if (!box) { box = document.createElement("div"); box.id = "ailog0"; box.className = "muted"; box.style.fontSize = "13px"; sv.after(box); }
      box.innerHTML = "";
      try { await setupAI(key, logTo(box)); toast("KI eingerichtet ✅"); settingsPage(); }
      catch (err) {
        box.innerHTML += "<b>Fehler: " + esc(err.message) + "</b><br><br><b>Fehlersuche (dauert bis zu 3 Min.):</b><br>";
        await diagnoseAI(key, null, logTo(box));
        box.innerHTML += "<b>Fertig. Bitte Screenshot schicken.</b>";
        sv.disabled = false; sv.textContent = "Speichern & testen";
      }
    };
    const tb = $("#aitest"); if (tb) tb.onclick = async () => {
      const box = $("#ailog"); box.innerHTML = "Teste … (bis zu 1 Min.)<br>"; tb.disabled = true;
      try { const c = aiConf(); const lm = await listModels(c.key).catch(e => { box.innerHTML += "Modellliste: " + esc(e.message) + "<br>"; return null; });
        if (lm) { c.models = lm.models.slice(0, 6); aiSave(c); box.innerHTML += "Modellliste: ✅ " + lm.models.length + " Modelle (Weg „" + lm.way + "“)<br>"; }
        const t = await callAI(c, [{ role: "user", content: "Antworte nur mit: OK" }], logTo(box));
        box.innerHTML += "<b>Antwort: " + esc(t.slice(0, 80)) + "</b> – alles in Ordnung ✅"; }
      catch (err) {
        box.innerHTML += "<b>Fehler: " + esc(err.message) + "</b><br><br><b>Fehlersuche (dauert bis zu 3 Min.):</b><br>";
        const c = aiConf(); await diagnoseAI(c.key, c.model, logTo(box));
        box.innerHTML += "<b>Fertig. Bitte Screenshot schicken oder „Testergebnis kopieren“.</b>";
      }
      tb.disabled = false;
      const cl = $("#aicopylog"); cl.style.display = "block";
      cl.onclick = () => navigator.clipboard.writeText("Security LernApp " + VERSION + "\n" + box.innerText).then(() => toast("Kopiert ✅")).catch(() => toast("Kopieren nicht möglich"));
    };
    $("#exp").onclick = () => {
      const blob = new Blob([JSON.stringify(S)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "security-lernapp-backup.json"; a.click();
    };
    $("#imp").onchange = ev => {
      const f = ev.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.prog) throw 0; S = Object.assign({}, defaults, d); S.settings = Object.assign({ showCount: true }, S.settings || {}); save(); toast("Backup geladen ✅"); go("#/"); } catch (e) { toast("Ungültige Backup-Datei"); } };
      r.readAsText(f);
    };
    $("#reset").onclick = () => { if (confirm("Wirklich den gesamten Lernfortschritt löschen?")) { S.prog = {}; S.exams = []; S.flags = {}; save(); toast("Fortschritt gelöscht"); go("#/"); } };
  }

  // ---------- Was ist neu ----------
  function updatesPage() {
    clearTimer();
    setHeader("Was ist neu", "#/");
    let h = `<div class="card"><p class="muted" style="margin:0">Du nutzt <b>Version ${esc(VERSION)}</b>. Steht hier eine ältere Nummer als erwartet, schließe die App einmal ganz und öffne sie neu.</p></div>`;
    UPDATES.forEach((u, i) => {
      h += `<div class="card"><h3 style="margin-top:0">Version ${esc(u.v)} <span class="muted" style="font-weight:400">· ${fmtDate(u.d)}</span>${i === 0 ? ' <span class="pill">aktuell</span>' : ""}</h3>
        <ul style="margin:0;padding-left:20px">${u.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    });
    $("#app").innerHTML = h; foot("");
  }

  // ---------- Router ----------
  function router(force) {
    const h = location.hash || "#/";
    const parts = h.slice(2).split("/");
    window.scrollTo(0, 0);
    if (parts[0] === "thema") topicPage(parts[1]);
    else if (parts[0] === "kapitel") lessonPage(parts[1]);
    else if (parts[0] === "lernen") { clearTimer(); startLearn(parts[1]); }
    else if (parts[0] === "markiert") { clearTimer(); startLearn("markiert"); }
    else if (parts[0] === "pruefung") { if (parts[1] === "laeuft") examRender(); else if (parts[1] === "ergebnis") examResult(); else examIntro(); }
    else if (parts[0] === "eigene") customPage();
    else if (parts[0] === "einstellungen") settingsPage();
    else if (parts[0] === "neu") updatesPage();
    else home();
  }
  document.addEventListener("click", ev => {
    const el = ev.target.closest("[data-go]"); if (!el) return;
    const target = el.dataset.go;
    if (location.hash === target) router(true); else go(target);
  });
  window.addEventListener("hashchange", () => { if (ai) closeAI(); router(); });
  initAIPanel();
  window.addEventListener("beforeunload", ev => { if (exam && !exam.done) { ev.preventDefault(); ev.returnValue = ""; } });
  router();

  let swReg = null;
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").then(r => { swReg = r; }).catch(() => {});
  }

  // ---------- Update-Prüfung ----------
  // Alle 10 Sekunden wird updates.js direkt vom Server geholt (ohne Cache) und die Versionsnummer verglichen.
  const CHECK_MS = 10000;
  const newer = (a, b) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  let pending = null;
  async function checkUpdate() {
    if (document.hidden || !navigator.onLine || location.protocol === "file:" || !VERSION) return;
    try {
      const r = await fetch("updates.js", { cache: "no-store" });
      if (!r.ok) return;
      const m = (await r.text()).match(/\bv:\s*"([\d.]+)"/);
      if (m && newer(m[1], VERSION) && pending !== m[1]) { pending = m[1]; showUpdate(m[1]); }
    } catch (e) {}
  }
  function showUpdate(v) {
    // Auf der Startseite ohne laufende Prüfung sofort aktualisieren, sonst Hinweis anzeigen
    const idle = (location.hash || "#/") === "#/" && !exam && !ai;
    if (idle) return applyUpdate();
    let b = $("#upd");
    if (!b) { b = document.createElement("div"); b.id = "upd"; b.className = "updbar"; document.body.appendChild(b); }
    b.innerHTML = `<span>🔄 Version ${esc(v)} ist da</span><button id="updgo">Jetzt aktualisieren</button>`;
    $("#updgo").onclick = () => { if (exam && !exam.done && !confirm("Die laufende Prüfung geht dabei verloren. Trotzdem aktualisieren?")) return; exam = null; applyUpdate(); };
  }
  async function applyUpdate() {
    toast("Update wird geladen …");
    // Alle App-Dateien frisch vom Server holen, damit nichts Altes aus dem Browser-Speicher kommt
    const files = ["./", "index.html", "styles.css", "manifest.webmanifest"].concat(Array.from(document.scripts).map(s => s.getAttribute("src")).filter(Boolean));
    await Promise.all(files.map(f => fetch(f, { cache: "reload" }).catch(() => {})));
    try { if (swReg) await swReg.update(); } catch (e) {}
    location.reload();
  }
  setInterval(checkUpdate, CHECK_MS);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkUpdate(); });
})();
