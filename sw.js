/* Offline cache: bump VERSION whenever any file changes. */
var VERSION = "book-v1.4-1";
var FILES = ["./", "index.html", "css/style.css", "js/story.js", "js/lines.js", "js/art.js", "js/audio.js", "js/app.js",
  "audio/manifest.js", "audio/silence.mp3", "icon.svg", "manifest.webmanifest"];
/* Precache every recorded clip listed in the manifest, so the whole book works offline from the first visit. */
try {
  importScripts("audio/manifest.js");
  var mf = (self.AUDIO_MANIFEST && self.AUDIO_MANIFEST.files) || {};
  Object.keys(mf).forEach(function (k) { var f = typeof mf[k] === "string" ? mf[k] : mf[k].file; if (f && FILES.indexOf(f) < 0) FILES.push(f); });
} catch (err) { /* no manifest: clips are cached as they are played */ }
self.addEventListener("install", function (e) { e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
/* Safari asks for audio with a Range header; answer from the cached file with a 206 slice. */
function rangeResponse(req, resp) {
  var m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  if (!m) return resp;
  return resp.arrayBuffer().then(function (buf) {
    var size = buf.byteLength, start = m[1] ? +m[1] : size - +m[2], end = m[1] && m[2] ? +m[2] : size - 1;
    if (!m[1]) end = size - 1;
    if (start >= size) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
    end = Math.min(end, size - 1);
    return new Response(buf.slice(start, end + 1), { status: 206, headers: {
      "Content-Type": resp.headers.get("Content-Type") || "audio/mpeg", "Content-Range": "bytes " + start + "-" + end + "/" + size,
      "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
  });
}
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var isRange = e.request.headers.has("range");
  e.respondWith(caches.match(e.request.url).then(function (r) {
    if (r) return isRange ? rangeResponse(e.request, r) : r;
    if (isRange) return fetch(e.request); // not cached (e.g. a newly added clip): go to the network as-is
    return fetch(e.request).then(function (resp) { // cache recorded clips as they are first played
      if (resp.ok && /\/audio\//.test(e.request.url)) { var cp = resp.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, cp); }); }
      return resp;
    });
  }));
});
