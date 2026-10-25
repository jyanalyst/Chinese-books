/* Shared helpers: parse token text, fill the hero name, and list every spoken line with its
   audio id. Used by the app (browser) and by tools/build_manifest.js (node). */
var Lines = (function () {
  function pad(pid) { return pid.replace(/^p(\d)([a-z]?)$/, function (_, n, v) { return "p0" + n + v; }); }
  function parse(t, cfg) {
    cfg = cfg || {};
    return t.split(/\s+/).filter(Boolean).map(function (tok) {
      var i = tok.indexOf("|"), zh = i < 0 ? tok : tok.slice(0, i), py = i < 0 ? "" : tok.slice(i + 1).replace(/·/g, " ");
      if (zh === "{name}") { zh = cfg.name || "小杰"; py = py === "{py}" ? (cfg.py || "Xiǎojié") : py; }
      if (zh === "{person}") { var pp = cfg.personObj || { zh: "妈妈", py: "māma" }; zh = pp.zh; py = pp.py; }
      return { zh: zh, py: py };
    });
  }
  // Which word (if any) a sentence token says when tapped: exact word or one of its listed forms (快快 → 快).
  function tokenWord(S, zh) {
    for (var id in S.words) { var w = S.words[id]; if (w.zh === zh || (w.forms && w.forms.indexOf(zh) >= 0)) return id; }
    return null;
  }
  function hanzi(t, cfg) { return parse(t, cfg).map(function (x) { return x.zh; }).join(""); }
  function pinyin(t, cfg) { return parse(t, cfg).map(function (x) { return x.py || x.zh; }).join(" ").replace(/ ([，。！？—])/g, "$1"); }
  function choiceFor(S, pid) {
    var p = S.pages[pid];
    if (p.choice) return { id: pad(pid) + "_choice", set: p.choice };
    var k = S.choices[pid]; return k ? { id: "choice_" + k, set: S.choiceSets[k] } : null;
  }
  function all(S, cfg) {
    var out = [], seen = {};
    function add(id, kind, t, en, where) {
      if (seen[id]) { seen[id].where.push(where); return; }
      var l = { id: id, kind: kind, zh: hanzi(t, cfg), py: pinyin(t, cfg), en: en, file: "audio/" + id + ".mp3", hasName: /\{name\}/.test(t), where: [where] };
      seen[id] = l; out.push(l);
    }
    Object.keys(S.pages).forEach(function (pid) {
      var p = S.pages[pid], P = pad(pid);
      add(P + "_narration", "narration", p.text, p.en, pid);
      if (p.sayit) { add(P + "_sayit", "say-it question", p.sayit.q, p.sayit.en, pid); if (p.sayit.a) add(P + "_answer", "say-it model answer", p.sayit.a, p.sayit.aen, pid); }
      if (p.closing) add(P + "_closing", "closing", p.closing.text, p.closing.en, pid);
      if (p.handoff) (S.people || []).forEach(function (pp) { // one clip per person option
        var c2 = {}; for (var k in cfg) c2[k] = cfg[k]; c2.personObj = pp;
        var l = { id: P + "_handoff_" + pp.id, kind: "hand-off (" + pp.zh + ")", zh: hanzi(p.handoff.text, c2), py: pinyin(p.handoff.text, c2),
          en: p.handoff.en.replace("{personEn}", pp.en), file: "audio/" + P + "_handoff_" + pp.id + ".mp3", hasName: false, where: [pid] };
        if (!seen[l.id]) { seen[l.id] = l; out.push(l); }
      });
      var c = choiceFor(S, pid);
      if (c) { add(c.id, "choice question", c.set.q, c.set.en, pid); c.set.options.forEach(function (o) { add(o.id, "choice option", o.label, o.en, pid); }); }
    });
    Object.keys(S.words).forEach(function (w) { var x = S.words[w]; add("word_" + w, x.target ? "word (target)" : "word (support)", x.zh + "|" + x.py, x.en, "tap"); });
    return out;
  }
  function person(S, id) { var ps = S.people || []; for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i]; return ps[0]; }
  return { person: person, pad: pad, parse: parse, tokenWord: tokenWord, hanzi: hanzi, pinyin: pinyin, choiceFor: choiceFor, all: all };
})();
if (typeof module !== "undefined") module.exports = Lines;
