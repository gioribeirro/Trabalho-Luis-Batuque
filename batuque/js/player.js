/* Batuque — player fixo, fila, prévia de 30 s */
(function (B) {
  var PREVIEW = 30;
  function secs(d) { if (!d || d === "—") return 30; var p = d.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  var st = B.store.state;
  var queue = (st.queue || B.data.defaultQueue.map(function (q) { return B.data.track(q[0], q[1]).id; }));
  function T(id) { return B.data.allTracks().filter(function (t) { return t.id === id; })[0]; }
  queue = queue.filter(function (id) { return !!T(id); });

  var P = {
    PREVIEW: PREVIEW,
    fmt: fmt, secs: secs,
    track: B.data.track("trauma", "Hurricane"),
    time: 102, start: 102, playing: true,
    volume: st.volume, shuffle: false, repeat: false,
    queue: queue, history: [],
    audio: null,
    listeners: [],
    on: function (fn) { P.listeners.push(fn); },
    emit: function () { P.listeners.forEach(function (fn) { fn(P); }); },
    duration: function () { return secs(P.track.dur); },
    end: function () { return Math.min(P.duration(), P.start + PREVIEW); },
    saveQueue: function () { B.store.set("queue", P.queue); },

    play: function (x) {
      if (!x) { P.playing = true; P.emit(); return; }
      var album = typeof x === "string" ? B.data.album(x) : (x.faixas ? x : null);
      var t;
      if (album) {
        t = album.faixas[0];
        var rest = album.faixas.slice(1).map(function (f) { return f.id; });
        P.queue = rest.concat(P.queue.filter(function (id) { return rest.indexOf(id) < 0; }));
        P.saveQueue();
      } else t = x;
      if (P.track) P.history.push(P.track.id);
      P.load(t);
    },
    load: function (t) {
      P.track = t; P.time = 0; P.start = 0; P.playing = true;
      if (P.audio) { P.audio.pause(); P.audio = null; }
      if (t.preview) { P.audio = new Audio(t.preview); P.audio.volume = P.volume; P.audio.play().catch(function () {}); }
      P.emit();
    },
    toggle: function () { P.playing = !P.playing; if (P.audio) P.playing ? P.audio.play() : P.audio.pause(); P.emit(); },
    next: function (auto) {
      if (P.repeat && auto) { P.time = P.start; P.emit(); return; }
      if (!P.queue.length) { P.playing = false; P.time = P.start; P.emit(); return; }
      var i = P.shuffle ? Math.floor(Math.random() * P.queue.length) : 0;
      var id = P.queue.splice(i, 1)[0];
      P.history.push(P.track.id); P.saveQueue();
      P.load(T(id));
    },
    prev: function () {
      if (P.time - P.start > 3 || !P.history.length) { P.time = P.start; P.emit(); return; }
      P.queue.unshift(P.track.id); P.saveQueue();
      P.load(T(P.history.pop()));
    },
    seekRatio: function (r) {
      // A barra representa a faixa inteira, mas a reprodução é limitada à janela de prévia
      var d = P.duration(), t = r * d;
      if (t < P.start || t > P.end()) { P.start = Math.min(t, Math.max(0, d - PREVIEW)); }
      P.time = t; if (P.audio) P.audio.currentTime = t; P.emit();
    },
    setVolume: function (v) { P.volume = v; if (P.audio) P.audio.volume = v; B.store.set("volume", v); P.emit(); },
    isFav: function () { return st.favTracks.indexOf(P.track.id) >= 0; },
    toggleFav: function () { B.store.toggleIn("favTracks", P.track.id); P.emit(); },
    playTrackFromQueue: function (id) {
      P.queue = P.queue.filter(function (q) { return q !== id; }); P.saveQueue();
      P.history.push(P.track.id); P.load(T(id));
    },
    T: T
  };

  var last = performance.now();
  function tick(now) {
    var dt = (now - last) / 1000; last = now;
    if (P.playing) {
      P.time += dt;
      if (P.time >= P.end()) {
        if (B.ui) B.ui.toast("Prévia de 30 s encerrada", "soft");
        if (st.listening.autoplay || P.repeat) P.next(true);
        else { P.playing = false; P.time = P.end(); P.emit(); }
      } else P.emitTick();
    }
    requestAnimationFrame(tick);
  }
  var lastEmit = 0;
  P.emitTick = function () { var n = performance.now(); if (n - lastEmit > 120) { lastEmit = n; P.emit(); } };
  requestAnimationFrame(tick);
  B.Player = P;
})(window.Batuque);
