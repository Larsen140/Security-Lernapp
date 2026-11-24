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
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} syncSoon(); }
  S.settings = Object.assign({ showCount: true, sound: true, goal: 20 }, S.settings || {});
  S.days = S.days || {};
  // Gelöschte eigene Fragen („id“) und entfernte Markierungen („f:id“) mit Zeitpunkt,
  // damit der Abgleich zwischen Geräten sie nicht wieder zurückholt
  S.del = S.del || {};
  // Alte Importe: Hinweis „Lösung aus früherer KATI-Auswertung“ aus den Fragetiteln entfernen
  S.custom.forEach(c => { if (c && /KATI-Auswertung|Lösungsvorschlag\s*:?\s*$/i.test(c.q || "")) c.q = String(c.q).replace(/\s*Lösung(en)? aus (einer )?früher(er|en) KATI-Auswertung(en)?\s*:?/gi, " ").replace(/\s*(KATI-Auswertung|Lösungsvorschlag)\s*:?\s*$/i, "").replace(/\s{2,}/g, " ").trim(); });
  const forget = id => { S.del[id] = Date.now(); };
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
  // „Nur eigene Fragen“: Ist nichts eingestellt, gilt es automatisch, sobald Fragen importiert wurden.
  const onlyOwn = () => S.custom.length > 0 && (S.settings.onlyOwn != null ? S.settings.onlyOwn : S.custom.some(c => c.imp));
  function questionsOf(tid) {
    const t = topicById(tid);
    const own = S.custom.filter(c => c.topic === tid);
    return onlyOwn() ? own : t.questions.concat(own);
  }
  const allQuestions = () => TOPICS.flatMap(t => questionsOf(t.id));
  const qById = id => allQuestions().find(q => q.id === id);
  // Sucht eine Frage auch dann, wenn sie gerade ausgeblendet ist (für gespeicherte Prüfungen)
  const qAny = id => { for (const t of TOPICS) { const q = t.questions.find(x => x.id === id); if (q) return q; } return S.custom.find(x => x.id === id); };
  const flaggedCount = () => allQuestions().filter(q => S.flags[q.id]).length;
  // Lerntage: wie viele Fragen pro Tag beantwortet wurden (für Serie und Tagesziel)
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => S.days[dayKey()] || 0;
  function deviceId() {
    let id = null; try { id = localStorage.getItem("slapp-dev"); } catch (e) {}
    if (!id) { id = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); try { localStorage.setItem("slapp-dev", id); } catch (e) {} }
    return id;
  }
  function streak() {
    let n = 0; const d = new Date();
    if (!S.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

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
    const k = dayKey(); S.prog[q.id] = p; S.days[k] = today() + 1;
    // Zusätzlich pro Gerät zählen, damit beim Abgleich die Antworten von PC und Handy zusammengezählt werden
    S.dev = S.dev || {}; const mine = S.dev[deviceId()] = S.dev[deviceId()] || {}; mine[k] = (mine[k] || 0) + 1;
    save();
  }
  function counts(list) {
    const c = [0, 0, 0, 0];
    list.forEach(q => c[status(q)]++);
    return { neu: c[0], rot: c[1], gelb: c[2], gruen: c[3], total: list.length };
  }

  // ---------- Töne ----------
  // Kurze Klänge, im Browser erzeugt. Abschaltbar in den Einstellungen.
  const SFX = (() => {
    let ctx = null;
    const ac = () => {
      if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { ctx = new A(); } catch (e) { return null; } }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    };
    const tone = (f, at, dur, type, vol, glide) => {
      const a = ac(); if (!a) return;
      const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
      if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
    };
    const on = () => S.settings.sound !== false;
    return {
      unlock() { if (on()) ac(); },
      tap() { if (on()) tone(1200, 0, 0.035, "triangle", 0.025); },
      ok() { if (on()) { tone(660, 0, 0.11, "sine", 0.07); tone(990, 0.08, 0.2, "sine", 0.07); } },
      bad() { if (on()) tone(240, 0, 0.26, "triangle", 0.06, 150); if (navigator.vibrate) navigator.vibrate(50); },
      combo(n) { if (on()) tone(700 + Math.min(n, 12) * 45, 0.22, 0.09, "sine", 0.045); },
      done() { if (on()) [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.22, "sine", 0.06)); },
      pass() { if (on()) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, i === 3 ? 0.6 : 0.2, "triangle", 0.07)); },
      // Weckton: zwei helle Glockenschläge, auch bei ausgeschalteten Tönen (nur in der Fokus-Runde)
      alarm() { [[880, 0], [1175, 0.18], [880, 0.5], [1175, 0.68]].forEach(([f, t]) => tone(f, t, 0.35, "sine", 0.12)); },
      fail() { if (on()) [392, 330, 262].forEach((f, i) => tone(f, i * 0.17, 0.28, "sine", 0.055)); },
    };
  })();
  ["pointerdown", "touchend", "click"].forEach(ev => document.addEventListener(ev, () => SFX.unlock(), { passive: true }));

  // ---------- Hilfen ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2000); }
  function bar(c) {
    const T = c.total || 1;
    return `<div class="bar"><span class="g" style="width:${c.gruen / T * 100}%"></span><span class="y" style="width:${c.gelb / T * 100}%"></span><span class="r" style="width:${c.rot / T * 100}%"></span></div>`;
  }
  const calm = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el, ms) {
    if (!el) return; const to = +el.dataset.to, dec = +(el.dataset.dec || 0);
    const fmt = v => dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v));
    if (calm() || !to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function confetti(n) {
    if (calm()) return;
    const box = document.createElement("div"); box.className = "confetti";
    const cols = ["#FFC400", "#0D1B2E", "#3CC583", "#7FB0FF", "#ffffff", "#F0585D"];
    for (let i = 0; i < (n || 90); i++) {
      const c = document.createElement("i");
      c.style.left = Math.random() * 100 + "vw"; c.style.background = cols[i % cols.length];
      c.style.setProperty("--dx", (Math.random() * 160 - 80) + "px"); c.style.setProperty("--rot", (Math.random() * 900 - 450) + "deg");
      c.style.animationDuration = (1.8 + Math.random() * 1.6) + "s"; c.style.animationDelay = Math.random() * .5 + "s";
      if (i % 3 === 0) { c.style.width = "7px"; c.style.height = "7px"; c.style.borderRadius = "50%"; }
      box.appendChild(c);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 4500);
  }
  function enter() { const a = $("#app"); a.classList.remove("enter"); void a.offsetWidth; a.classList.add("enter"); }
  function setHeader(title, back) {
    $("#title").textContent = title;
    $("#back").style.visibility = back ? "visible" : "hidden";
    $("#back").onclick = () => { if (typeof back === "function") back(); else go(back); };
  }
  function foot(html) {
    $("#foot").innerHTML = html ? `<div class="inner">${html}</div>` : ""; $("#foot").style.display = html ? "block" : "none";
    document.body.classList.toggle("has-foot", !!html);
  }
  function go(hash) { location.hash = hash; }
  let timerHandle = null;
  function clearTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }

  // ---------- Startseite ----------
  function home() {
    clearTimer();
    setHeader("Security LernApp", null);
    const all = allQuestions(), c = counts(all);
    // Fortschritt: „sicher“ zählt voll, „1× richtig“ halb. So bewegt sich die Zahl schon nach der ersten richtigen Antwort.
    const pctSafe = c.total ? c.gruen / c.total * 100 : 0, pctHalf = c.total ? c.gelb / 2 / c.total * 100 : 0;
    const pct = pctSafe + pctHalf;
    const wrong = all.filter(q => status(q) === 1).length;
    const lastExam = S.exams[S.exams.length - 1];
    const run = exam && !exam.done ? exam : null;
    const st = streak(), td = today(), goal = S.settings.goal || 20, gpct = Math.min(100, td / goal * 100);
    let html = `${run ? `<button class="resume" data-go="#/pruefung/laeuft"><b>📝 Prüfung läuft</b><span>Frage ${run.i + 1} von ${run.list.length} · noch ${Math.max(0, Math.ceil((run.end - Date.now()) / 60000))} Min. · Weiter ▶</span></button>` : ""}
      <div class="badge"><div class="tape"><i id="tape" data-w="${pctSafe}"></i><i id="tape2" class="half" data-l="${pctSafe}" data-w="${pctHalf}"></i></div>
      <div class="top"><div class="title">Sachkunde § 34a GewO<b>Dein Lernstand</b></div><div class="pct"><span id="pctnum" data-to="${pct}" data-dec="${pct > 0 && pct < 10 ? 1 : 0}">0</span><small>%</small></div></div>
      <div class="stats"><div class="st-g"><b>${c.gruen}</b>sicher</div><div class="st-y"><b>${c.gelb}</b>1× richtig</div><div class="st-r"><b>${c.rot}</b>falsch</div><div><b>${c.neu}</b>neu</div></div>
      ${onlyOwn() ? `<div class="last">Fragen: nur deine eigenen (${S.custom.length}) · <a href="#/einstellungen" style="color:#FFCC5C">ändern</a></div>` : ""}</div>
      <div class="card daily"><div class="flame ${st ? "on" : ""}">🔥<b>${st}</b></div><div class="dinfo"><b>${st ? st + (st === 1 ? " Tag" : " Tage") + " in Folge" : "Starte deine Lernserie"}</b>
        <span class="muted">${td >= goal ? "Tagesziel geschafft ✅ " + td + " Fragen heute" : "Heute " + td + " von " + goal + " Fragen"}</span><div class="dbar"><i style="width:${gpct}%"></i></div></div></div>
      ${countdown()}
      ${tipCard()}
      <button class="btn big" data-go="#/lernen/mix">▶ Weiterlernen<small>${c.rot ? "Fehler und neue Fragen zuerst" : "Neue und unsichere Fragen zuerst"}</small></button>
      <div class="grid2">
        <button class="tile" data-go="#/lernen/fehler"><span class="big">🔁</span><b>Fehler wiederholen</b><span class="muted">${wrong} ${wrong === 1 ? "Frage" : "Fragen"}</span></button>
        <button class="tile" data-go="#/lernen/quick"><span class="big">⚡</span><b>Schnelltest</b><span class="muted">10 Zufallsfragen</span></button>
        <button class="tile" data-go="#/markiert"><span class="big">⭐</span><b>Markierte Fragen</b><span class="muted">${flaggedCount()} ${flaggedCount() === 1 ? "Frage" : "Fragen"}</span></button>
        <button class="tile" id="aihome"><span class="big">🤖</span><b>KI-Lernhelfer</b><span class="muted">Frag alles zum Stoff</span></button>
      </div>
      <button class="card examcard focuscard" data-go="#/fokus"><span class="big">🎯</span><span class="einfo"><b>Fokus-Runde</b><span class="muted">${(S.settings.focus || {}).min || 25} Min. konzentriert lernen, danach Pause</span></span><span class="chev">›</span></button>
      <button class="card examcard" data-go="#/pruefung"><span class="big">📝</span><span class="einfo"><b>Prüfung simulieren</b><span class="muted">${examSize()} Fragen · 120 Min.${lastExam ? ` · zuletzt <b class="${lastExam.pass ? "pass" : "fail"}">${lastExam.pct} %</b>` : ""}</span></span><span class="chev">›</span></button>
      ${syncLine()}
      ${VERSION ? `<button class="version" data-go="#/neu">Version ${esc(VERSION)} · Stand ${fmtDate(UPDATES[0].d)} · Was ist neu?</button>` : ""}`;
    $("#app").innerHTML = html; foot("");
    // Absperrband füllt sich, Prozentzahl zählt hoch
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const t = $("#tape"), t2 = $("#tape2"); if (!t) return;
      t.style.width = t.dataset.w + "%"; t2.style.left = t2.dataset.l + "%"; t2.style.width = t2.dataset.w + "%";
    }));
    countUp($("#pctnum"), 1200);
    // Einmaliger Hinweis nach einem Update
    if (VERSION && S.seenVersion !== VERSION) {
      const first = !S.seenVersion && !Object.keys(S.prog).length;
      S.seenVersion = VERSION; save();
      if (!first) toast("Update auf Version " + VERSION + " – Neuerungen unter Mehr → Was ist neu?");
    }
    $("#aihome").onclick = () => openAI(null);
  }

  // Empfehlung: das Sachgebiet, in dem die meisten Prüfungspunkte noch fehlen (Anteil unsicher × Fragen in der Prüfung)
  function tipCard() {
    let best = null;
    TOPICS.forEach(t => {
      const list = questionsOf(t.id); if (!list.length) return;
      const c = counts(list), m = (c.gruen + c.gelb / 2) / c.total, gap = (1 - m) * t.examCount;
      if (!best || gap > best.gap) best = { t, m, gap, c };
    });
    if (!best || best.gap < 0.5) return "";
    const pct = Math.round(best.m * 100), t = best.t;
    const why = best.c.rot ? best.c.rot + (best.c.rot === 1 ? " Fehler" : " Fehler") + " offen" : pct ? "erst " + pct + " % sicher" : "noch nicht angefangen";
    return `<button class="tipcard" data-go="#/lernen/t-${t.id}"><span class="tico">${t.icon}</span><span class="tinf"><small>💡 Heute am meisten wert</small><b>${esc(t.short)} üben</b><span>${t.examCount} Fragen in der Prüfung · ${why}</span></span><span class="chev">›</span></button>`;
  }
  // Prüfungstermin: Tage bis zur Prüfung und wie viele Fragen pro Tag dafür nötig sind
  function countdown() {
    const d = S.settings.examDate; if (!d) return "";
    const days = Math.round((new Date(d + "T00:00:00") - new Date(dayKey() + "T00:00:00")) / 864e5);
    if (days < 0) return "";
    if (days === 0) return `<div class="cdown today"><span class="cdn">🍀</span><span><b>Heute ist Prüfung!</b>Ruhig bleiben, jede Frage genau lesen. Viel Erfolg!</span></div>`;
    const c = counts(allQuestions()), open = c.total - c.gruen;
    const per = Math.ceil(open * 2 / days); // jede noch nicht sichere Frage braucht etwa zwei richtige Antworten
    const goal = S.settings.goal || 20;
    return `<div class="cdown"><span class="cdn"><b>${days}</b>${days === 1 ? "Tag" : "Tage"}</span><span><b>bis zur Prüfung am ${fmtDate(d)}</b>${open ? `Noch ${open} Fragen nicht sicher · etwa <b class="${per > goal ? "fail" : "pass"}">${per} Fragen pro Tag</b>${per > goal ? ` (dein Ziel: ${goal})` : ""}` : "Alle Fragen sitzen – jetzt nur noch wiederholen 💪"}</span></div>`;
  }
  // Kleine Zeile auf der Startseite, ob der Abgleich klappt
  function syncLine() {
    const c = syncConf(); if (!c.token) return "";
    if (syncErr) return `<button class="syncline bad" data-go="#/einstellungen">⚠️ Abgleich: ${esc(syncErr)}</button>`;
    if (!c.last) return "";
    const min = Math.round((Date.now() - c.last) / 60000);
    return `<button class="syncline" data-go="#/einstellungen">☁️ PC und Handy abgeglichen ${min < 1 ? "gerade eben" : "vor " + min + " Min."}</button>`;
  }

  // ---------- Lernen: alle Sachgebiete ----------
  function topicsPage() {
    clearTimer();
    setHeader("Lernen", null);
    let html = `<p class="muted" style="margin:0 2px 12px">Wähle ein Sachgebiet. Die Zahl rechts zeigt, wie viel du davon sicher kannst.</p>`;
    TOPICS.forEach((t, k) => {
      const tc = counts(questionsOf(t.id)), p = tc.total ? Math.round((tc.gruen + tc.gelb / 2) / tc.total * 100) : 0;
      html += `<button class="card topic" data-go="#/thema/${t.id}" style="--d:${k * 35}ms"><div class="ico">${t.icon}</div><div class="info">
        <div class="name">${esc(t.name)}</div><div class="muted">${tc.total} Fragen · ${t.examCount} in der Prüfung</div>${bar(tc)}</div><div class="tpct">${p}<small>%</small></div></button>`;
    });
    html += `<div class="legend"><span><i class="g"></i>sicher (2× richtig)</span><span><i class="y"></i>1× richtig</span><span><i class="r"></i>zuletzt falsch</span><span><i style="background:var(--grey)"></i>neu</span></div>`;
    $("#app").innerHTML = html; foot("");
  }

  // ---------- Themenseite ----------
  function topicPage(tid) {
    clearTimer();
    const t = topicById(tid); if (!t) return go("#/");
    setHeader(t.short, "#/themen");
    const list = questionsOf(tid), c = counts(list), p = c.total ? Math.round((c.gruen + c.gelb / 2) / c.total * 100) : 0;
    const row = (go, ico, title, sub, cls) => `<button class="mode ${cls || ""}" data-go="${go}"><span class="mi">${ico}</span><span class="mt"><b>${title}</b><span>${sub}</span></span><span class="chev">›</span></button>`;
    $("#app").innerHTML = `<div class="badge thero"><div class="top"><div class="title">${t.icon} ${esc(t.short)}<b>${esc(t.name)}</b></div><div class="pct">${p}<small>%</small></div></div>
      <div class="stats"><div class="st-g"><b>${c.gruen}</b>sicher</div><div class="st-y"><b>${c.gelb}</b>1× richtig</div><div class="st-r"><b>${c.rot}</b>falsch</div><div><b>${c.neu}</b>neu</div></div>
      <div class="tbar">${bar(c)}</div><div class="last">${list.length} Fragen · ${t.examCount} davon kommen in der Prüfung</div></div>
      ${row(`#/lernen/t-${tid}`, "▶", "Üben", "Fehler und neue Fragen zuerst · 20 Fragen", "primary")}
      <div class="card modes">
        ${row(`#/kapitel/${tid}`, "📖", "Lernkapitel lesen", "Das Wichtigste kurz erklärt")}
        ${row(`#/lernen/f-${tid}`, "🔁", "Nur Fehler", c.rot ? c.rot + (c.rot === 1 ? " Frage" : " Fragen") + " zuletzt falsch" : "Gerade keine Fehler 🎉", c.rot ? "" : "dim")}
        ${row(`#/lernen/q-${tid}`, "⚡", "Schnelltest", "10 Zufallsfragen")}
        ${row(`#/lernen/a-${tid}`, "📋", "Alle Fragen der Reihe nach", list.length + " Fragen")}
      </div>`;
    foot("");
    requestAnimationFrame(() => document.querySelectorAll(".thero .bar span").forEach(x => x.classList.add("grow")));
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
    else if (mode === "fokus") { if (!focus) return go("#/fokus"); list = pickSmart(allQuestions(), 20); title = "Fokus"; back = () => endFocus(true); }
    else if (mode === "fehler") { list = shuffle(allQuestions().filter(q => status(q) === 1)); title = "Fehler wiederholen"; }
    else if (mode === "markiert") { list = shuffle(allQuestions().filter(q => S.flags[q.id])); title = "Markierte Fragen"; }
    else if (mode === "quick") { list = shuffle(allQuestions()).slice(0, 10); title = "Schnelltest"; }
    else {
      const [k, tid] = [mode[0], mode.slice(2)];
      const t = topicById(tid); if (!t || mode[1] !== "-") return go("#/themen");
      const all = questionsOf(tid); back = "#/thema/" + tid;
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
    session = { list, i: 0, sel: [], checked: false, right: 0, title, back, order: null, combo: 0, best: 0, hist: [], focus: mode === "fokus" };
    renderQ();
  }
  function prepOrder(q) { return shuffle(q.a.map((_, i) => i)); }
  function renderQ() {
    const s = session, q = s.list[s.i];
    if (!s.order) s.order = prepOrder(q);
    setHeader(s.title, s.back);
    const t = topicById(q.topic);
    // Fortschritt: bei kurzen Runden ein Feld pro Frage (grün/rot), sonst ein Balken
    const seg = s.list.length <= 30
      ? `<div class="seg">${s.list.map((_, k) => `<i class="${k < s.hist.length ? (s.hist[k] ? "ok" : "bad") : k === s.i ? "cur" : ""}"></i>`).join("")}</div>`
      : `<div class="progress"><div style="width:${s.hist.length / s.list.length * 100}%"></div></div>`;
    let html = `${seg}
      <div class="qhead"><span><span class="qn">Frage <b>${s.i + 1}</b>/${s.list.length}</span><span class="pill">${t ? t.short : ""}</span>${q.own ? '<span class="pill">eigene</span>' : ""}${s.again && s.again[s.i] ? '<span class="pill again">🔁 nochmal</span>' : ""}</span>
      <span><button class="flagbtn" id="aiq">🤖 KI-Hilfe</button> <button class="flagbtn ${S.flags[q.id] ? "on" : ""}" id="flag">⭐ ${S.flags[q.id] ? "markiert" : "merken"}</button></span></div>
      <div class="card qcard">${s.combo >= 2 ? `<span class="combo${s.just ? " pop" : ""}">🔥 ${s.combo}</span>` : ""}<div class="qtext">${esc(q.q)}</div><div class="hint">${S.settings.showCount ? `<span class="count">👉 ${countText(q)}</span> · ${s.sel.length} gewählt` : "Wähle alle richtigen Antworten aus (eine oder mehrere)."}</div>`;
    const just = s.just; s.just = false;
    s.order.forEach((ai, k) => {
      let cls = s.sel.includes(ai) ? "sel" : "";
      if (s.checked) {
        const good = q.c.includes(ai);
        if (good && s.sel.includes(ai)) cls = "ok sel"; else if (good) cls = "ok miss"; else if (s.sel.includes(ai)) cls = "bad";
      }
      const L = String.fromCharCode(65 + k);
      const mark = s.checked ? (q.c.includes(ai) ? "✓" : (s.sel.includes(ai) ? "✗" : L)) : (s.sel.includes(ai) ? "✓" : L);
      if (just && (s.sel.includes(ai) || q.c.includes(ai))) cls += " just";
      html += `<button class="ans ${cls}" data-a="${ai}" ${s.checked ? "disabled" : ""} style="--k:${k}" aria-label="Antwort ${L}"><span class="box">${mark}</span><span>${esc(q.a[ai])}</span></button>`;
    });
    if (s.checked) {
      const ok = isRight(q, s.sel);
      const praise = ["Richtig!", "Stark!", "Genau!", "Sitzt!", "Sauber!"][s.i % 5];
      html += `<div class="expl ${ok ? "ok" : "bad"}"><div class="vhead"><span class="vico">${ok ? "✓" : "✗"}</span><b>${ok ? praise : "Leider falsch"}</b>${ok && s.combo >= 3 ? `<span class="vsub">${s.combo} in Folge 🔥</span>` : !ok ? `<span class="vsub">Richtig ist ${q.c.length === 1 ? "die grün markierte Antwort" : "grün markiert"}</span>` : ""}</div>${q.e ? `<p>${esc(q.e)}</p>` : ""}${q.p ? `<span class="para">📌 ${esc(q.p)}</span>` : ""}</div>`;
    }
    html += `</div>`;
    $("#app").innerHTML = html;
    if (s.slide) { s.slide = false; const cd = $("#app .card"); if (cd) cd.classList.add("slidein"); }
    $("#flag").onclick = () => { if (S.flags[q.id]) { delete S.flags[q.id]; forget("f:" + q.id); } else S.flags[q.id] = Date.now(); save(); renderQ(); };
    $("#aiq").onclick = () => openAI(q, s.checked ? s.sel : null, s.order);
    document.querySelectorAll(".ans").forEach(b => b.onclick = () => {
      const a = +b.dataset.a; const i = s.sel.indexOf(a);
      if (i >= 0) s.sel.splice(i, 1); else s.sel.push(a); SFX.tap(); renderQ();
    });
    if (!s.checked) foot(`<button class="btn" id="check" ${s.sel.length ? "" : "disabled"}>Antwort prüfen</button>`);
    else foot(`<button class="btn" id="next">${s.i + 1 < s.list.length || s.focus ? "Nächste Frage ▶" : "Auswertung ▶"}</button>`);
    if (s.focus) focusPill();
    const ch = $("#check"); if (ch) ch.onclick = () => {
      s.checked = true; s.just = true; const ok = isRight(q, s.sel);
      s.hist.push(ok);
      if (ok) { s.right++; s.combo++; s.best = Math.max(s.best, s.combo); SFX.ok(); if (s.combo >= 3) SFX.combo(s.combo); } else { s.combo = 0; SFX.bad(); }
      // Falsch beantwortet: Die Frage kommt in dieser Runde nach 3 anderen Fragen noch einmal (einmal pro Frage)
      if (!ok && !(s.again && s.again[s.i])) {
        s.again = s.again || {}; s.redo = s.redo || {};
        if (!s.redo[q.id]) { s.redo[q.id] = 1; const at = Math.min(s.i + 4, s.list.length);
          const moved = {}; Object.keys(s.again).forEach(k => { moved[+k >= at ? +k + 1 : k] = 1; }); s.again = moved; s.again[at] = 1; s.list.splice(at, 0, q); }
      }
      record(q, ok); if (s.focus && focus) { focus.n++; if (ok) focus.right++; } renderQ();
      const ex = $(".expl"); if (ex && ex.getBoundingClientRect().bottom > innerHeight - 90) ex.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "center" });
    };
    const nx = $("#next"); if (nx) nx.onclick = () => { s.i++; s.sel = []; s.checked = false; s.order = null; if (s.i >= s.list.length && s.focus) { s.list = pickSmart(allQuestions(), 20); s.i = 0; s.hist = []; s.again = {}; s.redo = {}; s.slide = true; window.scrollTo(0, 0); renderQ(); } else if (s.i >= s.list.length) learnDone(); else { s.slide = true; window.scrollTo(0, 0); renderQ(); } };
  }
  function isRight(q, sel) { return sel.length === q.c.length && sel.every(a => q.c.includes(a)); }
  // Punkte wie in der IHK-Prüfung seit 1. Juli 2025: je richtig angekreuzter Antwort ein Punkt (Teilpunkte).
  // Wie falsche Kreuze gewertet werden, hat die IHK nicht veröffentlicht. Annahme der App: jedes falsche Kreuz hebt einen Punkt auf (nie unter 0).
  function points(q, sel) { const good = sel.filter(a => q.c.includes(a)).length, bad = sel.length - good; return Math.max(0, good - bad); }
  function learnDone() {
    const s = session, n = s.list.length, pct = Math.round(s.right / n * 100), R = 52, C = 2 * Math.PI * R;
    const goal = S.settings.goal || 20;
    const head = pct === 100 ? "Fehlerfrei! 🏆" : pct >= 80 ? "Stark, weiter so!" : pct >= 50 ? "Gut gemacht!" : "Dranbleiben!";
    const sub = pct >= 80 ? "Du bist auf einem sehr guten Weg zur Prüfung." : pct >= 50 ? "Die falschen Fragen kommen bald wieder dran." : "Lies das Lernkapitel noch einmal und übe die Fehler.";
    $("#app").innerHTML = `<div class="card donecard">
      <div class="ring ${pct >= 50 ? "pass" : "fail"}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="${R}"/><circle class="val" id="rval" cx="60" cy="60" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${C * (1 - s.right / n)}"/></svg>
        <div class="rin"><b id="rnum" data-to="${s.right}">0</b><small>von ${n} richtig</small></div></div>
      <h2>${head}</h2><p class="muted" style="margin-top:-6px">${sub}</p>
      <div class="chips"><div><b class="pass">${s.right}</b>richtig</div><div><b class="fail">${n - s.right}</b>falsch</div><div><b>🔥 ${s.best}</b>beste Serie</div><div><b>${today()}</b>heute${today() >= goal ? " ✅" : " / " + goal}</div></div></div>`;
    foot(`<button class="btn sec" data-go="${s.back}">Zurück</button><button class="btn" id="again">Neue Runde</button>`);
    enter(); countUp($("#rnum"), 900); SFX.done();
    requestAnimationFrame(() => requestAnimationFrame(() => { const v = $("#rval"); if (v) v.style.strokeDashoffset = v.dataset.off; }));
    if (pct >= 80) setTimeout(() => confetti(pct === 100 ? 120 : 70), 700);
    $("#again").onclick = () => router(true);
  }

  // ---------- Fokus-Runde ----------
  // Feste Lernzeit (Pomodoro): Navigation weg, Zeit läuft sichtbar, Bildschirm bleibt an, auf Wunsch ruhiges Rauschen.
  // Wer die App verlässt, wird beim Zurückkommen begrüßt, und es wird als Ablenkung gezählt.
  let focus = null, fTimer = null, wake = null;
  const fmtMin = ms => { const t = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
  const NOISE = (() => {
    let ctx = null, src = null, gain = null;
    return {
      start() {
        const A = window.AudioContext || window.webkitAudioContext; if (!A || src) return;
        try {
          ctx = ctx || new A(); if (ctx.state === "suspended") ctx.resume().catch(() => {});
          // Braunes Rauschen: tief und gleichmäßig, überdeckt Geräusche ohne abzulenken
          const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
          let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
          src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
          gain = ctx.createGain(); gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.5);
          src.connect(gain); gain.connect(ctx.destination); src.start();
        } catch (e) { src = null; }
      },
      stop() {
        if (!src) return; const s0 = src; src = null;
        try { gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6); setTimeout(() => { try { s0.stop(); } catch (e) {} }, 700); } catch (e) {}
      }
    };
  })();
  async function keepAwake(on) {
    try {
      if (on && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); }
      else if (!on && wake) { await wake.release(); wake = null; }
    } catch (e) { wake = null; }
  }
  function focusPage() {
    clearTimer();
    setHeader("Fokus-Runde", "#/");
    const f = S.settings.focus || { min: 25, noise: false };
    const last = (S.settings.focusLog || []).slice(-1)[0];
    $("#app").innerHTML = `<div class="badge thero focushero"><div class="top"><div class="title">🎯 Konzentriert lernen<b>Fokus-Runde</b></div></div>
      <div class="last">Eine feste Zeit nur Fragen, ohne Menü und ohne Ablenkung. Danach eine kurze Pause.</div></div>
      <div class="card"><h2>Wie lange?</h2><div class="fchoice" id="fmin">${[15, 25, 45].map(m => `<button class="${f.min === m ? "on" : ""}" data-m="${m}"><b>${m}</b>Min.</button>`).join("")}</div>
      <label class="frow"><input type="checkbox" id="fnoise" ${f.noise ? "checked" : ""}> 🎧 Ruhiges Rauschen im Hintergrund<span class="muted">überdeckt Geräusche um dich herum, am besten mit Kopfhörern</span></label>
      <div class="ftips"><b>So klappt's:</b><span>📵 Handy auf „Nicht stören“ stellen</span><span>💧 Wasser bereitstellen</span><span>💡 Helles Licht, nicht im Bett lernen</span><span>🚪 Andere Apps und Tabs schließen</span></div>
      <p class="muted">😴 <b>Gegen Müdigkeit:</b> Tippst du eine Minute lang nichts, klingelt die App leise und gibt dir eine kurze Aufgabe zum Wachwerden.</p></div>
      ${last ? `<p class="muted" style="text-align:center">Letzte Fokus-Runde: ${last.n} Fragen, ${last.n ? Math.round(last.r / last.n * 100) : 0} % richtig${last.a ? ", " + last.a + "× abgelenkt" : ", ohne Ablenkung 👏"}</p>` : ""}`;
    foot(`<button class="btn" id="fstart">▶ Fokus starten</button>`);
    document.querySelectorAll("#fmin button").forEach(b => b.onclick = () => { document.querySelectorAll("#fmin button").forEach(x => x.classList.toggle("on", x === b)); SFX.tap(); });
    $("#fstart").onclick = () => {
      const min = +($("#fmin .on") || { dataset: { m: 25 } }).dataset.m, noise = $("#fnoise").checked;
      S.settings.focus = { min, noise }; S.settings._t = Date.now(); save();
      startFocus(min, noise);
    };
  }
  function startFocus(min, noise) {
    SFX.unlock();
    focus = { min, noise, end: Date.now() + min * 60000, n: 0, right: 0, away: 0, left: 0, act: Date.now(), nod: 0 };
    document.body.classList.add("focus");
    if (noise) NOISE.start();
    keepAwake(true);
    clearInterval(fTimer); fTimer = setInterval(focusTick, 1000);
    if (location.hash === "#/lernen/fokus") router(true); else go("#/lernen/fokus");
    toast("Los geht's – " + min + " Minuten nur für dich 🎯");
  }
  function focusPill() {
    if (!focus) return;
    let el = $("#fpill");
    if (!el) { el = document.createElement("button"); el.id = "fpill"; el.className = "fpill"; $("header").appendChild(el); el.onclick = () => endFocus(true); }
    const left = focus.end - Date.now(), share = Math.max(0, Math.min(1, left / (focus.min * 60000)));
    el.innerHTML = `<span class="fring" style="--p:${share * 360}deg"></span>${fmtMin(left)}<small>Beenden</small>`;
    el.title = "Fokus-Runde beenden";
  }
  function focusTick() {
    if (!focus) return;
    if (location.hash !== "#/lernen/fokus") return;
    focusPill();
    if (Date.now() >= focus.end) return focusDone();
    if (!document.hidden && !$("#wakeov") && Date.now() - focus.act > WAKE_MS) wakeUp();
  }
  function endFocus(ask) {
    if (!focus) return go("#/");
    if (ask && !confirm("Fokus-Runde jetzt beenden?")) return;
    focusDone(true);
  }
  function stopFocusEffects() {
    const ov = $("#wakeov"); if (ov) ov.remove();
    clearInterval(fTimer); fTimer = null; NOISE.stop(); keepAwake(false);
    document.body.classList.remove("focus"); const p = $("#fpill"); if (p) p.remove();
  }
  function focusDone(early) {
    const f = focus; if (!f) return;
    focus = null; stopFocusEffects(); session = null;
    const log = (S.settings.focusLog || []).concat([{ d: Date.now(), m: f.min, n: f.n, r: f.right, a: f.away, early: !!early }]).slice(-20);
    S.settings.focusLog = log; S.settings._t = Date.now(); save();
    if (!early) SFX.pass();
    focusResult(f, early);
  }
  function focusResult(f, early) {
    clearTimer();
    setHeader(early ? "Fokus beendet" : "Geschafft! Pause 🌿", "#/");
    const pct = f.n ? Math.round(f.right / f.n * 100) : 0;
    $("#app").innerHTML = `<div class="card donecard"><div class="fbig">${early ? "🎯" : "🌿"}</div>
      <h2>${early ? "Fokus-Runde beendet" : f.min + " Minuten konzentriert gelernt!"}</h2>
      <p class="muted" style="margin-top:-6px">${early ? "Auch kurze Runden zählen." : (f.nod ? "Jetzt 5 Minuten Pause, und zwar in Bewegung: raus an die frische Luft oder ein paar Treppen laufen. Das macht wacher als Sitzen." : "Jetzt 5 Minuten Pause: aufstehen, bewegen, Wasser trinken, nicht aufs Handy schauen.")}</p>
      <div class="chips"><div><b>${f.n}</b>Fragen</div><div><b class="${pct >= 50 ? "pass" : "fail"}">${pct} %</b>richtig</div><div><b>${f.away ? f.away + "×" : "0 👏"}</b>abgelenkt</div><div><b>${f.nod ? f.nod + "×" : "0 💪"}</b>eingenickt</div></div>
      ${!early ? `<div class="breakbox" id="bbox"><b id="btime">5:00</b><span>Pause</span></div>` : ""}</div>`;
    foot(early ? `<button class="btn sec" data-go="#/">Startseite</button><button class="btn" data-go="#/fokus">Neue Runde</button>`
      : `<button class="btn sec" data-go="#/">Fertig für heute</button><button class="btn" id="fagain">Noch eine Runde ▶</button>`);
    enter(); if (!early && f.n && pct >= 80) setTimeout(() => confetti(60), 500);
    const again = $("#fagain"); if (again) again.onclick = () => startFocus(f.min, f.noise);
    if (!early) {
      const end = Date.now() + 5 * 60000;
      timerHandle = setInterval(() => {
        const el = $("#btime"); if (!el) return clearTimer();
        const left = end - Date.now(); el.textContent = fmtMin(left);
        if (left <= 0) { clearTimer(); $("#bbox").classList.add("over"); el.textContent = "Weiter!"; SFX.done(); toast("Pause vorbei – bereit für die nächste Runde?"); }
      }, 1000);
    }
  }
  // Wachhalten: 60 Sekunden ohne Tippen → Ton, Vibration und eine kleine Aufgabe zum Wachwerden
  const WAKE_MS = 60000;
  const WAKE_TASKS = ["Steh auf und mach 10 Kniebeugen", "Trink ein großes Glas kaltes Wasser", "Öffne kurz das Fenster und atme 5× tief durch", "Lies die nächste Frage laut vor", "Kreise 10× die Schultern und streck dich", "Klatsch 20× in die Hände", "Lern die nächsten Fragen im Stehen", "Wasch dir kurz das Gesicht mit kaltem Wasser"];
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(ev => document.addEventListener(ev, () => { if (focus) focus.act = Date.now(); }, { passive: true }));
  function wakeUp() {
    focus.nod++;
    const task = WAKE_TASKS[(focus.nod - 1 + Math.floor(Math.random() * WAKE_TASKS.length)) % WAKE_TASKS.length];
    SFX.alarm(); if (navigator.vibrate) navigator.vibrate([200, 120, 200, 120, 400]);
    const ov = document.createElement("div"); ov.id = "wakeov"; ov.className = "wakeov";
    ov.innerHTML = `<div class="wakebox"><div class="wz">😴</div><b>Noch wach?</b><p>Du hast seit einer Minute nichts getippt.</p>
      <div class="wtask">⚡ ${esc(task)}</div><button class="btn" id="wakeok">Bin wieder wach ✋</button>
      ${focus.nod >= 3 ? `<p class="muted">Schon ${focus.nod}× weggenickt. Wenn du richtig müde bist, merkt sich dein Kopf wenig. Dann lieber 20 Minuten hinlegen und danach weiterlernen.</p><button class="btn ghost" id="wakeend">Fokus-Runde beenden</button>` : ""}</div>`;
    document.body.appendChild(ov);
    // Nach weiteren 30 Sekunden ohne Reaktion noch einmal klingeln
    const again = setInterval(() => { if (!$("#wakeov")) return clearInterval(again); SFX.alarm(); if (navigator.vibrate) navigator.vibrate(400); }, 30000);
    $("#wakeok").onclick = () => { clearInterval(again); ov.remove(); focus && (focus.act = Date.now()); SFX.ok(); };
    const we = $("#wakeend"); if (we) we.onclick = () => { clearInterval(again); ov.remove(); focusDone(true); };
  }
  // Ablenkungen zählen: App verlassen und nach mehr als 5 Sekunden zurückkommen
  document.addEventListener("visibilitychange", () => {
    if (!focus) return;
    if (document.hidden) { focus.left = Date.now(); return; }
    keepAwake(true);
    if (focus.left && Date.now() - focus.left > 5000) {
      focus.away++;
      const rest = focus.end - Date.now();
      toast(rest > 0 ? "Willkommen zurück 💪 Noch " + fmtMin(rest) + " Min." : "Willkommen zurück!");
    }
    focus.left = 0; focusTick();
  });

  // ---------- Prüfungssimulation ----------
  const examSize = () => TOPICS.reduce((n, t) => n + Math.min(t.examCount, questionsOf(t.id).length), 0);
  const EXAM_MIN = 120;
  // Die laufende Prüfung wird gespeichert, damit sie das Schließen der App übersteht
  const EXKEY = "slapp-exam";
  function saveExam() {
    try {
      if (!exam) return localStorage.removeItem(EXKEY);
      const { list, ...rest } = exam;
      localStorage.setItem(EXKEY, JSON.stringify(Object.assign(rest, { ids: list.map(q => q.id) })));
    } catch (e) {}
  }
  function loadExam() {
    try {
      const d = JSON.parse(localStorage.getItem(EXKEY)); if (!d || !d.ids) return null;
      const list = d.ids.map(qAny); if (list.some(q => !q)) return null;
      delete d.ids; return Object.assign(d, { list });
    } catch (e) { return null; }
  }
  let exam = loadExam();
  function examIntro() {
    clearTimer();
    setHeader("Prüfungssimulation", null);
    const hist = S.exams.slice(-5).reverse();
    const run = exam && !exam.done ? exam : null;
    $("#app").innerHTML = `${run ? `<div class="card runcard"><h2>⏱ Prüfung läuft</h2><p>Frage ${run.i + 1} von ${run.list.length}, ${run.ans.filter(a => a.length).length} beantwortet, noch ${Math.max(0, Math.ceil((run.end - Date.now()) / 60000))} Minuten.</p>
      <button class="btn" data-go="#/pruefung/laeuft">Prüfung fortsetzen ▶</button><button class="btn ghost" id="dropExam">Verwerfen und neu starten</button></div>` : ""}
      <div class="card"><h2>📝 Wie in der IHK-Prüfung</h2>
      <ul><li><b>${examSize()} Fragen</b> aus allen 9 Sachgebieten, verteilt wie in der Prüfung</li>
      <li><b>120 Minuten</b> Zeit</li><li>Eine oder mehrere Antworten können richtig sein. Wie bei der IHK seit 1. Juli 2025 gibt es <b>Teilpunkte</b>: einen Punkt für jede richtig angekreuzte Antwort.</li>
      <li>Wie falsche Kreuze zählen, hat die IHK nicht veröffentlicht. Die App zieht vorsichtshalber für jedes falsche Kreuz einen Punkt dieser Frage ab. Kreuze also nur an, was du sicher weißt.</li>
      <li>Bestanden ab <b>50 % der Punkte</b> (IHK: 60 von 120 Punkten)</li><li>Die Lösungen siehst du erst am Ende.</li></ul>
      <table><tr><th>Sachgebiet</th><th class="n">Fragen</th></tr>${TOPICS.map(t => `<tr><td>${t.icon} ${esc(t.name)}</td><td class="n">${Math.min(t.examCount, questionsOf(t.id).length)}</td></tr>`).join("")}</table>${onlyOwn() ? `<p class="muted">Die Prüfung nutzt nur deine eigenen Fragen.${TOPICS.some(t => questionsOf(t.id).length < t.examCount) ? " In manchen Sachgebieten hast du weniger Fragen als in der echten Prüfung, deshalb ist sie kürzer." : ""}</p>` : ""}</div>
      ${hist.length ? `<div class="card"><h3>Deine letzten Prüfungen</h3><table>${hist.map(h => `<tr><td>${new Date(h.d).toLocaleDateString("de-DE")} ${new Date(h.d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</td><td class="n">${h.pts != null ? h.pts + "/" + h.max + " P." : h.right + "/" + h.total}</td><td class="n ${h.pass ? "pass" : "fail"}"><b>${h.pct}%</b></td></tr>`).join("")}</table></div>` : ""}`;
    if (run) {
      foot("");
      $("#dropExam").onclick = () => { if (confirm("Laufende Prüfung verwerfen?")) { exam = null; saveExam(); examIntro(); } };
    } else {
      foot(`<button class="btn" id="startExam">Prüfung starten</button>`);
      $("#startExam").onclick = startExam;
    }
  }
  function startExam() {
    let list = [];
    TOPICS.forEach(t => { list = list.concat(shuffle(questionsOf(t.id)).slice(0, t.examCount)); }); // eingebaute und eigene/importierte Fragen
    exam = { list, order: list.map(prepOrder), ans: list.map(() => []), flag: {}, i: 0, end: Date.now() + EXAM_MIN * 60000, done: false };
    saveExam();
    if (location.hash === "#/pruefung/laeuft") router(true); else go("#/pruefung/laeuft");
  }
  function examRender() {
    if (!exam) return go("#/pruefung");
    if (exam.done) return examResult();
    const e = exam, q = e.list[e.i];
    setHeader("Prüfung", () => { clearTimer(); go("#/pruefung"); }); // Prüfung läuft weiter und kann fortgesetzt werden
    let html = `<div class="qhead"><span>Frage ${e.i + 1} / ${e.list.length} · <span class="pill">${topicById(q.topic).short}</span></span><span class="timer" id="timer"></span></div>
      <div class="card"><div class="qtext">${esc(q.q)}</div><div class="hint">${S.settings.showCount ? `<span class="count">👉 ${countText(q)}</span> · ${e.ans[e.i].length} gewählt` : "Eine oder mehrere Antworten sind richtig."}</div>`;
    e.order[e.i].forEach((ai, k) => {
      const sel = e.ans[e.i].includes(ai);
      html += `<button class="ans ${sel ? "sel" : ""}" data-a="${ai}" aria-label="Antwort ${String.fromCharCode(65 + k)}"><span class="box">${sel ? "✓" : String.fromCharCode(65 + k)}</span><span>${esc(q.a[ai])}</span></button>`;
    });
    html += `<button class="flagbtn ${e.flag[e.i] ? "on" : ""}" id="eflag" style="margin-top:6px">⚑ ${e.flag[e.i] ? "zur Kontrolle markiert" : "später prüfen"}</button></div>
      <div class="card"><div class="muted" style="margin-bottom:8px">Übersicht (blau = beantwortet, gelber Rand = markiert)</div><div class="navgrid">
      ${e.list.map((_, i) => `<button data-n="${i}" class="${i === e.i ? "cur" : ""} ${e.ans[i].length ? "done" : ""} ${e.flag[i] ? "flag" : ""}">${i + 1}</button>`).join("")}</div>
      <button class="btn danger" id="submit" style="margin-top:14px">Prüfung abgeben</button></div>`;
    $("#app").innerHTML = html;
    document.querySelectorAll(".ans").forEach(b => b.onclick = () => {
      const a = +b.dataset.a, arr = e.ans[e.i], i = arr.indexOf(a);
      if (i >= 0) arr.splice(i, 1); else arr.push(a); SFX.tap(); saveExam(); examRender();
    });
    document.querySelectorAll(".navgrid button").forEach(b => b.onclick = () => { e.i = +b.dataset.n; saveExam(); examRender(); window.scrollTo(0, 0); });
    $("#eflag").onclick = () => { e.flag[e.i] = !e.flag[e.i]; saveExam(); examRender(); };
    $("#submit").onclick = () => {
      const open = e.ans.filter(a => !a.length).length;
      if (confirm(open ? `Noch ${open} Fragen unbeantwortet. Trotzdem abgeben?` : "Prüfung jetzt abgeben?")) finishExam();
    };
    foot(`<button class="btn sec" id="prev" ${e.i ? "" : "disabled"}>◀ Zurück</button><button class="btn" id="nextq">${e.i + 1 < e.list.length ? "Weiter ▶" : "Zur Abgabe"}</button>`);
    $("#prev").onclick = () => { e.i--; saveExam(); examRender(); window.scrollTo(0, 0); };
    $("#nextq").onclick = () => { if (e.i + 1 < e.list.length) { e.i++; saveExam(); examRender(); window.scrollTo(0, 0); } else $("#submit").scrollIntoView({ behavior: "smooth" }); };
    tick(); clearTimer(); timerHandle = setInterval(tick, 1000);
  }
  function tick() {
    if (!exam) return clearTimer();
    const left = Math.max(0, exam.end - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
    const el = $("#timer"); if (el) { el.textContent = "⏱ " + m + ":" + String(s).padStart(2, "0"); el.style.color = left < 600000 ? "var(--red)" : ""; }
    if (left <= 0) { clearTimer(); if (!exam.done) { toast("Die Zeit ist abgelaufen. Die Prüfung wird ausgewertet."); finishExam(); } }
  }
  function finishExam() {
    clearTimer();
    const e = exam; e.done = true;
    e.res = e.list.map((q, i) => isRight(q, e.ans[i]));
    e.pts = e.list.map((q, i) => points(q, e.ans[i]));
    e.max = e.list.reduce((n, q) => n + q.c.length, 0);
    e.list.forEach((q, i) => record(q, e.res[i]));
    const right = e.res.filter(Boolean).length, got = e.pts.reduce((a, b) => a + b, 0), pct = Math.round(got / e.max * 100);
    S.exams.push({ d: Date.now(), right, total: e.list.length, pts: got, max: e.max, pct, pass: got * 2 >= e.max }); save(); saveExam();
    if (location.hash === "#/pruefung/ergebnis") router(true); else go("#/pruefung/ergebnis");
  }
  function examResult() {
    if (!exam || !exam.done) return go("#/pruefung");
    clearTimer();
    const e = exam, right = e.res.filter(Boolean).length, got = e.pts.reduce((a, b) => a + b, 0), pct = Math.round(got / e.max * 100), pass = got * 2 >= e.max;
    setHeader("Ergebnis", "#/");
    const per = TOPICS.map(t => { const idx = e.list.map((q, i) => i).filter(i => e.list[i].topic === t.id); return { t, r: idx.reduce((n, i) => n + e.pts[i], 0), n: idx.reduce((n, i) => n + e.list[i].c.length, 0) }; }).filter(x => x.n);
    $("#app").innerHTML = `<div class="card" style="text-align:center;padding:24px 16px"><div class="result ${pass ? "pass" : "fail"}"><span id="epct" data-to="${pct}">0</span> %</div>
      <div class="stamp ${pass ? "pass" : "fail"}">${pass ? "Bestanden" : "Nicht bestanden"}</div><p style="margin:16px 0 2px"><b>${got} von ${e.max} Punkten</b> · bestanden ab ${Math.ceil(e.max / 2)}</p><p class="muted" style="margin:0">${right} von ${e.list.length} Fragen vollständig richtig</p></div>
      <div class="card"><h3 style="margin-top:0">Nach Sachgebiet</h3>${per.map(x => { const q = Math.round(x.r / x.n * 100); return `<div class="perrow"><span>${x.t.icon} ${esc(x.t.short)}</span><span class="pbar"><i class="${q >= 50 ? "g" : "r"}" style="width:${q}%"></i></span><span class="n">${x.r}/${x.n}</span></div>`; }).join("")}
      <p class="muted" style="margin-bottom:0">Rot = unter 50 %. Diese Sachgebiete solltest du noch üben.</p></div>
      <div class="card"><h3>Fragen ansehen</h3><div class="muted" style="margin-bottom:8px">Grün = vollständig richtig, Rot = nicht vollständig richtig. Tippe auf eine Nummer.</div>
      <div class="navgrid">${e.list.map((_, i) => `<button data-n="${i}" class="${e.res[i] ? "ok" : "no"}">${i + 1}</button>`).join("")}</div></div>
      <div id="review"></div>`;
    document.querySelectorAll(".navgrid button").forEach(b => b.onclick = () => showReview(+b.dataset.n));
    foot(`<button class="btn sec" data-go="#/lernen/fehler">Fehler üben</button><button class="btn" id="newExam">Neue Prüfung</button>`);
    $("#newExam").onclick = startExam;
    if (!exam.shown) { exam.shown = true; saveExam(); countUp($("#epct"), 900); setTimeout(() => pass ? SFX.pass() : SFX.fail(), 900); if (pass) setTimeout(() => confetti(120), 1100); }
    else $("#epct").textContent = pct;
  }
  function showReview(i) {
    const e = exam, q = e.list[i], sel = e.ans[i];
    let h = `<div class="card"><div class="qhead"><span>Frage ${i + 1} · ${topicById(q.topic).short} · ${countText(q)}</span><button class="flagbtn" id="aiq">🤖 KI-Hilfe</button></div><div class="qtext">${esc(q.q)}</div>`;
    e.order[i].forEach((ai, k) => {
      const good = q.c.includes(ai), s = sel.includes(ai);
      const cls = good && s ? "ok sel" : good ? "ok miss" : s ? "bad" : "";
      h += `<button class="ans ${cls}" disabled><span class="box">${good ? "✓" : s ? "✗" : String.fromCharCode(65 + k)}</span><span>${esc(q.a[ai])}</span></button>`;
    });
    h += `<div class="expl ${e.res[i] ? "ok" : "bad"}"><b>${e.pts[i]} von ${q.c.length} ${q.c.length === 1 ? "Punkt" : "Punkten"}.</b> ${esc(q.e || "")}${q.p ? `<br><span class="para">📌 ${esc(q.p)}</span>` : ""}</div></div>`;
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
Antworte ohne Einleitung und halte dich kurz: meist 3 bis 6 Sätze oder bis zu 5 kurze Stichpunkte. Nur wenn der Lernende ausdrücklich mehr will, antworte ausführlicher.`;
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
  // Kleine Markdown-Darstellung: Absätze, Listen, Überschriften, fett, kursiv, Code
  function md(src) {
    const inline = t => esc(t).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,!?:;]|$)/g, "$1<i>$2</i>");
    const out = []; let list = null, para = [];
    const flushP = () => { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } };
    const flushL = () => { if (list) { out.push(`<${list.t}>` + list.items.map(x => "<li>" + inline(x) + "</li>").join("") + `</${list.t}>`); list = null; } };
    String(src || "").replace(/\r/g, "").split("\n").forEach(line => {
      const ul = line.match(/^\s*[-*•]\s+(.*)/), ol = line.match(/^\s*\d+[.)]\s+(.*)/), h = line.match(/^\s*#{1,4}\s+(.*)/);
      if (ul || ol) { flushP(); const t = ul ? "ul" : "ol"; if (!list || list.t !== t) { flushL(); list = { t, items: [] }; } list.items.push((ul || ol)[1]); }
      else if (h) { flushP(); flushL(); out.push("<h4>" + inline(h[1]) + "</h4>"); }
      else if (!line.trim()) { flushP(); flushL(); }
      else { flushL(); para.push(line); }
    });
    flushP(); flushL(); return out.join("");
  }
  // Chats bleiben erhalten, solange die App offen ist: einer pro Frage und einer allgemein
  const chats = {};
  const FOLLOW = ["Noch einfacher bitte", "Beispiel aus dem Dienst", "Gib mir eine Eselsbrücke", "Welcher Paragraph gilt?", "Stell mir eine Übungsfrage dazu"];
  function openAI(q, sel, order) {
    const key = q ? q.id + (sel ? "-a" : "") : "general";
    const old = chats[key];
    ai = old && !old.busy ? old : { key, ctx: qContext(q, sel, order), msgs: [], busy: false, answered: !!sel, hasQ: !!q, qText: q ? q.q : "" };
    chats[key] = ai;
    $("#ai").style.display = "flex"; renderAI();
    const cf = aiConf();
    if (cf.key && !cf.lite && !openAI.refreshing) { openAI.refreshing = true; listModels(cf.key).then(lm => { const c = aiConf(); c.lite = lm.lite; c.models = c.models || lm.models.slice(0, 6); aiSave(c); }).catch(() => {}); }
    setTimeout(() => { const t = $("#aiin"); if (t && aiConf().key && !matchMedia("(pointer:coarse)").matches) t.focus(); }, 350);
  }
  function closeAI() { if (ai && ai.ctl) ai.ctl.abort(); $("#ai").style.display = "none"; ai = null; }
  function setStatus(t, live) { const el = $("#aistat"); if (el) { el.textContent = t; el.className = live ? "live" : ""; } }
  function starters() {
    if (!ai.hasQ) return ["Erklär mir Notwehr einfach", "§ 127 StPO und § 229 BGB – was ist der Unterschied?", "Was darf ich als Sicherheitskraft, was nicht?", "Wie lerne ich am besten für die Prüfung?"];
    return ai.answered ? ["Erklär mir die Lösung einfach", "Warum ist meine Antwort falsch?", "Gib mir eine Eselsbrücke", "Beispiel aus dem Dienst"]
      : ["Gib mir einen Tipp (ohne Lösung)", "Erklär mir die Begriffe", "Sag mir die Lösung"];
  }
  function msgHTML(m, i) {
    if (m.role === "user") return `<div class="msg user">${esc(m.content)}</div>`;
    return `<div class="msg assistant${m.err ? " err" : ""}" data-i="${i}">${md(m.content)}${m.err ? "" : `<button class="copy" data-copy="${i}">Kopieren</button>`}</div>`;
  }
  function renderAI() {
    if (!ai) return;
    const box = $("#ai"), conf = aiConf(), b = box.querySelector(".aibody");
    const ctx = ai.ctx ? `<details class="aictx"><summary>Zur Frage: ${esc(ai.qText.length > 70 ? ai.qText.slice(0, 70) + " …" : ai.qText)}</summary><div class="ctxbody">${md(ai.ctx)}</div></details>` : "";
    if (!conf.key) {
      const prompt = (ai.ctx ? ai.ctx + "\n\n" : "") + "Bitte hilf mir als Lernhelfer für die Sachkundeprüfung § 34a GewO" + (ai.hasQ && !ai.answered ? " – gib mir zuerst nur einen Tipp, nicht die Lösung." : ".");
      b.innerHTML = ctx + `<div class="welcome"><b>Noch kein KI-Schlüssel</b>Du kannst die Frage trotzdem einer KI stellen.</div>
        <a class="btn" id="aigem" target="_blank" rel="noopener" href="https://gemini.google.com/app">💬 In Gemini öffnen</a>
        <p class="muted" style="margin-top:-2px">Die Frage wird dabei kopiert. In Gemini ins Eingabefeld tippen und „Einfügen“ wählen. Ein kostenloses Google-Konto genügt.</p>
        <button class="btn sec" id="aicopy">📋 Nur Frage kopieren</button>
        <p class="muted">Mit einem eigenen Gemini-Schlüssel (beginnt mit „AQ.“) chattest du direkt hier. Einrichten unter <a href="#/einstellungen" id="aiset">Einstellungen</a>.</p>`;
      box.querySelector(".aifoot").style.display = "none"; $("#aiquick").innerHTML = ""; setStatus("nicht eingerichtet");
      const full = AI_SYSTEM + "\n\n" + prompt;
      const copy = () => navigator.clipboard ? navigator.clipboard.writeText(full) : Promise.reject();
      $("#aigem").onclick = () => { copy().then(() => toast("Frage kopiert – in Gemini einfügen")).catch(() => toast("Kopieren nicht möglich – bitte „Nur Frage kopieren“ nutzen")); };
      $("#aicopy").onclick = () => copy().then(() => toast("Kopiert – jetzt in der KI einfügen")).catch(() => toast("Kopieren nicht möglich"));
      $("#aiset").onclick = () => closeAI();
      return;
    }
    let body = ctx;
    if (!ai.msgs.length) body += `<div class="welcome"><b>${ai.hasQ ? "Frag mich zu dieser Frage" : "Frag mich alles zum Prüfungsstoff"}</b>${ai.hasQ && !ai.answered ? "Ich gebe dir erst Tipps, die Lösung nur, wenn du danach fragst." : "Ich erkläre einfach, mit Beispielen und Paragraphen."}</div>`;
    ai.msgs.forEach((m, i) => { body += msgHTML(m, i); });
    if (ai.busy && !ai.streaming) body += `<div class="typing" aria-label="KI schreibt"><i></i><i></i><i></i></div>`;
    b.innerHTML = body; b.scrollTop = b.scrollHeight;
    box.querySelector(".aifoot").style.display = "flex";
    const chips = ai.busy ? [] : ai.msgs.length ? (ai.msgs[ai.msgs.length - 1].err ? ["Nochmal versuchen"] : FOLLOW) : starters();
    $("#aiquick").innerHTML = chips.map(x => `<button data-q="${esc(x)}">${esc(x)}</button>`).join("");
    $("#aiquick").querySelectorAll("[data-q]").forEach(x => x.onclick = () => x.dataset.q === "Nochmal versuchen" ? retryAI() : askAI(x.dataset.q));
    b.querySelectorAll("[data-copy]").forEach(x => x.onclick = () => navigator.clipboard.writeText(ai.msgs[+x.dataset.copy].content).then(() => toast("Antwort kopiert")).catch(() => toast("Kopieren nicht möglich")));
    const send = $("#aisend"); send.classList.toggle("stop", !!ai.busy); send.innerHTML = ai.busy ? "■" : "↑"; send.setAttribute("aria-label", ai.busy ? "Stoppen" : "Senden");
    send.disabled = !ai.busy && !$("#aiin").value.trim();
    const cf = aiConf(), mdl = (modelOrder(cf)[0] || "").replace(/^models\//, "").replace(/^gemini-/, "");
    setStatus(ai.busy ? (ai.streaming ? "schreibt …" : "denkt nach …") : (cf.speed === "gruendlich" ? "🧠 " : "⚡ ") + mdl + (ai.took ? " · " + ai.took.toFixed(1).replace(".", ",") + " s" : ""), !ai.busy);
  }
  function retryAI() {
    if (!ai || ai.busy) return;
    const last = ai.msgs[ai.msgs.length - 1]; if (last && last.err) ai.msgs.pop();
    const u = ai.msgs.pop(); if (u && u.role === "user") askAI(u.content);
  }
  async function askAI(text) {
    if (!text || !ai || ai.busy) return;
    const chat = ai, conf = aiConf();
    chat.msgs.push({ role: "user", content: text }); chat.busy = true; chat.streaming = false; renderAI();
    const msgs = chat.msgs.map((m, i) => ({ role: m.role, content: i === 0 && chat.ctx ? chat.ctx + "\n\n" + m.content : m.content }));
    const ctl = chat.ctl = new AbortController();
    const out = { role: "assistant", content: "" };
    let el = null;
    const onText = t => {
      if (chat !== ai) { out.content = t; return; }
      if (!el) { chat.streaming = true; chat.msgs.push(out); renderAI(); el = $("#ai .aibody").querySelector(`[data-i="${chat.msgs.length - 1}"]`); el.classList.add("streaming"); }
      out.content = t; el.innerHTML = md(t);
      const b = $("#ai .aibody"); if (b.scrollHeight - b.scrollTop - b.clientHeight < 160) b.scrollTop = b.scrollHeight;
    };
    const t0 = Date.now(), first = modelOrder(conf)[0];
    let phase = "denkt nach … ";
    const tick = setInterval(() => { if (chat === ai && !out.content) setStatus(phase + Math.round((Date.now() - t0) / 1000) + " s"); }, 1000);
    try {
      let txt;
      try { txt = await streamAI(conf, msgs, onText, ctl.signal, first); rememberModel(conf, first, conf.way || "query"); }
      catch (err) {
        if (ctl.signal.aborted) throw err;
        if (out.content) throw err; // mitten im Text abgebrochen
        phase = "versucht anderes Modell … "; if (chat === ai) setStatus(phase);
        txt = await callAI(conf, msgs, null, err.slow ? first : null); // ohne Streaming, mit Modellwechsel
      }
      out.content = txt || out.content || "(keine Antwort)";
      chat.took = (Date.now() - t0) / 1000;
      if (!chat.msgs.includes(out)) chat.msgs.push(out);
    } catch (err) {
      if (ctl.signal.aborted) { if (out.content) { out.content += "\n\n*(gestoppt)*"; if (!chat.msgs.includes(out)) chat.msgs.push(out); } }
      else if (out.content) { out.content += "\n\n*(Verbindung abgebrochen)*"; if (!chat.msgs.includes(out)) chat.msgs.push(out); }
      else chat.msgs.push({ role: "assistant", err: true, content: "⚠️ **Die KI antwortet gerade nicht.**\n" + err.message + (navigator.onLine ? "" : " Du bist offline.") + "\n\nTipp nochmal auf „Nochmal versuchen“. Hilft das nicht: Einstellungen → „KI testen“." });
    }
    clearInterval(tick);
    chat.busy = false; chat.streaming = false; chat.ctl = null;
    if (chat === ai) renderAI();
  }
  // Antwort Stück für Stück empfangen (Server-Sent Events)
  async function streamAI(conf, msgs, onText, signal, model) {
    const way = conf.way || conf.auth || "query";
    // Kommt nach 15 Sekunden noch kein Text, gilt das Modell als überlastet -> anderes Modell
    const slow = new AbortController(); let got = false;
    const tmr = setTimeout(() => { if (!got) slow.abort(); }, 15000);
    signal.addEventListener("abort", () => slow.abort());
    try {
      let r;
      for (;;) {
        r = await gemFetch(GEM + model + ":streamGenerateContent?alt=sse", { method: "POST", headers: { "content-type": "application/json" }, body: genBody(model, msgs, thinkStage(conf, model)), signal: slow.signal }, conf.key, way, 120000);
        if (r.ok) break;
        const d = await r.json().catch(() => ({}));
        if (isThinkErr(r, d) && thinkStage(conf, model) < 2) { thinkFailed(conf, model); continue; }
        throw apiError(r, d);
      }
      return await readStream(r, t => { got = true; onText(t); });
    } catch (err) {
      if (!got && slow.signal.aborted && !signal.aborted) throw Object.assign(new Error("Modell antwortet zu langsam"), { slow: true });
      throw err;
    } finally { clearTimeout(tmr); }
  }
  async function readStream(r, onText) {
    if (!r.body || !r.body.getReader) throw new Error("Streaming nicht möglich");
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "", txt = "", finish = "";
    for (;;) {
      const { value, done } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/); buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        let d; try { d = JSON.parse(line.slice(5)); } catch (e) { continue; }
        if (d.error) throw new Error(d.error.message || "Fehler beim Streaming");
        const c = d.candidates && d.candidates[0]; if (!c) continue;
        if (c.finishReason) finish = c.finishReason;
        const add = ((c.content && c.content.parts) || []).filter(p => !p.thought).map(p => p.text || "").join("");
        if (add) { txt += add; onText(txt); }
      }
    }
    if (!txt) throw new Error("Leere Antwort" + (finish ? " (" + finish + ")" : ""));
    return txt;
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
    if (opt.signal) { if (opt.signal.aborted) ctl.abort(); else opt.signal.addEventListener("abort", () => ctl.abort()); }
    opt.signal = ctl.signal;
    return fetch(url, opt).finally(() => clearTimeout(t));
  }
  const SAFETY = ["HARASSMENT", "HATE_SPEECH", "SEXUALLY_EXPLICIT", "DANGEROUS_CONTENT"].map(c => ({ category: "HARM_CATEGORY_" + c, threshold: "BLOCK_ONLY_HIGH" }));
  function thinkingFor(model, stage) {
    if (stage >= 2) return null;
    if (/gemini-2\.5/.test(model)) return stage ? null : { thinkingBudget: /pro/.test(model) ? 128 : 0 };
    if (/gemini-[3-9]/.test(model)) return { thinkingLevel: stage ? "low" : "minimal" };
    return null;
  }
  // Welche Denk-Stufe ein Modell akzeptiert, wird gemerkt
  const thinkStage = (conf, model) => (conf.think && conf.think[model]) || 0;
  function thinkFailed(conf, model) { conf.think = conf.think || {}; conf.think[model] = thinkStage(conf, model) + 1; aiSave(conf); }
  const isThinkErr = (r, d) => r.status === 400 && /think/i.test((d && d.error && d.error.message) || "");
  // Reihenfolge der Modelle: „Schnell“ nimmt zuerst Flash-Lite, „Gründlich“ zuerst Flash
  function modelOrder(conf) {
    const fast = conf.speed !== "gruendlich";
    const list = fast ? [conf.fast].concat(conf.lite || [], [conf.model], conf.models || []) : [conf.model].concat(conf.models || [], conf.lite || []);
    return list.filter((m, i, a) => m && a.indexOf(m) === i);
  }
  function genBody(model, msgs, stage) {
    const gc = { maxOutputTokens: 2048 }, th = thinkingFor(model, stage || 0);
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
    if (err.name === "AbortError") return Object.assign(new Error("Keine Antwort in angemessener Zeit, Modell vermutlich überlastet"), { net: true, slow: true });
    return Object.assign(new Error("Verbindung zu Google blockiert (" + err.message + ")"), { net: true });
  }
  // Eine Anfrage an ein Modell auf einem Weg
  async function genOnce(conf, model, way, msgs) {
    let r, d;
    for (;;) {
      try { r = await gemFetch(GEM + model + ":generateContent", { method: "POST", headers: { "content-type": "application/json" }, body: genBody(model, msgs, thinkStage(conf, model)) }, conf.key, way, 20000); }
      catch (err) { throw netError(err); }
      d = await r.json().catch(() => ({}));
      if (isThinkErr(r, d) && thinkStage(conf, model) < 2) { thinkFailed(conf, model); continue; } // Modell kennt die Denk-Einstellung nicht
      break;
    }
    if (!r.ok) throw apiError(r, d);
    if (d.promptFeedback && d.promptFeedback.blockReason) throw new Error("Google hat die Frage blockiert (" + d.promptFeedback.blockReason + ")");
    const c = d.candidates && d.candidates[0];
    const txt = ((c && c.content && c.content.parts) || []).filter(p => !p.thought).map(p => p.text || "").join("").trim();
    if (!txt) throw new Error("Leere Antwort von Google" + (c && c.finishReason ? " (" + c.finishReason + ")" : ""));
    return txt;
  }
  // Probiert den gespeicherten Weg/Modell zuerst, dann die anderen. Merkt sich, was funktioniert.
  async function callAI(conf, msgs, log, skip) {
    const ways = [conf.way || conf.auth].filter(w => WAYS.includes(w)).concat(WAYS).filter((w, i, a) => a.indexOf(w) === i);
    const models = modelOrder(conf).filter(m => m !== skip).slice(0, 4);
    let last = null;
    for (const model of models) {
      for (const way of ways) {
        try {
          const txt = await genOnce(conf, model, way, msgs);
          if (log) log(`✅ ${model.replace(/^models\//, "")} · Weg „${way}“: funktioniert`);
          rememberModel(conf, model, way);
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
  function rememberModel(conf, model, way) {
    const isLite = /lite/.test(model), key = conf.speed !== "gruendlich" && isLite ? "fast" : (!isLite ? "model" : null);
    let changed = way !== conf.way; conf.way = way;
    if (key && conf[key] !== model) { conf[key] = model; changed = true; }
    if (changed) aiSave(conf);
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
        return { way, models: list.filter(m => !/lite/.test(m)), lite: lite.slice(0, 3) };
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
    const lm = await listModels(key), { way, models } = lm;
    if (!models.length) throw new Error("Kein passendes Gemini-Modell gefunden");
    const conf = { key, provider: "gemini", way, model: models[0], models: models.slice(0, 6), lite: lm.lite, speed: (aiConf().speed || "schnell") };
    await callAI(conf, [{ role: "user", content: "Antworte nur mit: OK" }], log);
    aiSave(conf); return conf;
  }
  function initAIPanel() {
    const box = document.createElement("div"); box.id = "ai"; box.className = "aipanel";
    box.innerHTML = `<div class="aiwin" role="dialog" aria-label="KI-Lernhelfer"><div class="aihead"><div class="aiava">🦺</div><div class="who"><b>KI-Lernhelfer</b><span id="aistat"></span></div>
      <button id="ainew" aria-label="Neuer Chat">Neu</button><button id="aiclose" aria-label="Schließen">✕</button></div>
      <div class="aibody"></div>
      <div class="quick" id="aiquick"></div>
      <form class="aifoot" id="aiform"><textarea id="aiin" rows="1" placeholder="Frag mich etwas …" enterkeyhint="send"></textarea><button class="aisend" id="aisend" aria-label="Senden">↑</button></form>
      <div class="ainote">KI-Antworten können Fehler enthalten. Im Zweifel gilt der Gesetzestext.</div></div>`;
    document.body.appendChild(box);
    const inp = $("#aiin"), grow = () => { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight, 130) + "px"; if (ai && !ai.busy) $("#aisend").disabled = !inp.value.trim(); };
    $("#aiclose").onclick = closeAI;
    $("#ainew").onclick = () => { if (!ai) return; if (ai.ctl) ai.ctl.abort(); ai.msgs = []; ai.busy = false; renderAI(); toast("Neuer Chat"); };
    box.onclick = ev => { if (ev.target === box) closeAI(); };
    inp.oninput = grow;
    inp.onkeydown = ev => { if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); $("#aiform").requestSubmit(); } };
    $("#aiform").onsubmit = ev => {
      ev.preventDefault();
      if (ai && ai.busy) { if (ai.ctl) ai.ctl.abort(); return; }
      const v = inp.value.trim(); if (!v) return; inp.value = ""; grow(); askAI(v);
    };
  }

  // ---------- Eigene Fragen ----------
  // ---------- Fragen aus Text importieren (bleiben nur auf diesem Gerät) ----------
  // Format: „1. Frage“, darunter „A) Antwort“; richtige Antworten mit ✅ / ✔ / ✓ / [x] / (richtig) markiert.
  // Zwei Formate werden erkannt:
  // 1) Ankreuzfragen: „1. Frage“, darunter „A) Antwort“, richtige mit ✅ / ✔ / ✓ / [x] / „Richtig ·“ / (richtig)
  // 2) Nur Lösungen: „1. Frage“, darunter die richtigen Antworten als Aufzählung (• oder -), ohne falsche Antworten
  // Hinweise wie „Lösung aus früherer KATI-Auswertung“ gehören nicht in den Fragetext
  // (in PDFs landen sie oft in derselben Zeile wie das Ende der Frage)
  const TAILVOR = /\s*Lösungsvorschlag\s*:?\s*$/i;
  const cleanQ = q => String(q || "").replace(/\s*Lösung(en)? aus (einer )?früher(er|en) KATI-Auswertung(en)?\s*:?/gi, " ")
    .replace(/\s*(KATI-Auswertung|Lösungsvorschlag)\s*:?\s*$/i, "").replace(/\s{2,}/g, " ").trim();
  function parseImport(txt) {
    const out = []; let cur = null, last = null;
    const MARK = /^\s*(✅|✔️?|☑️?|✓|\[x\]|\(x\)|Richtig\s*[·:-]|Lösungsvorschlag\s*[·:-])\s*/i;
    const LABEL = /^(KATI-Auswertung|Lösungsvorschlag|Lösung|Lösungen|Antwort(en)?|Richtige Antworten?|Lösung aus .{3,60})\s*:?$/i;
    String(txt || "").replace(/\r/g, "").split("\n").forEach(raw => {
      const line = raw.trim(); if (!line) return;
      if (/^[^.?!]{1,60}\/\s*\d{1,4}$/.test(line) || /^\S{1,24}\s*[·•|–-]\s*\d{1,4}$/.test(line) || /^(Seite\s*)?\d{1,4}(\s*(von|\/)\s*\d{1,4})?$/i.test(line)) return; // Seitenzahlen, Fußzeilen
      if (/^Test\s+\d+$/i.test(line) || /^Weitere Fragen\b/i.test(line)) return; // Zwischenüberschriften
      const opt = line.match(/^([A-Fa-f])\s*[).\]:]\s*(.*)$/);
      const bul = line.match(/^[•▪●◦·–-]\s*(.+)$/);
      const qm = line.match(/^(\d{1,4})\s*[.)]\s+(.+)$/);
      if (cur && LABEL.test(line)) { cur.label = line.replace(/:$/, ""); last = "l"; return; }
      if (opt && cur && !cur.sol) {
        let t = opt[2], ok = MARK.test(t);
        if (/^\s*Lösungsvorschlag\s*[·:-]/i.test(t)) cur.label = "Lösungsvorschlag";
        t = t.replace(MARK, "");
        if (/\s*\((richtig|korrekt)\)\s*$/i.test(t)) { ok = true; t = t.replace(/\s*\((richtig|korrekt)\)\s*$/i, ""); }
        if (ok) cur.c.push(cur.a.length);
        cur.a.push(t.trim()); last = "a"; return;
      }
      if (bul && cur && !cur.a.length || bul && cur && cur.sol) { cur.sol = true; cur.c.push(cur.a.length); cur.a.push(bul[1].trim()); last = "a"; return; }
      if (qm && (!cur || cur.a.length || qm[1] === "1")) { cur = { q: qm[2].trim(), a: [], c: [] }; out.push(cur); last = "q"; return; }
      if (!cur) return;
      if (last === "a") cur.a[cur.a.length - 1] += " " + line; else if (last === "q") cur.q += " " + line;
    });
    out.forEach(x => {
      if (TAILVOR.test(x.q)) x.label = "Lösungsvorschlag";
      x.q = cleanQ(x.q);
    });
    return out.filter(x => x.q && x.c.length && (x.sol || x.a.length >= 2));
  }
  // Für „Nur Lösungen“: falsche Antworten aus anderen Fragen desselben Sachgebiets ergänzen.
  // Genommen werden Antworten, die möglichst wenig Wörter mit der Frage und ihren Lösungen teilen.
  function addDistractors(list) {
    const words = t => new Set((t.toLowerCase().match(/[a-zäöüß]{4,}/g) || []));
    const pool = {};
    const add = (topic, a) => { (pool[topic] = pool[topic] || []).push(a); };
    TOPICS.forEach(t => t.questions.forEach(q => q.c.forEach(i => add(t.id, q.a[i]))));
    S.custom.forEach(q => q.c.forEach(i => add(q.topic, q.a[i])));
    list.forEach(q => q.c.forEach(i => add(q.topic, q.a[i])));
    list.filter(q => q.sol).forEach(q => {
      const mine = words(q.q + " " + q.a.join(" "));
      const own = new Set(q.a.map(a => a.toLowerCase()));
      const cand = shuffle((pool[q.topic] || []).filter(a => !own.has(a.toLowerCase()) && a.length > 3))
        .map(a => { const w = words(a); let o = 0; w.forEach(x => { if (mine.has(x)) o++; }); return { a, o: o / Math.max(1, w.size) }; })
        .sort((x, y) => x.o - y.o);
      const need = Math.max(2, 4 - q.a.length);
      const picked = [];
      for (const c of cand) { if (picked.length >= need) break; if (!picked.some(p => p.toLowerCase() === c.a.toLowerCase())) picked.push(c.a); }
      q.a = q.a.concat(picked);
      q.e = (q.label === "Lösungsvorschlag" ? "Achtung: nur ein Lösungsvorschlag, noch nicht bestätigt. " : "") + "In der Vorlage standen nur die richtigen Antworten. Die übrigen Antworten hat die App aus anderen Fragen dieses Sachgebiets ergänzt; selten kann eine davon zufällig auch zutreffen.";
    });
  }
  // PDF im Browser auslesen (pdf.js wird nur bei Bedarf geladen, dafür ist Internet nötig)
  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise((ok, fail) => {
      const sc = document.createElement("script"); sc.src = PDFJS + "pdf.min.js";
      sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js"; ok(window.pdfjsLib); };
      sc.onerror = () => fail(new Error("PDF-Leser konnte nicht geladen werden. Bist du online?"));
      document.head.appendChild(sc);
    });
  }
  async function pdfToText(file, progress) {
    const lib = await loadPdfJs();
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    const lines = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const tc = await (await pdf.getPage(n)).getTextContent();
      let line = "", y = null;
      tc.items.forEach(it => {
        const iy = it.transform ? it.transform[5] : y;
        if (y !== null && Math.abs(iy - y) > 2 && line) { lines.push(line); line = ""; }
        line += it.str; y = iy;
        if (it.hasEOL) { lines.push(line); line = ""; }
      });
      if (line) lines.push(line);
      lines.push("");
      if (progress) progress(n, pdf.numPages);
    }
    return lines.map(l => l.replace(/\s+/g, " ").trim()).join("\n");
  }
  // Sachgebiet automatisch wählen: Welches Sachgebiet hat die meisten gemeinsamen Fachwörter?
  let topicWords = null;
  function guessTopic(q) {
    const words = t => (t.toLowerCase().match(/[a-zäöüß§]{5,}|§\s*\d+[a-z]?/g) || []).map(w => w.replace(/\s+/g, ""));
    if (!topicWords) {
      topicWords = {}; const df = {};
      TOPICS.forEach(t => { const set = new Set(); t.questions.forEach(x => words(x.q + " " + x.a.join(" ") + " " + (x.p || "")).forEach(w => set.add(w))); topicWords[t.id] = set; set.forEach(w => df[w] = (df[w] || 0) + 1); });
      topicWords.df = df;
    }
    const law = (q.q + " " + q.a.join(" ")).match(/\b(StGB|StPO|BGB|GewO|BewachV|WaffG|DSGVO|BDSG|GG|DGUV)\b/);
    const byLaw = { StGB: "stgb", StPO: "stgb", BGB: "bgb", GewO: "gewo", BewachV: "gewo", WaffG: "umw", DSGVO: "ds", BDSG: "ds", GG: "rdoeso", DGUV: "dguv" };
    if (law) return byLaw[law[1]];
    let best = TOPICS[0].id, bestScore = -1;
    const ws = words(q.q + " " + q.a.join(" "));
    TOPICS.forEach(t => { let sc = 0; ws.forEach(w => { if (topicWords[t.id].has(w)) sc += 1 / topicWords.df[w]; }); if (sc > bestScore) { bestScore = sc; best = t.id; } });
    return best;
  }
  const lawRef = t => { const m = t.match(/§\s*\d+\s*[a-z]?(\s*Abs\.\s*\d+)?\s*(StGB|StPO|BGB|GewO|BewachV|WaffG|DSGVO|BDSG|GG)/); return m ? m[0].replace(/\s+/g, " ") : ""; };

  const ownView = { q: "", t: "", n: 30 };
  function customPage() {
    clearTimer();
    setHeader("Eigene Fragen", null);
    let h = `<div class="card"><h2>📥 Fragen importieren</h2>
      <p class="muted">Füge eine Liste ein: „1. Frage“, darunter „A) Antwort“, richtige Antworten mit ✅ markiert. Die Fragen bleiben nur auf diesem Gerät, kommen ins Backup und werden nicht veröffentlicht.</p>
      <label class="btn sec" style="cursor:pointer">📄 PDF- oder Textdatei wählen<input type="file" id="impfile" accept=".pdf,.txt,application/pdf,text/plain" style="display:none"></label>
      <p class="muted" id="impfilestat" style="margin-top:-4px"></p>
      <textarea id="imptxt" placeholder="… oder Text hier einfügen:&#10;1. Frage&#10;A) Antwort&#10;B) ✅ richtige Antwort" style="min-height:120px"></textarea>
      <label>Sachgebiet</label><select id="imptopic"><option value="auto">Automatisch zuordnen</option>${TOPICS.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select>
      <button class="btn sec" id="impcheck">Prüfen</button><div id="impprev"></div></div>
      <details class="card fold"${S.custom.length ? "" : " open"}><summary><h2>✏️ Neue Frage anlegen</h2></summary>
      <label>Sachgebiet</label><select id="ct">${TOPICS.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select>
      <label>Frage</label><textarea id="cq" placeholder="Frage eingeben"></textarea>
      <label>Antworten (richtige ankreuzen)</label>
      ${[0, 1, 2, 3, 4].map(i => `<div class="ansedit"><input type="checkbox" id="cc${i}" aria-label="Antwort ${i + 1} ist richtig"><input type="text" id="ca${i}" placeholder="Antwort ${String.fromCharCode(65 + i)}${i > 1 ? " (optional)" : ""}"></div>`).join("")}
      <label style="margin-top:8px;display:block">Erklärung (optional)</label><textarea id="ce" placeholder="Warum ist das richtig?"></textarea>
      <label>Paragraph (optional)</label><input id="cp" placeholder="z. B. § 32 StGB">
      <button class="btn" id="csave">Frage speichern</button></details>`;
    if (S.custom.length) {
      h += `<div class="card"><h2>📋 Deine Fragen (${S.custom.length})</h2>
        <input type="search" id="osearch" placeholder="Fragen durchsuchen …" value="${esc(ownView.q)}">
        <select id="otopic"><option value="">Alle Sachgebiete</option>${TOPICS.map(t => `<option value="${t.id}" ${ownView.t === t.id ? "selected" : ""}>${esc(t.name)} (${S.custom.filter(c => c.topic === t.id).length})</option>`).join("")}</select>
        <div id="olist"></div>
        ${S.custom.some(c => c.imp) ? `<button class="btn ghost" id="impdel" style="margin-top:14px">🗑 Alle importierten Fragen löschen</button>` : ""}</div>`;
    }
    $("#app").innerHTML = h; foot("");
    const renderOwn = () => {
      const box = $("#olist"); if (!box) return;
      const q = ownView.q.trim().toLowerCase();
      const hits = S.custom.slice().reverse().filter(c => (!ownView.t || c.topic === ownView.t) && (!q || (c.q + " " + c.a.join(" ")).toLowerCase().includes(q)));
      const show = hits.slice(0, ownView.n);
      box.innerHTML = `<p class="muted">${hits.length} ${hits.length === 1 ? "Frage" : "Fragen"}${hits.length > show.length ? `, ${show.length} angezeigt` : ""}</p>` + show.map(c => `<div class="ownq"><span class="pill">${esc(topicById(c.topic).short)}</span>${c.imp ? '<span class="pill">importiert</span>' : ""}<b>${esc(c.q)}</b>
          <div class="muted">✓ ${c.c.map(i => esc(c.a[i])).join(" · ")}</div><button class="flagbtn" data-del="${c.id}">🗑 Löschen</button></div>`).join("")
        + (hits.length > show.length ? `<button class="btn sec" id="omore">Weitere ${Math.min(30, hits.length - show.length)} anzeigen</button>` : "");
      const more = $("#omore"); if (more) more.onclick = () => { ownView.n += 30; renderOwn(); };
      box.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
        if (!confirm("Diese Frage löschen?")) return;
        S.custom = S.custom.filter(c => c.id !== b.dataset.del); delete S.prog[b.dataset.del]; delete S.flags[b.dataset.del]; forget(b.dataset.del); save();
        b.closest(".ownq").remove(); toast("Frage gelöscht");
      });
    };
    renderOwn();
    const os = $("#osearch"); if (os) { let tmr; os.oninput = () => { clearTimeout(tmr); tmr = setTimeout(() => { ownView.q = os.value; ownView.n = 30; renderOwn(); }, 200); }; }
    const ot = $("#otopic"); if (ot) ot.onchange = () => { ownView.t = ot.value; ownView.n = 30; renderOwn(); };
    let parsed = [];
    $("#impfile").onchange = async ev => {
      const f = ev.target.files[0]; if (!f) return;
      const st = $("#impfilestat");
      try {
        st.textContent = "Lese „" + f.name + "“ …";
        const txt = /\.pdf$/i.test(f.name) || f.type === "application/pdf"
          ? await pdfToText(f, (n, all) => { st.textContent = "Lese Seite " + n + " von " + all + " …"; })
          : await f.text();
        $("#imptxt").value = txt; st.textContent = "„" + f.name + "“ gelesen.";
        $("#impcheck").click();
      } catch (err) { st.textContent = "Fehler: " + err.message; }
      ev.target.value = "";
    };
    $("#impcheck").onclick = () => {
      parsed = parseImport($("#imptxt").value);
      const norm = t => String(t).toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
      const known = new Set(S.custom.map(c => norm(c.q)));
      const sig = x => norm(x.q) + "|" + x.c.map(i => norm(x.a[i])).sort().join("|");
      const seen = new Set();
      const fresh = parsed.filter(x => { const k = sig(x); if (known.has(norm(x.q)) || seen.has(k)) return false; seen.add(k); return true; });
      const box = $("#impprev");
      if (!parsed.length) { box.innerHTML = `<p class="muted"><b>Keine Fragen erkannt.</b> Jede Frage braucht eine Nummer („1.“) und darunter entweder Antworten mit „A)“, „B)“ … und ✅ bei den richtigen, oder nur die richtigen Antworten als Aufzählung („•“).</p>`; return; }
      const sel = $("#imptopic").value;
      fresh.forEach(x => { x.topic = sel === "auto" ? guessTopic(x) : sel; });
      addDistractors(fresh);
      const solN = fresh.filter(x => x.sol).length, vorN = fresh.filter(x => x.label === "Lösungsvorschlag").length;
      const vorInfo = !solN && vorN ? `<p class="muted">${vorN} davon sind als „Lösungsvorschlag“ markiert, also noch nicht bestätigt. Das steht dann auch bei der Frage.</p>` : "";
      const per = {}; fresh.forEach(x => per[x.topic] = (per[x.topic] || 0) + 1);
      box.innerHTML = `<p><b>${parsed.length} Fragen erkannt</b>${parsed.length - fresh.length ? `, davon ${parsed.length - fresh.length} doppelt oder schon vorhanden` : ""}.</p>
        ${solN ? `<p class="muted">${solN} davon enthalten nur die richtigen Antworten. Die App ergänzt falsche Antworten aus anderen Fragen desselben Sachgebiets.${vorN ? ` ${vorN} sind als „Lösungsvorschlag“ markiert, also noch nicht bestätigt.` : ""}</p>` : ""}
        ${vorInfo}${fresh.length ? `<p class="muted">${Object.keys(per).map(t => esc(topicById(t).short) + ": " + per[t]).join(" · ")}</p><button class="btn" id="impgo">${fresh.length} Fragen übernehmen</button>` : ""}`;
      const go = $("#impgo"); if (go) go.onclick = () => {
        const t0 = Date.now();
        fresh.forEach((x, i) => S.custom.push({ id: "own-" + t0 + "-" + i, topic: x.topic, q: x.q, a: x.a, c: x.c, e: x.e || (x.label === "Lösungsvorschlag" ? "Achtung: nur ein Lösungsvorschlag, noch nicht bestätigt." : ""), p: lawRef(x.q), own: true, imp: true }));
        save(); toast(fresh.length + " Fragen übernommen ✅"); customPage();
      };
    };
    $("#csave").onclick = () => {
      const q = $("#cq").value.trim(), a = [], c = [];
      [0, 1, 2, 3, 4].forEach(i => { const v = $("#ca" + i).value.trim(); if (v) { if ($("#cc" + i).checked) c.push(a.length); a.push(v); } });
      if (!q || a.length < 2) return toast("Bitte Frage und mindestens 2 Antworten eingeben");
      if (!c.length) return toast("Bitte mindestens eine richtige Antwort ankreuzen");
      S.custom.push({ id: "own-" + Date.now(), topic: $("#ct").value, q, a, c, e: $("#ce").value.trim(), p: $("#cp").value.trim(), own: true });
      save(); toast("Frage gespeichert ✅"); customPage();
    };
    const idel = $("#impdel"); if (idel) idel.onclick = () => {
      const ids = S.custom.filter(c => c.imp).map(c => c.id);
      if (!confirm(ids.length + " importierte Fragen löschen?")) return;
      S.custom = S.custom.filter(c => !c.imp); ids.forEach(id => { delete S.prog[id]; delete S.flags[id]; forget(id); }); save(); customPage();
    };
  }

  // ---------- Einstellungen ----------
  function settingsPage() {
    setHeader("Einstellungen", null);
    const conf = aiConf();
    $("#app").innerHTML = `<div class="card"><h2>🎯 Lernen</h2>
      <label>Tagesziel</label><select id="goal">${[10, 20, 30, 50, 80].map(n => `<option value="${n}" ${(S.settings.goal || 20) === n ? "selected" : ""}>${n} Fragen pro Tag</option>`).join("")}</select>
      <label style="display:flex;gap:10px;align-items:center;font-weight:500"><input type="checkbox" id="sound" style="width:22px;height:22px;margin:0" ${S.settings.sound !== false ? "checked" : ""}> Töne bei richtigen und falschen Antworten</label>
      <p class="muted">Die Töne sind leise und laufen über die Medienlautstärke deines Handys.</p>
      <label>📅 Mein Prüfungstermin</label><input type="date" id="exdate" value="${esc(S.settings.examDate || "")}" min="${dayKey()}">
      <p class="muted">Die Startseite zeigt dann, wie viele Tage noch bleiben und wie viele Fragen du pro Tag schaffen solltest.</p></div>
      <div class="card"><h2>🔢 Anzeige</h2>
      <label style="display:flex;gap:10px;align-items:center;font-weight:500"><input type="checkbox" id="showc" style="width:22px;height:22px;margin:0" ${S.settings.showCount ? "checked" : ""}> Anzahl der richtigen Antworten bei jeder Frage anzeigen</label>
      <p class="muted">In der echten IHK-Prüfung wird das nicht angezeigt. Schalte es zum Üben ein und für eine realistische Prüfung aus.</p></div>
      <div class="card"><h2>📚 Fragen</h2>
      <label style="display:flex;gap:10px;align-items:center;font-weight:500"><input type="checkbox" id="onlyown" style="width:22px;height:22px;margin:0" ${onlyOwn() ? "checked" : ""} ${S.custom.length ? "" : "disabled"}> Nur meine eigenen Fragen verwenden (${S.custom.length})</label>
      <p class="muted">${S.custom.length ? "Ist das an, nutzen Lernen, Fehler wiederholen und Prüfung nur deine eigenen und importierten Fragen. Die eingebauten Fragen und dein Lernstand dazu bleiben erhalten und sind wieder da, wenn du das ausschaltest." : "Du hast noch keine eigenen Fragen. Importiere sie unter „Eigene Fragen“."}</p></div>
      <div class="card"><h2>🤖 KI-Lernhelfer</h2>
      <p class="muted"><b>Ohne Einrichtung:</b> Der Knopf „KI-Hilfe“ kopiert die Frage und öffnet Google Gemini (gemini.google.com, kostenloses Google-Konto genügt).<br>
      <b>Mit eigenem Schlüssel:</b> Chat direkt in der App. Es funktioniert nur ein <b>Google-Gemini-Schlüssel, der mit „AQ.“ beginnt</b> (kostenlos erhältlich auf <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com</a>). Der Schlüssel bleibt nur auf diesem Gerät und ist nicht im Backup.</p>
      ${conf.key ? `<p>✅ Eingerichtet · Google Gemini · Modell: <b>${esc((conf.model || "").replace(/^models\//, ""))}</b></p><label>Antworten</label><select id="aispeed"><option value="schnell" ${conf.speed !== "gruendlich" ? "selected" : ""}>⚡ Schnell (Flash-Lite, kurz)</option><option value="gruendlich" ${conf.speed === "gruendlich" ? "selected" : ""}>🧠 Gründlich (Flash, etwas langsamer)</option></select>
      <button class="btn sec" id="aitest">🔍 KI testen</button><div id="ailog" class="muted" style="font-size:13px;word-break:break-word"></div><button class="btn ghost" id="aicopylog" style="display:none">📋 Testergebnis kopieren</button><button class="btn danger" id="aidel">Schlüssel entfernen</button>`
        : `<input type="password" id="aikey" placeholder="Gemini-Schlüssel (AQ.…)" autocomplete="off"><button class="btn sec" id="aisave">Speichern & testen</button>`}</div>
      ${syncCard()}
      <div class="card"><h2>💾 Backup</h2><p class="muted">Ohne Geräte-Abgleich liegt dein Fortschritt nur auf diesem Gerät. Mit einem Backup kannst du ihn zusätzlich als Datei sichern.</p>
      <button class="btn sec" id="exp">Backup sichern</button>
      <label class="btn sec" style="display:block">Backup laden<input type="file" id="imp" accept="application/json,.json" style="display:none"></label></div>
      <div class="card"><h2>📲 Als App installieren</h2><p class="muted"><b>iPhone (Safari):</b> Teilen-Symbol → „Zum Home-Bildschirm“.<br><b>Android (Chrome):</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.<br><b>PC (Chrome oder Edge):</b> In der Adresszeile rechts auf das Symbol „App installieren“ ⊕ klicken. Die App öffnet sich dann in einem eigenen Fenster.<br>Danach funktioniert die App auch offline.</p></div>
      <div class="card"><h2>🗑 Zurücksetzen</h2><button class="btn danger" id="reset">Lernfortschritt löschen</button><p class="muted">Eigene Fragen bleiben erhalten.</p></div>
      <button class="btn ghost" data-go="#/neu">🆕 Was ist neu?</button>
      <div class="card"><p class="muted">Security LernApp · <a href="#/neu">Version ${esc(VERSION)}</a> · ${allQuestions().length} Fragen. Die Fragen sind selbst formuliert auf Grundlage der Gesetze (GG, GewO, BewachV, DSGVO, BDSG, BGB, StGB, StPO, WaffG, DGUV). Ohne Gewähr: Im Zweifel gilt der aktuelle Gesetzestext.</p></div>`;
    foot("");
    $("#showc").onchange = ev => { S.settings.showCount = ev.target.checked; S.settings._t = Date.now(); save(); toast("Gespeichert"); };
    $("#sound").onchange = ev => { S.settings.sound = ev.target.checked; S.settings._t = Date.now(); save(); if (ev.target.checked) SFX.ok(); toast(ev.target.checked ? "Töne an" : "Töne aus"); };
    $("#exdate").onchange = ev => { S.settings.examDate = ev.target.value || null; S.settings._t = Date.now(); save(); toast(ev.target.value ? "Prüfungstermin: " + fmtDate(ev.target.value) : "Prüfungstermin entfernt"); };
    $("#goal").onchange = ev => { S.settings.goal = +ev.target.value; S.settings._t = Date.now(); save(); toast("Tagesziel: " + ev.target.value + " Fragen"); };
    $("#onlyown").onchange = ev => { S.settings.onlyOwn = ev.target.checked; S.settings._t = Date.now(); save(); toast(ev.target.checked ? "Nur noch deine eigenen Fragen" : "Alle Fragen aktiv"); };
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
    const sp = $("#aispeed"); if (sp) sp.onchange = () => { const c = aiConf(); c.speed = sp.value; aiSave(c); toast(sp.value === "gruendlich" ? "KI: gründlich" : "KI: schnell"); };
    const tb = $("#aitest"); if (tb) tb.onclick = async () => {
      const box = $("#ailog"); box.innerHTML = "Teste … (bis zu 1 Min.)<br>"; tb.disabled = true;
      try { const c = aiConf(); const lm = await listModels(c.key).catch(e => { box.innerHTML += "Modellliste: " + esc(e.message) + "<br>"; return null; });
        if (lm) { c.models = lm.models.slice(0, 6); c.lite = lm.lite; aiSave(c); box.innerHTML += "Modellliste: ✅ " + lm.models.length + " Modelle (Weg „" + lm.way + "“)<br>"; }
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
    $("#exp").onclick = async () => {
      const name = "security-lernapp-backup-" + dayKey() + ".json", json = JSON.stringify(S);
      // Auf dem iPhone klappt Teilen (z. B. „In Dateien sichern“) zuverlässiger als Herunterladen
      try {
        const file = new File([json], name, { type: "application/json" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Security LernApp Backup" }); return; }
      } catch (err) { if (err && err.name === "AbortError") return; }
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([json], { type: "application/json" })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    };
    $("#imp").onchange = ev => {
      const f = ev.target.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.prog) throw 0; S = Object.assign({}, defaults, d); S.settings = Object.assign({ showCount: true, sound: true, goal: 20 }, S.settings || {}); S.days = S.days || {}; S.del = S.del || {}; save(); toast("Backup geladen ✅"); go("#/"); } catch (e) { toast("Ungültige Backup-Datei"); } };
      r.readAsText(f);
    };
    bindSync();
    $("#reset").onclick = () => { if (confirm("Wirklich den gesamten Lernfortschritt löschen?")) { S.prog = {}; S.exams = []; S.flags = {}; S.resetAt = Date.now(); save(); toast("Fortschritt gelöscht"); go("#/"); } };
  }

  // ---------- Geräte-Abgleich über GitHub ----------
  // Die Daten (slapp-v1) liegen als geheimes Gist im GitHub-Konto des Nutzers. Der Zugangsschlüssel (Token)
  // bleibt nur auf dem Gerät (slapp-sync), ist nicht im Backup und nie im Repo. KI-Schlüssel werden nie abgeglichen.
  const SYNCKEY = "slapp-sync", GH = "https://api.github.com", GFILE = "slapp-sync.json";
  function syncConf() { try { return JSON.parse(localStorage.getItem(SYNCKEY)) || {}; } catch (e) { return {}; } }
  function syncSave(c) { try { localStorage.setItem(SYNCKEY, JSON.stringify(c)); } catch (e) {} }
  const tme = (x, k) => (x && x[k] && x[k].t) || 0;
  const num = v => typeof v === "number" ? v : 1; // alte Markierungen hatten den Wert 1
  // Zwei Stände zusammenführen: pro Frage gilt der neuere Lernstand, Listen werden vereinigt, Gelöschtes bleibt gelöscht
  function mergeState(a, b) {
    a = a || {}; b = b || {};
    const del = Object.assign({}, a.del);
    Object.keys(b.del || {}).forEach(k => { del[k] = Math.max(del[k] || 0, b.del[k]); });
    const resetAt = Math.max(a.resetAt || 0, b.resetAt || 0);
    const prog = {};
    [a.prog || {}, b.prog || {}].forEach(src => Object.keys(src).forEach(id => {
      const p = src[id]; if (!p || del[id] || (p.t || 0) < resetAt) return;
      if (!prog[id] || (p.t || 0) > (prog[id].t || 0)) prog[id] = p;
    }));
    const seen = {}, custom = [];
    (a.custom || []).concat(b.custom || []).forEach(c => { if (c && c.id && !seen[c.id] && !del[c.id]) { seen[c.id] = 1; custom.push(c); } });
    const flags = {};
    [a.flags || {}, b.flags || {}].forEach(src => Object.keys(src).forEach(id => {
      const v = num(src[id]); if (del[id] || v <= (del["f:" + id] || 0) || (v > 1 && v < resetAt)) return;
      flags[id] = Math.max(flags[id] || 0, v);
    }));
    if (resetAt) Object.keys(flags).forEach(id => { if (flags[id] === 1) delete flags[id]; });
    const ex = {}; (a.exams || []).concat(b.exams || []).forEach(e => { if (e && e.d >= resetAt) ex[e.d] = e; });
    const exams = Object.keys(ex).map(Number).sort((x, y) => x - y).map(d => ex[d]);
    const days = Object.assign({}, a.days);
    Object.keys(b.days || {}).forEach(k => { days[k] = Math.max(days[k] || 0, b.days[k]); });
    // Antworten pro Gerät und Tag (nur die letzten 60 Tage), Tageszahl = Summe aller Geräte
    const dev = {}, old = dayKey(new Date(Date.now() - 60 * 864e5));
    [a.dev || {}, b.dev || {}].forEach(src => Object.keys(src).forEach(d => Object.keys(src[d] || {}).forEach(k => {
      if (k < old) return; dev[d] = dev[d] || {}; dev[d][k] = Math.max(dev[d][k] || 0, src[d][k]);
    })));
    const sum = {}; Object.keys(dev).forEach(d => Object.keys(dev[d]).forEach(k => { sum[k] = (sum[k] || 0) + dev[d][k]; }));
    Object.keys(sum).forEach(k => { days[k] = Math.max(days[k] || 0, sum[k]); });
    const sa = a.settings || {}, sb = b.settings || {};
    // Bei gleichem Stand gewinnt die gespeicherte Fassung, damit beide Geräte gleich enden
    const settings = Object.assign({}, b.settings && (sb._t || 0) >= (sa._t || 0) ? sb : sa);
    return Object.assign({}, a, { prog, custom, flags, exams, days, dev, settings, del, resetAt: resetAt || undefined });
  }
  // Inhalt ohne Rücksicht auf Reihenfolge vergleichbar machen (sonst würden sich zwei Geräte ewig gegenseitig neu hochladen)
  function canon(x) {
    const m = mergeState(x, {}); delete m.seenVersion;
    m.custom = m.custom.slice().sort((p, q) => p.id < q.id ? -1 : 1);
    const st = v => Array.isArray(v) ? "[" + v.map(st).join(",") + "]" : v && typeof v === "object" ? "{" + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ":" + st(v[k])).join(",") + "}" : JSON.stringify(v);
    return st(m);
  }
  async function gh(path, token, opt) {
    opt = opt || {};
    const headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };
    if (opt.body) headers["Content-Type"] = "application/json";
    let r;
    try { r = await fetch(GH + path, { method: opt.method || "GET", headers, body: opt.body, cache: "no-store" }); }
    catch (e) { throw new Error("Keine Verbindung zu GitHub"); }
    if (r.status === 401) throw Object.assign(new Error("Der GitHub-Schlüssel ist ungültig oder abgelaufen"), { code: 401 });
    if (r.status === 404) throw Object.assign(new Error("Nicht gefunden"), { code: 404 });
    if (r.status === 403 || r.status === 422) {
      let m = ""; try { m = (await r.json()).message || ""; } catch (e) {}
      throw new Error(/rate limit/i.test(m) ? "GitHub-Limit erreicht, später nochmal" : "GitHub erlaubt das nicht – hat der Schlüssel das Häkchen „gist“?");
    }
    if (!r.ok) throw new Error("GitHub-Fehler " + r.status);
    return r.json();
  }
  async function findGist(token) {
    for (let page = 1; page <= 5; page++) {
      const list = await gh("/gists?per_page=100&page=" + page, token);
      const g = list.find(x => x.files && x.files[GFILE]); if (g) return g.id;
      if (list.length < 100) break;
    }
    return null;
  }
  const payload = () => JSON.stringify({ app: "Security LernApp", hinweis: "Abgleich zwischen deinen Geräten. Bitte nicht bearbeiten oder löschen.", at: Date.now(), data: Object.assign({}, S, { seenVersion: undefined }) });
  async function readGist(token, id) {
    const g = await gh("/gists/" + id, token), f = g.files && g.files[GFILE];
    if (!f) return null;
    let text = f.content;
    if (f.truncated || !text) { const r = await fetch(f.raw_url, { cache: "no-store" }); if (!r.ok) throw new Error("Daten konnten nicht geladen werden"); text = await r.text(); }
    try { return JSON.parse(text).data || null; } catch (e) { return null; }
  }
  let syncBusy = null, syncAgain = false, syncTimer = null, syncErr = "";
  // save() ruft das schon beim Start auf, bevor dieser Teil geladen ist – darum abgesichert
  function syncSoon() { try { if (!syncConf().token) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(), 3000); } catch (e) {} }
  function syncNow() {
    const c = syncConf(); if (!c.token || !navigator.onLine) return Promise.resolve(false);
    if (syncBusy) { syncAgain = true; return syncBusy; }
    clearTimeout(syncTimer);
    syncBusy = (async () => {
      let changed = false;
      try {
        if (!c.gist) c.gist = await findGist(c.token);
        let remote = null;
        if (c.gist) { try { remote = await readGist(c.token, c.gist); } catch (e) { if (e.code === 404) c.gist = null; else throw e; } }
        if (remote) {
          const before = canon(S), m = mergeState(S, remote);
          if (canon(m) !== before) {
            ["prog", "custom", "flags", "exams", "days", "dev", "settings", "del", "resetAt"].forEach(k => { S[k] = m[k]; });
            S.settings = Object.assign({ showCount: true, sound: true, goal: 20 }, S.settings);
            try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
            changed = true;
          }
        }
        const files = {}; files[GFILE] = { content: payload() };
        if (!c.gist) c.gist = (await gh("/gists", c.token, { method: "POST", body: JSON.stringify({ description: "Security LernApp – Abgleich (nicht löschen)", public: false, files }) })).id;
        else if (!remote || canon(S) !== canon(remote)) await gh("/gists/" + c.gist, c.token, { method: "PATCH", body: JSON.stringify({ files }) });
        c.last = Date.now(); syncErr = "";
        const cur = syncConf(); if (cur.token === c.token) syncSave(Object.assign(cur, { gist: c.gist, last: c.last }));
      } catch (e) { syncErr = e.message; }
      syncBusy = null;
      if (changed) refreshAfterSync();
      showSyncState();
      if (syncAgain) { syncAgain = false; syncNow(); }
      return changed;
    })();
    return syncBusy;
  }
  // Nach dem Abgleich nur ruhige Seiten neu zeichnen, nie mitten in einer Fragenrunde oder Eingabe
  function refreshAfterSync() {
    const h = location.hash || "#/";
    if (ai || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return;
    if (h === "#/" || h === "#/themen" || h.startsWith("#/thema/") || h === "#/pruefung" || h === "#/einstellungen") {
      const y = window.scrollY; router(true); window.scrollTo(0, y);
    }
  }
  function syncCard() {
    const c = syncConf();
    if (!c.token) return `<div class="card" id="synccard"><h2>🔄 PC und Handy verbinden</h2>
      <p class="muted">Damit PC und Handy denselben Lernstand, dieselben eigenen Fragen und Prüfungen haben, speichert die App deine Daten in einem <b>privaten Speicher in deinem GitHub-Konto</b> (ein geheimes „Gist“). Das richtest du einmal pro Gerät ein:</p>
      <ol class="steps"><li>Auf <a href="https://github.com/settings/tokens/new?scopes=gist&description=Security%20LernApp" target="_blank" rel="noopener">github.com/settings/tokens/new</a> anmelden (der Link setzt schon das richtige Häkchen „gist“).</li>
      <li>Bei „Expiration“ am besten <b>No expiration</b> wählen, sonst musst du später einen neuen Schlüssel machen.</li>
      <li>Unten auf <b>Generate token</b> tippen und den Schlüssel (beginnt mit „ghp_“) kopieren.</li>
      <li>Hier einfügen und auf „Verbinden“ tippen. Auf dem zweiten Gerät denselben Schlüssel eingeben.</li></ol>
      <input type="password" id="synctok" placeholder="GitHub-Schlüssel (ghp_…)" autocomplete="off"><button class="btn sec" id="syncgo">Verbinden</button>
      <p class="muted">Der Schlüssel darf nur auf Gists zugreifen, bleibt nur auf diesem Gerät und ist nicht im Backup. Dein KI-Schlüssel wird nie übertragen. Schon vorhandene Daten auf beiden Geräten werden zusammengeführt, es geht nichts verloren.</p></div>`;
    return `<div class="card" id="synccard"><h2>🔄 PC und Handy verbunden</h2>
      <p>✅ GitHub-Konto <b>${esc(c.user || "")}</b></p><p class="muted" id="syncstate"></p>
      <p class="muted">Lernstand, eigene Fragen, Markierungen, Prüfungsergebnisse und Einstellungen werden automatisch abgeglichen: beim Öffnen, kurz nach jeder Antwort und alle 30 Sekunden. Eine laufende Prüfung bleibt auf dem Gerät, auf dem du sie angefangen hast.</p>
      <button class="btn sec" id="syncnow">Jetzt abgleichen</button><button class="btn danger" id="syncoff">Auf diesem Gerät trennen</button></div>`;
  }
  function showSyncState() {
    const el = $("#syncstate"); if (!el) return;
    const c = syncConf();
    el.innerHTML = syncBusy ? "Gleiche ab …" : syncErr ? "⚠️ " + esc(syncErr) : c.last ? "Zuletzt abgeglichen: " + new Date(c.last).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Noch nicht abgeglichen";
  }
  function bindSync() {
    showSyncState();
    const go1 = $("#syncgo"); if (go1) go1.onclick = async () => {
      const token = $("#synctok").value.trim(); if (!token) return toast("Bitte den GitHub-Schlüssel einfügen");
      go1.disabled = true; go1.textContent = "Verbinde …";
      try {
        const u = await gh("/user", token);
        syncSave({ token, user: u.login });
        syncErr = ""; const changed = await syncNow();
        if (syncErr) throw new Error(syncErr);
        toast(changed ? "Verbunden ✅ Daten vom anderen Gerät übernommen" : "Verbunden ✅");
        settingsPage();
      } catch (e) { syncSave({}); toast(e.message); go1.disabled = false; go1.textContent = "Verbinden"; }
    };
    const now = $("#syncnow"); if (now) now.onclick = async () => { now.disabled = true; const p = syncNow(); showSyncState(); const ch = await p; now.disabled = false; toast(syncErr ? syncErr : ch ? "Neue Daten übernommen ✅" : "Alles aktuell ✅"); };
    const off = $("#syncoff"); if (off) off.onclick = () => {
      if (!confirm("Abgleich auf diesem Gerät beenden? Deine Daten bleiben hier und in GitHub erhalten.")) return;
      syncSave({}); toast("Getrennt"); settingsPage();
    };
  }
  setInterval(() => { if (!document.hidden) syncNow(); }, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) syncNow(); else if (syncTimer) syncNow(); });

  // ---------- Was ist neu ----------
  function updatesPage() {
    clearTimer();
    setHeader("Was ist neu", "#/einstellungen");
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
    const tab = { "": "start", themen: "lernen", thema: "lernen", kapitel: "lernen", lernen: "lernen", markiert: "lernen", pruefung: "pruefung", fokus: "start", eigene: "fragen", einstellungen: "mehr", neu: "mehr" }[parts[0]] || "start";
    document.querySelectorAll("#tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === tab));
    document.body.dataset.page = parts[0] || "start";
    if (focus && h !== "#/lernen/fokus") { const f = focus; focus = null; stopFocusEffects(); S.settings.focusLog = (S.settings.focusLog || []).concat([{ d: Date.now(), m: f.min, n: f.n, r: f.right, a: f.away, early: true }]).slice(-20); S.settings._t = Date.now(); save(); }
    if (parts[0] === "themen") topicsPage();
    else if (parts[0] === "thema") topicPage(parts[1]);
    else if (parts[0] === "kapitel") lessonPage(parts[1]);
    else if (parts[0] === "lernen") { clearTimer(); startLearn(parts[1]); }
    else if (parts[0] === "markiert") { clearTimer(); startLearn("markiert"); }
    else if (parts[0] === "pruefung") { if (parts[1] === "laeuft") examRender(); else if (parts[1] === "ergebnis") examResult(); else examIntro(); }
    else if (parts[0] === "eigene") customPage();
    else if (parts[0] === "fokus") focusPage();
    else if (parts[0] === "einstellungen") settingsPage();
    else if (parts[0] === "neu") updatesPage();
    else home();
    enter();
  }
  document.addEventListener("click", ev => {
    const el = ev.target.closest("[data-go]"); if (!el) return;
    const target = el.dataset.go;
    if (location.hash === target) router(true); else go(target);
  });
  window.addEventListener("hashchange", () => { if (ai) closeAI(); router(); });
  initAIPanel();
  // Rauszoomen verhindern: Zwei-Finger-Geste nach innen wird bei normaler Größe abgefangen.
  // Reinzoomen bleibt möglich (Barrierefreiheit), und von dort zurück bis zur normalen Größe auch.
  const vScale = () => (window.visualViewport && visualViewport.scale) || 1;
  let pinch0 = 0;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  document.addEventListener("touchstart", ev => { if (ev.touches.length === 2) pinch0 = dist(ev.touches); }, { passive: true });
  document.addEventListener("touchmove", ev => {
    if (ev.touches.length !== 2 || !pinch0) return;
    if (dist(ev.touches) < pinch0 && vScale() <= 1.01) ev.preventDefault();
  }, { passive: false });
  document.addEventListener("touchend", ev => { if (ev.touches.length < 2) pinch0 = 0; }, { passive: true });
  // Safari meldet Pinch-Gesten zusätzlich als eigene Ereignisse
  let gScale = 1;
  document.addEventListener("gesturestart", () => { gScale = vScale(); }, { passive: false });
  document.addEventListener("gesturechange", ev => { if (ev.scale < 1 && gScale <= 1.01) ev.preventDefault(); }, { passive: false });

  // Tastatur (Computer): 1–6 wählt Antworten, Enter prüft bzw. geht weiter, Pfeile blättern in der Prüfung
  document.addEventListener("keydown", ev => {
    if (ai || /INPUT|TEXTAREA|SELECT/.test((ev.target.tagName || ""))) return;
    const h = location.hash;
    if (/^[1-6]$/.test(ev.key)) { const b = document.querySelectorAll("#app .ans:not([disabled])")[+ev.key - 1]; if (b && (h.startsWith("#/lernen") || h.startsWith("#/markiert") || h === "#/pruefung/laeuft")) { b.click(); ev.preventDefault(); } }
    else if (ev.key === "Enter") { const b = $("#check:not([disabled])") || $("#next"); if (b) { b.click(); ev.preventDefault(); } }
    else if (h === "#/pruefung/laeuft" && (ev.key === "ArrowRight" || ev.key === "ArrowLeft")) { const b = $(ev.key === "ArrowRight" ? "#nextq" : "#prev:not([disabled])"); if (b) b.click(); }
  });
  router();
  syncNow();

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
    const idle = (location.hash || "#/") === "#/" && !(exam && !exam.done) && !ai;
    if (idle) return applyUpdate();
    let b = $("#upd");
    if (!b) { b = document.createElement("div"); b.id = "upd"; b.className = "updbar"; document.body.appendChild(b); }
    b.innerHTML = `<span>🔄 Version ${esc(v)} ist da</span><button id="updgo">Jetzt aktualisieren</button>`;
    $("#updgo").onclick = () => { saveExam(); applyUpdate(); }; // laufende Prüfung ist gespeichert und läuft nach dem Update weiter
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
