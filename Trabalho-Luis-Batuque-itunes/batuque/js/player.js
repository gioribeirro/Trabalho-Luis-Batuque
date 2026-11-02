/* Batuque — player fixo, fila, prévia de 30 s (HTML5 Audio real, sem simulação de tempo) */
(function (B) {
  var PREVIEW = 30;
  function secs(d) { if (!d || d === "—") return 30; var p = d.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  var st = B.store.state;
  var queue = (st.queue || B.data.defaultQueue.map(function (q) { return B.data.track(q[0], q[1]).id; }));
  function T(id) { return B.data.getTrackById(id); }
  // Ids externos (iTunes) ainda não restaurados após o carregamento são mantidos; o app os restaura por lookup.
  queue = queue.filter(function (id) { return !!T(id) || B.data.isExternal(id); });

  /* Um único elemento de áudio, criado em JS, sem pré-carregamento. A fonte é sempre a previewUrl da Apple. */
  var audio = new Audio();
  audio.preload = "none";

  var token = 0;            // identifica a carga vigente: respostas antigas são ignoradas
  var srcFor = null;        // id da faixa cujo áudio está carregado no elemento
  var resolving = false;    // buscando/validando a URL de prévia
  var finishing = false;
  var limitTimer = null;

  /* Limite de reprodução: no máximo 30 s (ou o fim natural da prévia, se menor) */
  function limit() { var d = audio.duration; return (isFinite(d) && d > 0) ? Math.min(PREVIEW, d) : PREVIEW; }
  function loadedNow() { return srcFor !== null && P.track && srcFor === P.track.id; }
  function clearLimit() { clearTimeout(limitTimer); limitTimer = null; }
  function armLimit() {
    clearLimit();
    if (audio.paused || !loadedNow()) return;
    limitTimer = setTimeout(checkLimit, Math.max(0, (limit() - audio.currentTime) * 1000) + 5);
  }
  function checkLimit() {
    if (!loadedNow() || audio.paused) return;
    if (audio.currentTime >= limit() - 0.02) finish(); else armLimit();
  }
  function setState(status, notice) { P.status = status; P.notice = notice || ""; }

  function tryPlay(my) {
    var pr = audio.play();
    if (pr && pr.catch) pr.catch(function (e) {
      if (my !== undefined && my !== token) return;
      if (e && e.name === "AbortError") return;           // interrompido por outra carga/pausa
      P.playing = false;
      if (e && e.name === "NotAllowedError") { setState("ready", "Toque em play para iniciar"); P.emit(); return; }
      failure();
    });
  }
  function failure() {
    resolving = false;
    P.playing = false; clearLimit();
    // zera o elemento: depois de um erro ele não deve ficar "tocando" nem com a fonte quebrada (play tenta de novo via load)
    audio.pause(); audio.removeAttribute("src"); audio.load(); srcFor = null;
    setState("error", "Não foi possível reproduzir a prévia");
    if (B.ui) B.ui.toast("Não foi possível reproduzir “" + P.track.titulo + "”", "soft");
    P.emit();
    if (P._auto) advance(true);
  }
  function unavailable() {
    resolving = false;
    P.playing = false;
    setState("unavailable", "Prévia indisponível");
    if (B.ui) B.ui.toast("Prévia indisponível para “" + P.track.titulo + "”", "soft");
    P.emit();
    if (P._auto) advance(true);
  }
  function startAudio(my, t, url) {
    resolving = false;
    audio.src = url; srcFor = t.id; audio.volume = P.volume;
    setState("loading");
    P.emit();
    tryPlay(my);
  }

  /* Fim da prévia (limite de 30 s ou fim natural) */
  function finish() {
    if (finishing) return;
    finishing = true; clearLimit();
    audio.pause();
    P.time = Math.min(audio.currentTime, limit());
    if (B.ui) B.ui.toast("Prévia de 30 s encerrada", "soft");
    if (st.listening.autoplay || P.repeat) P.next(true);
    else { P.playing = false; P.time = limit(); P.emit(); }
  }
  function restart() {
    if (!loadedNow()) { P.load(P.track); return; }
    finishing = false; audio.currentTime = 0; P.time = 0; tryPlay(); P.emit();
  }
  function stopAtEnd() {
    clearLimit(); audio.pause();
    if (loadedNow()) { try { audio.currentTime = 0; } catch (e) {} }
    P.playing = false; P.time = 0; P.emit();
  }
  function advance(auto) {
    var idxs = [];
    P.queue.forEach(function (id, i) { if (T(id)) idxs.push(i); });   // ignora ids externos ainda não restaurados
    if (!idxs.length) { stopAtEnd(); return; }
    var id = P.queue.splice(idxs[P.shuffle ? Math.floor(Math.random() * idxs.length) : 0], 1)[0];
    P.history.push(P.track.id); P.saveQueue();
    P.load(T(id), { auto: !!auto });
  }
  function firstPlayable(album) {
    var l = album.faixas || [], i;
    if (!album.externo) return l[0];
    for (i = 0; i < l.length; i++) if (l[i].previewUrl) return l[i];
    return l[0];
  }

  /* Histórico de escuta: evento criado após 10 s realmente ouvidos; só IDs e números (nunca URLs de áudio) */
  var ls = null, MAXPLAYS = 500;
  var albumArtist = {};
  B.data.artists.forEach(function (a) { a.albums.forEach(function (id) { if (!albumArtist[id]) albumArtist[id] = a.id; }); });
  function listenReset() { flushPlays(); ls = null; }
  function flushPlays() { if (ls && ls.ev) B.store.save(); }
  function listenTick() {
    if (!st.listening.historico || !P.track || !loadedNow() || audio.paused) { if (ls) ls.last = null; return; }
    if (!ls || ls.id !== P.track.id) ls = { id: P.track.id, acc: 0, last: null, ev: null };
    var cur = audio.currentTime, d = ls.last == null ? 0 : cur - ls.last;
    ls.last = cur;
    if (d > 0 && d < 2) ls.acc += d;
    if (!ls.ev && ls.acc >= 10) {
      var t = P.track;
      ls.ev = { t: Date.now(), trackId: t.id, albumId: t.albumId, artistId: t.artistId || albumArtist[t.albumId] || null, seg: 10 };
      st.plays.push(ls.ev);
      while (st.plays.length > MAXPLAYS) st.plays.shift();
    }
    if (ls.ev) ls.ev.seg = Math.round(ls.acc);
  }

  var P = {
    PREVIEW: PREVIEW,
    fmt: fmt, secs: secs,
    track: B.data.track("trauma", "Hurricane"),   // faixa exibida ao abrir; NÃO toca sozinha
    time: 0, start: 0, playing: false,
    status: "idle",                                // idle | loading | ready | unavailable | error
    notice: "",
    volume: st.volume, shuffle: false, repeat: false,
    queue: queue, history: [],
    audio: audio,
    listeners: [],
    on: function (fn) { P.listeners.push(fn); },
    emit: function () { P.listeners.forEach(function (fn) { fn(P); }); },
    duration: limit,
    end: limit,
    saveQueue: function () { B.store.set("queue", P.queue); },

    play: function (x) {
      if (!x) { if (!P.playing) P.toggle(); return; }
      var album = typeof x === "string" ? B.data.album(x) : (x.faixas ? x : null);
      var t;
      if (album) {
        if (album.externo && !album.faixasCarregadas) {
          if (B.ui) B.ui.toast("Carregando faixas…", "soft");
          B.Itunes.loadAlbum(album.id).then(function (a) { P.play(a); }, function (e) { if (B.ui) B.ui.toast(B.Itunes.errorMessage(e), "soft"); });
          return;
        }
        t = firstPlayable(album);
        if (!t) { if (B.ui) B.ui.toast("A Apple não retornou faixas para este álbum", "soft"); return; }
        var rest = album.faixas.slice(album.faixas.indexOf(t) + 1).map(function (f) { return f.id; });
        P.queue = rest.concat(P.queue.filter(function (id) { return rest.indexOf(id) < 0; }));
        P.saveQueue();
      } else t = x;
      if (P.track) P.history.push(P.track.id);
      P.load(t);
    },
    load: function (t, opts) {
      var my = ++token;
      listenReset();
      P._auto = !!(opts && opts.auto);
      P.track = t; P.time = 0; P.start = 0; P.playing = false;
      finishing = false; clearLimit();
      audio.pause();
      audio.removeAttribute("src"); audio.load(); srcFor = null;
      resolving = true;
      setState("loading");
      P.emit();
      var url = B.Itunes.cachedPreview(t);
      if (url === null) { unavailable(); return; }
      if (url) { startAudio(my, t, url); return; }
      B.Itunes.previewFor(t).then(function (u) {
        if (my !== token) return;
        if (u) startAudio(my, t, u); else unavailable();
      }, function (e) {
        if (my !== token) return;
        resolving = false; P.playing = false;
        setState("error", B.Itunes.errorMessage(e));
        if (B.ui) B.ui.toast(B.Itunes.errorMessage(e), "soft");
        P.emit();
        if (P._auto) advance(true);
      });
    },
    toggle: function () {
      if (resolving) return;
      if (!loadedNow() || P.status === "unavailable" || P.status === "error") { P.load(P.track); return; }
      if (audio.paused) {
        if (audio.currentTime >= limit() - 0.05) { audio.currentTime = 0; P.time = 0; }
        finishing = false;
        tryPlay();
      } else audio.pause();
    },
    next: function (auto) {
      if (P.repeat && auto) { restart(); return; }
      advance(auto);
    },
    prev: function () {
      var t = P.history.length ? T(P.history[P.history.length - 1]) : null;
      if (P.time - P.start > 3 || !t) {
        if (loadedNow()) audio.currentTime = 0;
        P.time = 0; P.emit(); return;
      }
      P.history.pop();
      P.queue.unshift(P.track.id); P.saveQueue();
      P.load(t);
    },
    seekRatio: function (r) {
      // A barra representa a prévia (até 30 s). Sem áudio carregado não há o que buscar: nada é simulado.
      if (!loadedNow() || !isFinite(audio.duration)) return;
      var t = Math.max(0, Math.min(limit() - 0.05, r * limit()));
      audio.currentTime = t; P.time = t;
      armLimit(); P.emit();
    },
    setVolume: function (v) { P.volume = v; audio.volume = v; B.store.set("volume", v); P.emit(); },
    isFav: function () { return st.favTracks.indexOf(P.track.id) >= 0; },
    toggleFav: function () { B.store.toggleIn("favTracks", P.track.id); P.emit(); },
    playTrackFromQueue: function (id) {
      var t = T(id); if (!t) return;
      P.queue = P.queue.filter(function (q) { return q !== id; }); P.saveQueue();
      P.history.push(P.track.id); P.load(t);
    },
    T: T
  };

  /* Estado do player = estado do áudio real */
  audio.addEventListener("loadedmetadata", function () { if (loadedNow()) P.emit(); });
  audio.addEventListener("play", function () { if (!loadedNow()) return; P.playing = true; armLimit(); P.emit(); });
  audio.addEventListener("playing", function () { if (!loadedNow()) return; P.playing = true; setState("ready"); armLimit(); P.emit(); });
  audio.addEventListener("waiting", function () { if (!loadedNow() || audio.paused) return; setState("loading"); P.emit(); });
  audio.addEventListener("pause", function () { flushPlays(); if (ls) ls.last = null; if (!loadedNow()) return; P.playing = false; clearLimit(); P.time = audio.currentTime; P.emit(); });
  audio.addEventListener("timeupdate", function () {
    if (!loadedNow()) return;
    P.time = audio.currentTime; listenTick();
    if (!audio.paused && P.time >= limit() - 0.02) { finish(); return; }
    armLimit(); P.emitTick();
  });
  audio.addEventListener("ended", function () { if (loadedNow()) finish(); });
  audio.addEventListener("error", function () { if (!audio.getAttribute("src") || !loadedNow()) return; failure(); });

  /* Apenas lê o tempo REAL do áudio para suavizar a barra (não avança nada por conta própria) */
  function frame() {
    if (loadedNow() && !audio.paused) { P.time = audio.currentTime; P.emitTick(); }
    requestAnimationFrame(frame);
  }
  var lastEmit = 0;
  P.emitTick = function () { var n = performance.now(); if (n - lastEmit > 120) { lastEmit = n; P.emit(); } };
  requestAnimationFrame(frame);
  B.Player = P;
})(window.Batuque);
