/* Picture book app: setup (English) → story pages (Mandarin only) → calm ending (stops). */
(function () {
  var S = STORY, $ = function (id) { return document.getElementById(id); };
  var CFG_KEY = "redcarbook.cfg.v1";
  var cfg = loadCfg();
  var state = {}, pid = null, pageTok = 0, history = [];
  var interrupt = null, interruptN = 0;           // a word tap or replay that paused the page flow
  var TEST = /[?&]test=1/.test(location.search);  // headless tests: speech resolves instantly

  if (TEST) { // stub speech so tests don't depend on installed voices; log is still recorded
    window.speechSynthesis && (window.speechSynthesis.speak = function (u) { setTimeout(function () { u.onend && u.onend(); }, 20); });
  }

  function loadCfg() {
    var d = { name: "小杰", py: "Xiǎojié", rate: 0.8, showPinyin: false, person: "mama" }; // Coach v1.1: pinyin hidden by default
    try { var s = JSON.parse(localStorage.getItem(CFG_KEY) || "{}"); for (var k in s) d[k] = s[k]; } catch (e) {}
    return d;
  }
  function saveCfg() { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // Coach v1.2: in the sentence ONLY the 5 targets (车 红色 快 慢 停, incl. 快快/慢慢/停一停) are tappable; anything else replays the line.
  function ruby(t, noTap) {
    return Lines.parse(t, cfg).map(function (x) {
      if (!x.py) return '<span class="p">' + esc(x.zh) + "</span>";
      var r = "<ruby>" + esc(x.zh) + "<rt>" + esc(x.py) + "</rt></ruby>", id = noTap ? null : Lines.tokenWord(S, x.zh);
      if (id && !S.words[id].target) id = null;
      return id ? '<span class="w t" data-word="' + id + '">' + r + "</span>" : r;
    }).join("");
  }
  function applyPinyin() { document.body.classList.toggle("hide-py", !cfg.showPinyin); }
  function zh(t) { return Lines.hanzi(t, cfg); }
  function syncPerson() { cfg.personObj = Lines.person(S, cfg.person); }
  function show(id) {
    ["setup", "story", "ending"].forEach(function (s) { $(s).classList.toggle("active", s === id); });
    document.body.classList.toggle("in-story", id !== "setup");
  }

  /* ---------- setup ---------- */
  function initSetup() {
    $("cfgName").value = cfg.name; $("cfgPy").value = cfg.py; $("cfgRate").value = String(cfg.rate);
    $("cfgShowPy").checked = !!cfg.showPinyin; applyPinyin();
    $("cfgPerson").innerHTML = S.people.map(function (p) { return '<option value="' + p.id + '">' + p.zh + " (" + esc(p.en) + ")</option>"; }).join("");
    $("cfgPerson").value = cfg.person; syncPerson();
    $("cfgPerson").onchange = function () { cfg.person = $("cfgPerson").value; syncPerson(); saveCfg(); };
    $("cfgShowPy").onchange = function () { cfg.showPinyin = $("cfgShowPy").checked; saveCfg(); applyPinyin(); };
    var n = Object.keys((window.AUDIO_MANIFEST && AUDIO_MANIFEST.files) || {}).length;
    $("clipCount").textContent = n + " of " + Lines.all(S, cfg).length + (n ? "" : " (none yet)");
    updateVoiceInfo();
    if (window.speechSynthesis && speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", updateVoiceInfo);
    setTimeout(updateVoiceInfo, 800);
    $("testVoice").onclick = function () { readCfg(); AudioLayer.unlock(); AudioLayer.say("test", "红色的车。", cfg); };
    $("startBtn").onclick = function () { readCfg(); AudioLayer.unlock(); startStory(); };
  }
  function readCfg() {
    cfg.name = ($("cfgName").value || "").trim() || "小杰";
    cfg.py = ($("cfgPy").value || "").trim() || cfg.name;
    cfg.rate = parseFloat($("cfgRate").value) || 0.8;
    cfg.showPinyin = $("cfgShowPy").checked; applyPinyin();
    cfg.person = $("cfgPerson").value || "mama"; syncPerson();
    AudioLayer.setRate(cfg.rate); saveCfg();
  }
  function updateVoiceInfo() {
    AudioLayer.refreshVoice();
    var v = AudioLayer.voiceName(), el = $("voiceInfo");
    if (!AudioLayer.hasTTS()) { el.innerHTML = '<span class="warn">This browser has no speech voice. Use Safari on the iPad.</span>'; return; }
    el.innerHTML = v ? "Mandarin voice found: <b>" + esc(v) + "</b>"
      : '<span class="warn">No Mandarin (China mainland) voice found yet. On the iPad: Settings › Accessibility › Spoken Content › Voices › Chinese (China mainland) — download one (e.g. Tingting or Lili, “Enhanced” if offered).</span>';
  }

  /* ---------- story flow ---------- */
  function startStory() { state = {}; history = []; show("story"); goto(S.start); }

  function goto(next) {
    pageTok++; AudioLayer.stop(); pid = next; history.push(next);
    var p = S.pages[pid];
    $("scene").innerHTML = Art.scene(p.scene, state);
    $("sentence").innerHTML = ruby(p.text);
    $("actions").innerHTML = "";
    $("pageDots").innerHTML = Array.apply(null, Array(9)).map(function (_, i) { return '<i class="' + (i < p.n ? "on" : "") + '"></i>'; }).join("");
    runPage(pageTok);
  }

  // Speak a line; if a word tap / replay interrupts it, wait for that to finish, then carry on.
  function speak(id, text, tok) {
    return AudioLayer.say(id, text, cfg).then(function waitInt() {
      if (tok !== pageTok) throw "stale";
      if (interrupt) return interrupt.then(waitInt);
    });
  }
  function waitTap(btn, tok) {
    return new Promise(function (res, rej) { btn.onclick = function () { if (tok !== pageTok) return rej("stale"); btn.disabled = true; res(); }; });
  }

  function runPage(tok) {
    var p = S.pages[pid], P = Lines.pad(pid), A = $("actions");
    var flow = speak(P + "_narration", zh(p.text), tok);
    if (p.sayit) flow = flow.then(function () {
      A.innerHTML = '<div class="sayit"><div class="bubble">' + ruby(p.sayit.q) + '<span class="ans"></span></div>' +
        '<button class="go" id="goBtn" aria-label="说好了"><svg viewBox="0 0 24 24"><path d="M7 4 L20 12 L7 20 Z" fill="#fff"/></svg>说好了</button></div>';
      var btn = $("goBtn");
      var tapped = waitTap(btn, tok); // the parent may tap ▶ even while the question is still being read
      speak(P + "_sayit", zh(p.sayit.q), tok).catch(function () {});
      return tapped.then(function () {
        if (!p.sayit.a) return;
        A.querySelector(".ans").innerHTML = ruby(p.sayit.a);
        return speak(P + "_answer", zh(p.sayit.a), tok);
      });
    });
    if (p.ending) {
      flow = flow.then(function () {
        A.innerHTML = ""; $("sentence").innerHTML = ruby(p.closing.text);
        return speak(P + "_closing", zh(p.closing.text), tok);
      }).then(function () {
        // hand-off: picture of the child with a grown-up, then send him back to a real person
        $("scene").innerHTML = Art.scene("handoff", state);
        $("sentence").innerHTML = ruby(p.handoff.text);
        return speak(P + "_handoff_" + cfg.person, zh(p.handoff.text), tok);
      }).then(function () { return new Promise(function (r) { setTimeout(r, 1500); }); })
        .then(function () { if (tok === pageTok) showEnding(); });
    } else {
      var c = Lines.choiceFor(S, pid);
      if (c) flow = flow.then(function () { return showChoice(c, tok); });
      else flow = flow.then(function () {
        A.innerHTML = '<button class="go next" id="nextBtn" aria-label="下一页"><svg viewBox="0 0 24 24"><path d="M7 4 L20 12 L7 20 Z" fill="#fff"/></svg></button>';
        return waitTap($("nextBtn"), tok).then(function () { goto(S.next[pid]); });
      });
    }
    flow.catch(function (e) { if (e !== "stale") console.error(e); });
  }

  function showChoice(c, tok) {
    var A = $("actions");
    A.innerHTML = c.set.options.map(function (o, i) {
      return '<button class="choice" data-i="' + i + '" aria-label="' + esc(zh(o.label)) + '">' + Art.icon(o.icon, state) + '<span class="lbl">' + ruby(o.label, true) + "</span></button>";
    }).join("");
    $("sentence").innerHTML = ruby(c.set.q);
    var picked = false;
    Array.prototype.forEach.call(A.querySelectorAll(".choice"), function (b) {
      b.onclick = function () {
        if (picked || tok !== pageTok) return; picked = true;
        var o = c.set.options[+b.dataset.i];
        b.classList.add("picked");
        Array.prototype.forEach.call(A.querySelectorAll(".choice"), function (x) { if (x !== b) x.disabled = true; });
        if (o.set) for (var k in o.set) state[k] = o.set[k];
        AudioLayer.say(o.id, zh(o.label), cfg).then(function () {
          if (tok === pageTok) setTimeout(function () { if (tok === pageTok) goto(o.next); }, 250);
        });
      };
    });
    return speak(c.id, zh(c.set.q), tok);
  }

  /* ---------- taps: objects say their word, sentence/replay repeats narration ---------- */
  function pauseFlowFor(promiseFactory) {
    var n = ++interruptN;
    var pr = promiseFactory().then(function () { if (n === interruptN) interrupt = null; });
    interrupt = pr; return pr;
  }
  var cardTimer = null;
  function sayWord(id, el) {
    var w = S.words[id]; if (!w) return;
    if (el) { el.classList.remove("pulse"); void el.getBoundingClientRect(); el.classList.add("pulse"); }
    var card = $("wordCard");
    card.className = w.target ? "target" : "support";
    card.innerHTML = '<div class="py">' + esc(w.py) + '</div><div class="zh">' + esc(w.zh) + "</div>";
    void card.offsetWidth; card.classList.add("show"); clearTimeout(cardTimer);
    cardTimer = setTimeout(function () { card.classList.remove("show"); }, 2600);
    pauseFlowFor(function () { return AudioLayer.say("word_" + id, w.zh, cfg); });
  }
  $("scene").addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".tap"); if (!t) return;
    sayWord(t.getAttribute("data-word"), t);
  });
  // word taps inside the sentence or the say-it bubble
  $("panel").addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".w"); if (!t) return;
    e.stopPropagation(); sayWord(t.getAttribute("data-word"), t);
  }, true);
  function replay() {
    if (!pid) return; var p = S.pages[pid];
    var c = Lines.choiceFor(S, pid), choosing = !!$("actions").querySelector(".choice");
    if (choosing) pauseFlowFor(function () { return AudioLayer.say(c.id, zh(c.set.q), cfg); });
    else { $("sentence").innerHTML = ruby(p.text); pauseFlowFor(function () { return AudioLayer.say(Lines.pad(pid) + "_narration", zh(p.text), cfg); }); }
  }
  $("replayBtn").onclick = replay;
  $("sentence").onclick = function (e) { if (!(e.target.closest && e.target.closest(".w"))) replay(); };

  /* ---------- ending: calm, stops, nothing autoplays ---------- */
  function showEnding() {
    AudioLayer.stop();
    $("endScene").innerHTML = Art.scene("handoff", state);
    show("ending");
    var t = document.querySelector(".end-text"); t.classList.remove("show");
    setTimeout(function () { t.classList.add("show"); }, 50);
  }

  /* ---------- press-and-hold house button returns to the parent screen ---------- */
  function holdButton(btn) {
    var timer = null;
    function start(e) { e.preventDefault(); btn.classList.add("holding"); timer = setTimeout(function () { cancel(); goHome(); }, 1000); }
    function cancel() { btn.classList.remove("holding"); clearTimeout(timer); }
    btn.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { btn.addEventListener(ev, cancel); });
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }
  function goHome() { pageTok++; AudioLayer.stop(); pid = null; show("setup"); initSetup(); }
  holdButton($("homeBtn")); holdButton($("homeBtn2"));

  // offline cache (only works over http(s), e.g. GitHub Pages or a local server)
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol) && !TEST) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  // v1.5: opened from Little Garage (?from=garage&back=<same-site url>): a small 🚗 button back to it, on the setup and 完 screens only
  (function () {
    var q = /[?&]from=garage(&|$)/.test(location.search) && /[?&]back=([^&]*)/.exec(location.search);
    if (!q) return;
    try { var u = new URL(decodeURIComponent(q[1]), location.href); if (u.origin !== location.origin) return; } catch (e) { return; }
    var a = document.createElement("a"); a.id = "garageBack"; a.href = u.href; a.textContent = "🚗 小车库"; a.setAttribute("aria-label", "Back to Little Garage");
    document.body.appendChild(a);
  })();

  // hooks for automated tests
  window.__book = { goto: goto, get pid() { return pid; }, get state() { return state; }, get history() { return history.slice(); }, cfg: cfg, home: goHome };
  syncPerson(); applyPinyin();
  initSetup();
})();
