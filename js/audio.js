/* Audio layer.
   say(lineId, text) plays audio/<file>.mp3 if the manifest lists a recorded clip for that line,
   otherwise speaks the text with the device's zh-CN voice (Web Speech API, free, on-device).
   iOS Safari rules handled here:
   - Nothing may play until a user gesture: unlock() must run inside the Start tap. It plays a silent
     clip on the ONE shared <audio> element (later clips reuse that element) and speaks an empty
     utterance so speechSynthesis is primed too.
   - navigator.audioSession.type = "playback" (Safari 16.4+/17) so sound plays with the silent switch on
     where supported; older iPads still need the switch off (see ipad_test_checklist.md).
   - speechSynthesis voices load asynchronously (voiceschanged); onend sometimes never fires on iOS and
     utterances can be garbage-collected mid-speech, so we keep a reference and use a timeout fallback.
   - cancel() immediately followed by speak() can drop the new utterance on iOS: small delay between. */
var AudioLayer = (function () {
  var manifest = (typeof AUDIO_MANIFEST !== "undefined") ? AUDIO_MANIFEST : { files: {} };
  var el = null, pending = null, unlocked = false, voice = null, current = null, token = 0, rate = 0.8;
  var SILENT = "audio/silence.mp3"; // 0.25 s silent clip used for the first-tap unlock
  var hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;

  function pickVoice() {
    if (!hasTTS) return null;
    var vs = speechSynthesis.getVoices() || [];
    var zh = vs.filter(function (v) { return /^zh[-_](CN|Hans)/i.test(v.lang) || /^cmn/i.test(v.lang); });
    if (!zh.length) zh = vs.filter(function (v) { return /^zh/i.test(v.lang) && !/HK|TW|yue/i.test(v.lang); });
    // Prefer known good iOS/macOS mainland voices, enhanced/premium first.
    var pref = [/tingting|婷婷/i, /lili|莉莉/i, /yu-?shu|语舒/i, /google.*普通话|google.*mandarin/i];
    zh.sort(function (a, b) { return score(b) - score(a); });
    function score(v) {
      var s = 0; pref.forEach(function (re, i) { if (re.test(v.name)) s += 10 - i; });
      if (/premium|enhanced|高品质|增强/i.test(v.name)) s += 5;
      if (v.localService) s += 1; return s;
    }
    voice = zh[0] || null;
    return voice;
  }
  if (hasTTS) {
    pickVoice();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    el = document.createElement("audio");
    el.setAttribute("playsinline", ""); el.preload = "auto";
    document.body.appendChild(el);
    el.src = SILENT;
    var p = el.play(); if (p && p.catch) p.catch(function () {});
    if (hasTTS) {
      try { var u = new SpeechSynthesisUtterance(" "); u.volume = 0; u.lang = "zh-CN"; speechSynthesis.speak(u); } catch (e) {}
    }
  }

  function clipFor(lineId, ctx) {
    var f = manifest.files && manifest.files[lineId];
    if (!f) return null;
    if (typeof f === "string") return f;
    // Lines containing the hero name were recorded with one specific name; if the parent changes it, use TTS.
    if (f.name && ctx && ctx.name && f.name !== ctx.name) return null;
    return f.file;
  }

  function stop() {
    token++;
    if (el) { try { el.pause(); } catch (e) {} el.onended = el.onerror = null; }
    if (hasTTS) { try { speechSynthesis.cancel(); } catch (e) {} }
    current = null;
    if (pending) { var f = pending; pending = null; f("cancelled"); } // settle the interrupted line's promise
  }

  function speakTTS(text, my) {
    return new Promise(function (resolve) {
      if (!hasTTS || !text) return resolve("no-tts");
      var done = false;
      function finish(why) { if (done) return; done = true; clearTimeout(t); if (pending === finish) pending = null; resolve(why); }
      pending = finish;
      var est = 900 + (text.replace(/[\s，。！？、—…,.!?]/g, "").length * 420) / rate;
      var t = setTimeout(function () { finish("timeout"); }, est + 2500);
      setTimeout(function () {
        if (my !== token) return finish("cancelled");
        var u = new SpeechSynthesisUtterance(text);
        u.lang = "zh-CN"; u.rate = rate; u.pitch = 1.05;
        if (voice) u.voice = voice;
        u.onend = function () { finish("end"); };
        u.onerror = function () { finish("error"); };
        current = u; // keep a reference (Safari GC bug)
        speechSynthesis.speak(u);
      }, 60);
    });
  }

  /* Test harness only (?cliprate=4): plays real clips faster so 128 paths finish in time. Never set in normal use. */
  var TEST_CLIP_RATE = (function () { var m = /[?&]cliprate=([0-9.]+)/.exec(location.search); return m ? Math.min(4, +m[1]) : 0; })();

  function playClip(src, text, my) {
    return new Promise(function (resolve) {
      if (!el) { unlock(); }
      var done = false;
      var dog = null; // watchdog: a stalled clip (no "ended", no error) must never freeze the book
      function arm(ms) { clearTimeout(dog); dog = setTimeout(function () { if (my === token) { try { el.pause(); } catch (e) {} } finish("stalled"); }, ms); }
      function finish(why) { if (done) return; done = true; clearTimeout(dog); if (pending === finish) pending = null; resolve(why); }
      arm(20000);
      el.onloadedmetadata = function () { if (isFinite(el.duration) && el.duration > 0) arm((el.duration / (el.playbackRate || 1)) * 1000 + 2500); };
      pending = finish;
      el.onended = function () { AudioLayer.clipsEnded++; finish("end"); };
      el.onerror = function () { // missing/broken clip → fall back to device voice
        if (my !== token) return finish("cancelled");
        speakTTS(text, my).then(finish);
      };
      el.src = src;
      if (TEST_CLIP_RATE) { el.defaultPlaybackRate = TEST_CLIP_RATE; el.playbackRate = TEST_CLIP_RATE; }
      var p = el.play();
      if (p && p.catch) p.catch(function () { if (my === token) speakTTS(text, my).then(finish); else finish("cancelled"); });
    });
  }

  /* say(lineId, text, ctx) → Promise resolved when the line finishes (or is interrupted). */
  function say(lineId, text, ctx) {
    stop();
    var my = token;
    var src = clipFor(lineId, ctx);
    var log = AudioLayer.log; if (log) log.push({ id: lineId, text: text, src: src || "tts" });
    return src ? playClip(src, text, my) : speakTTS(text, my);
  }

  return {
    unlock: unlock, say: say, stop: stop,
    isUnlocked: function () { return unlocked; },
    voiceName: function () { return voice ? voice.name + " (" + voice.lang + ")" : null; },
    hasTTS: function () { return hasTTS; },
    refreshVoice: pickVoice,
    setRate: function (r) { rate = r; },
    log: [], clipsEnded: 0
  };
})();
