/* Code-drawn SVG illustrations (no external images). viewBox 0 0 1000 520.
   Anything inside <g class="tap" data-word="..."> is tappable and says that word. */
var Art = (function () {
  var COL = { red: "#e63946", blue: "#3a86ff", yellow: "#ffbe0b" };
  var FONT = "'PingFang SC','Hiragino Sans GB','Noto Sans CJK SC',sans-serif";

  function tap(word, inner, hit) { // hit = [x,y,w,h] generous invisible touch area
    var h = hit ? '<rect class="hit" x="' + hit[0] + '" y="' + hit[1] + '" width="' + hit[2] + '" height="' + hit[3] + '" rx="20" fill="transparent"/>' : "";
    return '<g class="tap" data-word="' + word + '">' + h + inner + "</g>";
  }
  function car(color, x, y, s, o) {
    o = o || {}; var c = COL[color] || color;
    var lines = o.lines ? '<g class="speedlines" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".9">' +
      '<line x1="-95" y1="10" x2="-25" y2="10"/><line x1="-120" y1="38" x2="-20" y2="38"/><line x1="-90" y1="66" x2="-30" y2="66"/></g>' : "";
    var body =
      '<g class="wheel"><circle cx="45" cy="72" r="23" fill="#2b2d42"/><circle cx="45" cy="72" r="9" fill="#d9d9d9"/></g>' +
      '<g class="wheel"><circle cx="155" cy="72" r="23" fill="#2b2d42"/><circle cx="155" cy="72" r="9" fill="#d9d9d9"/></g>' +
      '<path d="M40 22 L72 -18 Q78 -24 88 -24 L128 -24 Q138 -24 144 -16 L170 22 Z" fill="' + c + '"/>' +
      '<path d="M66 18 L88 -12 L108 -12 L108 18 Z M116 18 L116 -12 L132 -12 L154 18 Z" fill="#cdeffd"/>' +
      '<rect x="0" y="18" width="205" height="52" rx="22" fill="' + c + '"/>' +
      '<circle cx="192" cy="36" r="8" fill="#fff3b0"/>' +
      '<circle cx="104" cy="42" r="12" fill="#fff"/><circle cx="134" cy="42" r="12" fill="#fff"/>' +
      '<circle cx="107" cy="44" r="5.5" fill="#222"/><circle cx="137" cy="44" r="5.5" fill="#222"/>' +
      '<path d="M108 58 Q120 66 132 58" stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    var g = '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      (o.lines ? tap("kuai", lines, [-130, -10, 120, 90]) : "") +
      tap("che", body, [-10, -30, 225, 130]) + "</g>";
    return o.anim ? '<g class="' + o.anim + '">' + g + "</g>" : g;
  }
  function sky(night) {
    return night
      ? '<rect width="1000" height="520" fill="#1d2951"/><circle cx="850" cy="80" r="42" fill="#fdf0c2"/><circle cx="868" cy="70" r="40" fill="#1d2951"/>' +
        [[120, 60], [260, 120], [420, 50], [560, 110], [700, 40], [330, 200], [620, 190]].map(function (p) {
          return '<circle class="twinkle" cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="#fff"/>'; }).join("")
      : '<rect width="1000" height="520" fill="#bde4f4"/><circle cx="880" cy="70" r="40" fill="#ffe066"/>' +
        '<g fill="#fff" opacity=".9"><ellipse cx="200" cy="80" rx="70" ry="24"/><ellipse cx="250" cy="65" rx="45" ry="22"/><ellipse cx="600" cy="110" rx="60" ry="20"/></g>';
  }
  function ground(night) {
    return '<rect y="300" width="1000" height="220" fill="' + (night ? "#2f5d3a" : "#8fd694") + '"/>' +
      '<rect y="345" width="1000" height="150" fill="' + (night ? "#3b3f4a" : "#6c757d") + '"/>' +
      '<g stroke="' + (night ? "#bbb" : "#fff") + '" stroke-width="7" stroke-dasharray="44 34"><line x1="0" y1="420" x2="1000" y2="420"/></g>';
  }
  function tree(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><rect x="-9" y="0" width="18" height="50" fill="#8d5524"/>' +
      '<circle cx="0" cy="-10" r="34" fill="#3a9d4a"/><circle cx="-22" cy="8" r="22" fill="#3a9d4a"/><circle cx="22" cy="8" r="22" fill="#3a9d4a"/></g>';
  }
  function flag(x, y) {
    return tap("hongse", '<g transform="translate(' + x + ',' + y + ')"><rect x="-4" y="0" width="8" height="140" fill="#555"/>' +
      '<path class="wave" d="M4 4 Q40 -6 70 8 Q100 22 120 12 L120 66 Q100 76 70 62 Q40 48 4 58 Z" fill="' + COL.red + '"/></g>', [x - 20, y - 15, 160, 170]);
  }
  function house(x, y, night) {
    return tap("jia", '<g transform="translate(' + x + ',' + y + ')"><rect x="0" y="40" width="150" height="110" fill="#f4d58d"/>' +
      '<path d="M-15 45 L75 -25 L165 45 Z" fill="#bc4749"/><rect x="55" y="85" width="40" height="65" rx="6" fill="#8d5524"/>' +
      '<rect x="15" y="65" width="32" height="30" fill="' + (night ? "#ffe066" : "#cdeffd") + '"/><rect x="103" y="65" width="32" height="30" fill="' + (night ? "#ffe066" : "#cdeffd") + '"/></g>',
      [x - 20, y - 30, 190, 190]);
  }
  function light(x, y, state) {
    var r = state === "red" ? COL.red : "#5a1a1f", g = state === "green" ? "#2dc653" : "#16401f", yel = "#5a4a12";
    var word = state === "red" ? "hongdeng" : "lvdeng";
    return tap(word, '<g transform="translate(' + x + ',' + y + ')"><rect x="-6" y="120" width="12" height="160" fill="#444"/>' +
      '<rect x="-38" y="0" width="76" height="190" rx="18" fill="#2b2d42"/>' +
      '<circle cx="0" cy="34" r="24" fill="' + r + '"' + (state === "red" ? ' class="glow"' : "") + '/>' +
      '<circle cx="0" cy="95" r="24" fill="' + yel + '"/>' +
      '<circle cx="0" cy="156" r="24" fill="' + g + '"' + (state === "green" ? ' class="glow"' : "") + '/></g>', [x - 60, y - 15, 120, 230]);
  }
  function stopSign(x, y) {
    var pts = []; for (var i = 0; i < 8; i++) { var a = Math.PI / 8 + i * Math.PI / 4; pts.push((Math.cos(a) * 52).toFixed(1) + "," + (Math.sin(a) * 52).toFixed(1)); }
    return tap("ting", '<g transform="translate(' + x + ',' + y + ')"><rect x="-5" y="40" width="10" height="120" fill="#777"/>' +
      '<polygon points="' + pts.join(" ") + '" fill="' + COL.red + '" stroke="#fff" stroke-width="5"/>' +
      '<text x="0" y="17" text-anchor="middle" font-size="48" font-weight="700" fill="#fff" font-family="' + FONT + '">停</text></g>', [x - 65, y - 65, 130, 230]);
  }
  function snail(x, y) {
    return tap("man", '<g transform="translate(' + x + ',' + y + ')" class="snail"><path d="M-10 40 Q40 46 80 40 L84 30 Q60 26 30 30 Z" fill="#f2c794"/>' +
      '<circle cx="25" cy="10" r="30" fill="#c77dff"/><path d="M25 10 m-18 0 a18 18 0 1 1 18 18 a11 11 0 1 1 -11 -11" stroke="#7b2cbf" stroke-width="5" fill="none"/>' +
      '<line x1="74" y1="30" x2="82" y2="2" stroke="#f2c794" stroke-width="4"/><line x1="80" y1="32" x2="94" y2="6" stroke="#f2c794" stroke-width="4"/>' +
      '<circle cx="82" cy="2" r="5" fill="#222"/><circle cx="94" cy="6" r="5" fill="#222"/></g>', [x - 25, y - 35, 140, 95]);
  }
  function dog(x, y) {
    return tap("xiaogou", '<g class="walk"><g transform="translate(' + x + ',' + y + ')"><ellipse cx="0" cy="40" rx="48" ry="26" fill="#c68b59"/>' +
      '<rect x="-36" y="52" width="13" height="32" rx="6" fill="#c68b59"/><rect x="20" y="52" width="13" height="32" rx="6" fill="#c68b59"/>' +
      '<path d="M-46 30 Q-70 20 -60 0" stroke="#c68b59" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<circle cx="48" cy="6" r="32" fill="#c68b59"/><ellipse cx="26" cy="0" rx="12" ry="24" fill="#7f4f24"/><ellipse cx="72" cy="0" rx="12" ry="24" fill="#7f4f24"/>' +
      '<circle cx="40" cy="2" r="5" fill="#222"/><circle cx="58" cy="2" r="5" fill="#222"/><ellipse cx="49" cy="18" rx="8" ry="6" fill="#222"/></g></g>', [x - 75, y - 35, 165, 130]);
  }
  function cat(x, y) {
    return tap("xiaomao", '<g class="walk"><g transform="translate(' + x + ',' + y + ')"><ellipse cx="0" cy="40" rx="44" ry="24" fill="#f4a259"/>' +
      '<rect x="-32" y="52" width="12" height="30" rx="6" fill="#f4a259"/><rect x="18" y="52" width="12" height="30" rx="6" fill="#f4a259"/>' +
      '<path d="M-42 34 Q-80 30 -66 -10" stroke="#f4a259" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<circle cx="46" cy="6" r="30" fill="#f4a259"/><path d="M22 -12 L26 -40 L44 -22 Z M50 -22 L68 -40 L72 -12 Z" fill="#f4a259"/>' +
      '<circle cx="37" cy="2" r="5" fill="#222"/><circle cx="56" cy="2" r="5" fill="#222"/><path d="M42 14 L50 14 L46 19 Z" fill="#e5989b"/>' +
      '<g stroke="#555" stroke-width="2"><line x1="30" y1="16" x2="6" y2="12"/><line x1="30" y1="20" x2="6" y2="24"/><line x1="62" y1="16" x2="86" y2="12"/><line x1="62" y1="20" x2="86" y2="24"/></g></g></g>',
      [x - 80, y - 50, 175, 140]);
  }
  function flowers(x, y) {
    var s = ""; [0, 70, 140, 210].forEach(function (dx, i) {
      var col = ["#ff70a6", "#ffd670", "#ff9770", "#e0aaff"][i];
      s += '<g transform="translate(' + (x + dx) + ',' + y + ')"><line x1="0" y1="0" x2="0" y2="40" stroke="#2d6a4f" stroke-width="5"/>' +
        [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180; return '<circle cx="' + (Math.cos(r) * 13).toFixed(1) + '" cy="' + (Math.sin(r) * 13).toFixed(1) + '" r="10" fill="' + col + '"/>'; }).join("") +
        '<circle r="8" fill="#ffd60a"/></g>';
    });
    return tap("hua", s, [x - 30, y - 30, 270, 80]);
  }
  function finish(x) {
    var sq = ""; for (var r = 0; r < 10; r++) for (var c = 0; c < 2; c++) sq += '<rect x="' + (c * 15) + '" y="' + (r * 15) + '" width="15" height="15" fill="' + ((r + c) % 2 ? "#fff" : "#222") + '"/>';
    // Coach v1.1: the finish line is shown but NOT tappable
    return ('<g transform="translate(' + x + ',345)">' + sq + '</g><g transform="translate(' + (x - 10) + ',150)"><rect x="0" y="0" width="8" height="200" fill="#555"/><rect x="42" y="0" width="8" height="200" fill="#555"/>' +
      '<rect x="-30" y="0" width="110" height="40" rx="8" fill="#fff" stroke="#222" stroke-width="3"/>' +
      '<g>' + (function () { var t = ""; for (var i = 0; i < 7; i++) t += '<rect x="' + (-26 + i * 15) + '" y="6" width="8" height="8" fill="#222"/><rect x="' + (-19 + i * 15) + '" y="22" width="8" height="8" fill="#222"/>'; return t; })() + "</g></g>");
  }
  function startLine(x) { // plain checkered start line on the road (not tappable)
    var sq = ""; for (var r = 0; r < 10; r++) for (var c = 0; c < 2; c++) sq += '<rect x="' + (c * 15) + '" y="' + (r * 15) + '" width="15" height="15" fill="' + ((r + c) % 2 ? "#fff" : "#222") + '"/>';
    return '<g transform="translate(' + x + ',345)">' + sq + "</g>";
  }
  function crossing(x) {
    var s = ""; for (var i = 0; i < 5; i++) s += '<rect x="' + (x + i * 30) + '" y="345" width="18" height="150" fill="#fff" opacity=".9"/>';
    return s;
  }

  // generic, code-drawn people (no photos, no likeness): a grown-up and a child
  function person(x, y, sc, shirt, hair, child) {
    var skin = "#f1c79e";
    var arm = child
      ? '<path d="M18 -8 Q40 -40 52 -70" stroke="' + shirt + '" stroke-width="16" stroke-linecap="round" fill="none"/>'   // raised arm holding the toy
      : '<path d="M-24 -10 Q-40 20 -30 50" stroke="' + shirt + '" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M24 -10 Q44 10 30 40" stroke="' + shirt + '" stroke-width="16" stroke-linecap="round" fill="none"/>';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">' +
      '<rect x="-20" y="50" width="16" height="70" rx="8" fill="#3d405b"/><rect x="4" y="50" width="16" height="70" rx="8" fill="#3d405b"/>' +
      '<rect x="-30" y="-25" width="60" height="85" rx="26" fill="' + shirt + '"/>' + arm +
      (child ? '<path d="M-18 -8 Q-34 20 -26 44" stroke="' + shirt + '" stroke-width="16" stroke-linecap="round" fill="none"/>' : "") +
      '<circle cx="0" cy="-58" r="34" fill="' + skin + '"/>' +
      '<path d="M-34 -62 Q-30 -100 0 -98 Q30 -100 34 -62 Q20 -80 0 -80 Q-20 -80 -34 -62 Z" fill="' + hair + '"/>' +
      '<circle cx="-12" cy="-58" r="4" fill="#222"/><circle cx="12" cy="-58" r="4" fill="#222"/>' +
      '<path d="M-10 -44 Q0 -36 10 -44" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
  }
  function handoffScene() {
    var s = '<rect width="1000" height="520" fill="#f6e7c8"/><rect y="400" width="1000" height="120" fill="#c9a27e"/>' +
      '<g transform="translate(250,70)"><rect width="150" height="120" rx="8" fill="#1d2951" stroke="#fff" stroke-width="8"/>' +
      '<circle cx="105" cy="40" r="20" fill="#fdf0c2"/><circle cx="114" cy="34" r="19" fill="#1d2951"/><line x1="75" y1="0" x2="75" y2="120" stroke="#fff" stroke-width="6"/></g>' +
      '<rect x="560" y="300" width="260" height="110" rx="30" fill="#bc8a5f"/><rect x="545" y="270" width="40" height="140" rx="18" fill="#a47148"/><rect x="795" y="270" width="40" height="140" rx="18" fill="#a47148"/>';
    s += person(690, 270, 1.15, "#2a9d8f", "#3b2f2f", false);              // grown-up, sitting on the sofa
    s += person(470, 330, 0.72, "#f4a261", "#2b2b2b", true);               // child
    s += '<g transform="translate(486,250) scale(.32)">' + car("red", 0, 0, 1).replace(/class="tap"/g, 'class="i"').replace(/data-word="[a-z]+"/g, "") + "</g>"; // toy car in his hand
    // speech bubble from the child towards the grown-up, with a tiny red car inside (he is telling the story)
    s += '<g transform="translate(540,120)"><path d="M0 0 h130 a22 22 0 0 1 22 22 v46 a22 22 0 0 1 -22 22 h-90 l-30 26 l6 -26 h-16 a22 22 0 0 1 -22 -22 v-46 a22 22 0 0 1 22 -22 z" fill="#fff" stroke="#74c0fc" stroke-width="5"/>' +
      '<g transform="translate(28,24) scale(.45)">' + car("red", 0, 0, 1).replace(/class="tap"/g, 'class="i"').replace(/data-word="[a-z]+"/g, "") + "</g></g>";
    return s;
  }

  // state.rival = "blue" | "yellow"
  function scene(name, state) {
    var rv = (state && state.rival) || "blue", night = name === "night";
    var s = sky(night) + ground(night);
    switch (name) {
      case "start": s += house(80, 170) + tree(330, 255) + flag(800, 170) + car("red", 420, 330, 1.25, { anim: "bob" }); break;
      case "startline": s += startLine(250) + flag(70, 170) + car(rv, 300, 300, 0.95, { anim: "enter-slow" }) + car("red", 290, 380, 1.05, { anim: "bob" }) + tree(820, 255); break;
      case "road-fast": s += tree(150, 255) + tree(870, 255) + car(rv, 280, 300, 0.85, {}) + car("red", 560, 380, 1.05, { lines: true, anim: "enter-fast" }); break;
      case "road-slow": s += tree(150, 255) + snail(780, 265) + car(rv, 640, 300, 0.85, {}) + car("red", 260, 380, 1.05, { anim: "enter-slow" }); break;
      case "light-red": s += light(760, 120, "red") + stopSign(900, 200) + car(rv, 330, 300, 0.85, {}) + car("red", 420, 380, 1.05, { anim: "enter-stop" }) + '<rect x="660" y="345" width="12" height="150" fill="#fff"/>'; break;
      case "light-green": s += light(760, 120, "green") + car(rv, 360, 300, 0.85, {}) + car("red", 520, 380, 1.05, { lines: true, anim: "enter-fast" }); break;
      case "crossing-dog": s += crossing(600) + dog(660, 360) + stopSign(900, 200) + car("red", 300, 380, 1.05, { anim: "enter-stop" }) + tree(120, 255); break;
      case "crossing-cat": s += crossing(600) + cat(660, 365) + stopSign(900, 200) + car("red", 300, 380, 1.05, { anim: "enter-stop" }) + tree(120, 255); break;
      case "race-fast": s += tree(800, 255) + car(rv, 150, 300, 0.85, {}) + car("red", 560, 380, 1.05, { lines: true, anim: "enter-fast" }); break;
      case "race-slow": s += flowers(560, 300) + snail(120, 262) + car(rv, 640, 300, 0.85, {}) + car("red", 260, 380, 1.05, { anim: "enter-slow" }); break;
      case "finish-red": s += finish(640) + flag(860, 170) + car(rv, 330, 300, 0.85, {}) + car("red", 700, 380, 1.05, { lines: true, anim: "enter-fast" }); break;
      case "finish-rival": s += finish(640) + flag(860, 170) + car(rv, 690, 300, 0.85, {}) + car("red", 380, 380, 1.05, { anim: "enter-slow" }); break;
      case "home-fast": s += house(800, 170) + tree(120, 255) + car("red", 480, 380, 1.05, { lines: true, anim: "enter-fast" }); break;
      case "home-slow": s += house(800, 170) + snail(130, 262) + car("red", 420, 380, 1.05, { anim: "enter-slow" }); break;
      case "handoff": return '<svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img">' + handoffScene() + "</svg>";
      case "night": s += house(590, 170, true) + car("red", 250, 380, 1.05, {}); break; // ending is full-height, so sides get cropped: keep things central
    }
    return '<svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img">' + s + "</svg>";
  }

  // Small icons for choice buttons (no text in them; label is shown below)
  function icon(name, state) {
    var rv = (state && state.rival) || "blue", inner = "";
    switch (name) {
      case "car-blue": inner = car("blue", 25, 45, 0.75); break;
      case "car-yellow": inner = car("yellow", 25, 45, 0.75); break;
      case "car-red": inner = car("red", 25, 45, 0.75); break;
      case "car-rival": inner = car(rv, 25, 45, 0.75); break;
      case "fast": inner = car("red", 70, 45, 0.7, { lines: true }); break;
      case "slow": inner = '<g transform="translate(30,-200)">' + snail(20, 270).replace(/class="tap"/, 'class="i"') + "</g>"; break;
      case "light-red": inner = '<g transform="translate(95,10) scale(.6)">' + light(0, 0, "red") + "</g>"; break;
      case "light-green": inner = '<g transform="translate(95,10) scale(.6)">' + light(0, 0, "green") + "</g>"; break;
      case "dog": inner = dog(70, 45); break;
      case "cat": inner = cat(70, 55); break;
    }
    // icons are not individually tappable (the whole button is)
    inner = inner.replace(/class="tap"/g, 'class="i"').replace(/ class="(walk|snail|wave|bob)"/g, "").replace(/<g class="walk">/g, "<g>");
    return '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + "</svg>";
  }

  // Which words are tappable in each scene (used for the doc + tests)
  function tapsFor(name, state) {
    var re = /data-word="([a-z]+)"/g, m, out = []; var svg = scene(name, state);
    while ((m = re.exec(svg))) if (out.indexOf(m[1]) < 0) out.push(m[1]);
    return out;
  }
  return { scene: scene, icon: icon, tapsFor: tapsFor, car: car };
})();
if (typeof module !== "undefined") module.exports = Art;
