/* Batuque — integração com a Apple iTunes Search API
   Responsabilidade única: comunicação com a API (JSONP), controle de frequência,
   cache em memória, normalização para o formato do Batuque e registro no catálogo externo.
   Nenhum áudio é baixado, armazenado ou persistido; as URLs de prévia ficam só em memória. */
(function (B) {
  "use strict";

  var BASE = "https://itunes.apple.com/";
  var COUNTRY = "br";
  var TIMEOUT = 10000;           // ms por consulta
  var TTL = 10 * 60 * 1000;      // cache de metadados em memória
  var MAX_CALLS = 18;            // a Apple documenta ~20 chamadas/min: ficamos abaixo
  var WINDOW = 60 * 1000;
  var MAX_PARALLEL = 2;          // nunca várias consultas simultâneas por tecla
  var PREFIX = { album: "itunes-album:", track: "itunes-track:", artist: "itunes-artist:" };
  var BADGE_SRC = "assets/img/apple/listen-on-apple-music.svg"; // badge OFICIAL: ver assets/img/apple/LEIA-ME.txt

  var D = B.data;

  /* ------------------------------------------------------------ erros */
  var MSG = {
    network: "Sem conexão com a Apple.",
    timeout: "A Apple demorou demais para responder.",
    badresponse: "Resposta inesperada da Apple.",
    notfound: "Item não encontrado na Apple.",
    cancelled: "Consulta substituída por outra mais recente."
  };
  function err(code) { var e = new Error(MSG[code] || code); e.code = code; return e; }
  function errorMessage(e) { return (e && MSG[e.code]) || MSG.network; }

  /* ------------------------------------------------------------ JSONP */
  var seq = 0;
  function jsonp(url) {
    return new Promise(function (resolve, reject) {
      var cb = "__batuqueItunes_" + (++seq) + "_" + Date.now().toString(36);
      var s = document.createElement("script"), done = false, timer;
      function drop() { try { delete window[cb]; } catch (e) { window[cb] = undefined; } }
      function cleanup(late) {
        clearTimeout(timer);
        s.onload = s.onerror = null;
        if (s.parentNode) s.parentNode.removeChild(s);
        if (late) window[cb] = function () { drop(); }; // resposta tardia (pós-timeout) é descartada sem erro
        else drop();
      }
      window[cb] = function (data) { if (done) return; done = true; cleanup(false); resolve(data); };
      s.onerror = function () { if (done) return; done = true; cleanup(false); reject(err("network")); };
      s.onload = function () { if (done) return; done = true; cleanup(false); reject(err("badresponse")); };
      timer = setTimeout(function () { if (done) return; done = true; cleanup(true); reject(err("timeout")); }, TIMEOUT);
      s.async = true;
      s.src = url + (url.indexOf("?") < 0 ? "?" : "&") + "callback=" + cb;
      document.head.appendChild(s);
    });
  }

  /* ------------------------------------------------------------ fila com limite de frequência, cache e deduplicação */
  var cache = {}, inflight = {}, queue = [], active = 0, calls = [], pumpTimer = null;

  function qs(params) {
    return Object.keys(params).sort().map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); }).join("&");
  }
  function cancelQueued(group) {
    queue = queue.filter(function (j) { if (j.group !== group) return true; j.reject(err("cancelled")); return false; });
  }
  function start(job) {
    active++; calls.push(Date.now());
    job.run().then(function (data) {
      active--;
      if (!data || !Array.isArray(data.results)) job.reject(err("badresponse"));
      else { cache[job.key] = { t: Date.now(), data: data.results }; job.resolve(data.results); }
      pump();
    }, function (e) { active--; job.reject(e); pump(); });
  }
  function pump() {
    if (pumpTimer) return;
    while (queue.length && active < MAX_PARALLEL) {
      var now = Date.now();
      while (calls.length && now - calls[0] >= WINDOW) calls.shift();
      if (calls.length >= MAX_CALLS) {
        pumpTimer = setTimeout(function () { pumpTimer = null; pump(); }, calls[0] + WINDOW - now + 25);
        return;
      }
      start(queue.shift());
    }
  }
  /* group "search": só a consulta mais recente interessa; as antigas ainda na fila são descartadas */
  function request(path, params, group) {
    params = params || {};
    params.country = COUNTRY;
    var key = path + "?" + qs(params);
    var hit = cache[key];
    if (hit && Date.now() - hit.t < TTL) return Promise.resolve(hit.data);
    if (inflight[key]) return inflight[key];
    var p = new Promise(function (resolve, reject) {
      if (group === "search") cancelQueued("search");
      queue.push({ key: key, group: group, resolve: resolve, reject: reject, run: function () { return jsonp(BASE + key); } });
      pump();
    });
    var clear = function () { delete inflight[key]; };
    p.then(clear, clear);
    inflight[key] = p;
    return p;
  }

  /* ------------------------------------------------------------ utilidades de normalização */
  function fmtDur(ms) {
    var s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }
  function yearOf(d) { var y = parseInt(String(d || "").slice(0, 4), 10); return y > 1000 ? y : null; }
  function hdArt(url) {
    if (!url) return "";
    var u = url.replace(/\/\d+x\d+([a-z]{0,2})\.(jpg|jpeg|png|webp)$/i, "/600x600$1.$2");
    return u === url ? "" : u;
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function fallbackColor(id) { var p = D.accents; return p[hash(id) % p.length].hex; }
  function initials(name) {
    var w = String(name || "?").replace(/[^A-Za-z0-9À-ÿ ]/g, " ").split(/\s+/).filter(Boolean);
    return ((w[0] || "?").charAt(0) + (w.length > 1 ? w[1].charAt(0) : "")).toUpperCase();
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }
  function isExt(id, kind) { return typeof id === "string" && id.indexOf(PREFIX[kind]) === 0; }
  function rawId(id) { return String(id).replace(/^itunes-[a-z]+:/, ""); }

  function albumFields(r) {
    var raw = r.collectionName || "", m = raw.match(/\s+-\s+(Single|EP)$/i), tipo = "Álbum";
    if (m) tipo = m[1].toLowerCase() === "ep" ? "EP" : "Single";
    else if (/soundtrack|trilha/i.test(r.primaryGenreName || "")) tipo = "Trilha sonora";
    var id = PREFIX.album + r.collectionId;
    return {
      id: id, externalId: r.collectionId, externo: true,
      titulo: m ? raw.slice(0, m.index) : raw, collectionName: raw,
      artista: r.collectionArtistName || r.artistName || "",
      artistId: r.artistId ? PREFIX.artist + r.artistId : null,
      tipo: tipo, ano: yearOf(r.releaseDate), releaseDate: r.releaseDate || null,
      generos: r.primaryGenreName || "", nFaixas: r.trackCount || 0,
      capa: safeUrl(r.artworkUrl100 || r.artworkUrl60), capaHD: hdArt(safeUrl(r.artworkUrl100)),
      corDestaque: fallbackColor(id), collectionViewUrl: safeUrl(r.collectionViewUrl),
      faixas: []
    };
  }
  function putAlbum(fields) {
    var a = D.registerAlbum(fields);
    if (!a.faixas) a.faixas = [];
    if (a.faixasCarregadas === undefined) a.faixasCarregadas = false;
    return a;
  }
  function normTrack(r) {
    var ms = r.trackTimeMillis;
    return {
      id: PREFIX.track + r.trackId, externalId: r.trackId, externo: true,
      albumId: PREFIX.album + r.collectionId, titulo: r.trackName || "",
      artista: r.artistName || "", artistId: r.artistId ? PREFIX.artist + r.artistId : null,
      dur: ms ? fmtDur(ms) : "—", durationSeconds: ms ? Math.round(ms / 1000) : null,
      previewUrl: safeUrl(r.previewUrl), trackViewUrl: safeUrl(r.trackViewUrl),
      n: r.trackNumber || 0, trackNumber: r.trackNumber || 0, discNumber: r.discNumber || 1
    };
  }
  function normArtist(r) {
    var nome = r.artistName || "", id = PREFIX.artist + r.artistId, gen = r.primaryGenreName || "";
    var comp = /soundtrack|trilha|score/i.test(gen);
    return {
      id: id, externalId: r.artistId, externo: true, nome: nome, ini: initials(nome),
      desc: gen ? gen + " · Apple" : "Artista na Apple", tipo: "Apple",
      rotulo: comp ? "COMPOSITOR" : "ARTISTA", meta: gen || "Artista na Apple", generos: gen || "Artista na Apple", cor: fallbackColor(id),
      artistViewUrl: safeUrl(r.artistViewUrl || r.artistLinkUrl), albums: []
    };
  }
  var isSong = function (r) { return r && r.wrapperType === "track" && r.kind === "song" && r.trackId && r.collectionId; };
  var isColl = function (r) { return r && r.wrapperType === "collection" && r.collectionId; };
  var isArt = function (r) { return r && r.wrapperType === "artist" && r.artistId; };

  var listeners = [];
  function emitChange() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  /* Converte a resposta bruta, registra no catálogo externo e devolve instâncias canônicas */
  function ingest(results) {
    var out = { tracks: [], albums: [], artists: [] }, sa = {}, sr = {};
    function addAlbum(a) { if (!sa[a.id]) { sa[a.id] = 1; out.albums.push(a); } }
    function addArtist(a) { if (!sr[a.id]) { sr[a.id] = 1; out.artists.push(a); } }
    results.forEach(function (r) {
      if (isSong(r)) {
        addAlbum(putAlbum(albumFields(r)));
        out.tracks.push(D.registerTrack(normTrack(r)));
        if (r.artistId) addArtist(D.registerArtist(normArtist(r)));
      } else if (isColl(r)) {
        addAlbum(putAlbum(albumFields(r)));
        if (r.artistId) addArtist(D.registerArtist(normArtist(r)));
      } else if (isArt(r)) {
        addArtist(D.registerArtist(normArtist(r)));
      }
    });
    return out;
  }

  /* ------------------------------------------------------------ pesquisa */
  function search(entity, term, limit, group) {
    return request("search", { term: term, media: "music", entity: entity, limit: limit || 25 }, group || "search").then(ingest);
  }
  /* Pesquisa geral: UMA consulta de músicas; álbuns e artistas são derivados dos resultados */
  function searchSongs(term, limit) { return search("song", term, limit || 30); }
  function searchAlbums(term, limit) { return search("album", term, limit || 25); }
  function searchArtists(term, limit) { return search("musicArtist", term, limit || 20); }

  /* ------------------------------------------------------------ lookup */
  var loadingAlbums = {};
  function loadAlbum(id) {
    if (!isExt(id, "album")) return Promise.resolve(D.album(id));
    var cur = D.album(id);
    if (cur && cur.faixasCarregadas) return Promise.resolve(cur);
    if (loadingAlbums[id]) return loadingAlbums[id];
    var cid = rawId(id);
    var p = request("lookup", { id: cid, entity: "song", limit: 200 }, "album").then(function (res) {
      var coll = res.filter(isColl)[0];
      var songs = res.filter(function (r) { return isSong(r) && String(r.collectionId) === cid; });
      if (!coll && !songs.length && !D.album(id)) throw err("notfound");
      var alb = coll ? putAlbum(albumFields(coll)) : (D.album(id) || putAlbum(albumFields(songs[0])));
      songs.sort(function (a, b) { return ((a.discNumber || 1) - (b.discNumber || 1)) || ((a.trackNumber || 0) - (b.trackNumber || 0)); });
      alb.faixas = songs.map(function (r) { return D.registerTrack(normTrack(r)); });
      alb.faixasCarregadas = true;
      if (!alb.nFaixas) alb.nFaixas = alb.faixas.length;
      return alb;
    });
    var clear = function () { delete loadingAlbums[id]; };
    p.then(clear, clear);
    loadingAlbums[id] = p;
    return p;
  }

  function discography(artistId) {
    var aid = rawId(artistId);
    return request("lookup", { id: aid, entity: "album", limit: 200 }, "artist").then(function (res) {
      var arts = res.filter(isArt), colls = res.filter(isColl);
      if (!arts.length && !colls.length) throw err("notfound");
      var artist = arts.length ? D.registerArtist(normArtist(arts[0])) : D.getArtistById(artistId);
      var albums = colls.map(function (r) { return putAlbum(albumFields(r)); });
      albums.sort(function (a, b) { return String(b.releaseDate || "").localeCompare(String(a.releaseDate || "")); });
      if (artist) artist.albums = albums.map(function (a) { return a.id; });
      return { artist: artist, albums: albums };
    });
  }

  /* ------------------------------------------------------------ artistas (v2) */
  function normName(n) { return norm(n); }
  /* Resolve o artista curado na Apple: SOMENTE nome normalizado idêntico (nada de "parecido"). Guarda só o ID. */
  function resolveArtist(nome, curadoId) {
    var cache = B.store.state.artistIdCache || {};
    if (curadoId && cache[curadoId]) return Promise.resolve(cache[curadoId]);
    return request("search", { term: nome, media: "music", entity: "musicArtist", limit: 8 }, "artist").then(function (res) {
      var out = ingest(res), want = normName(nome), hit = null;
      out.artists.forEach(function (a) { if (!hit && normName(a.nome) === want) hit = a; });
      if (!hit) return null;
      if (curadoId) { B.store.state.artistIdCache[curadoId] = hit.id; B.store.save(); }
      return hit.id;
    });
  }
  function lookupArtist(id) {
    var cur = D.getArtistById(id);
    if (cur && cur.artistViewUrl) return Promise.resolve(cur);
    return request("lookup", { id: rawId(id) }, "artist").then(function (res) {
      var out = ingest(res.filter(isArt));
      if (!out.artists.length) throw err("notfound");
      return out.artists[0];
    });
  }
  /* UMA consulta de músicas; mantém só faixas do artista (id igual ou nome por palavra inteira), sem títulos repetidos; 6 primeiras. */
  function topSongs(artistId, nome) {
    var aid = artistId ? rawId(artistId) : null, want = normName(nome);
    return request("search", { term: nome, media: "music", entity: "song", limit: 30 }, "artist").then(function (res) {
      var seen = {}, keep = [];
      res.forEach(function (r) {
        if (!isSong(r) || keep.length >= 6) return;
        var ok = aid && r.artistId ? String(r.artistId) === aid : wholeWord(normName(r.artistName), want);
        var k = normName(stripFeat(r.trackName));
        if (!ok || seen[k]) return;
        seen[k] = 1; keep.push(r);
      });
      return ingest(keep).tracks;
    });
  }
  /* Cor predominante da capa (canvas). Se o navegador bloquear por CORS ou falhar, devolve null e o fallback é mantido. */
  var colorCache = {};
  function coverColor(album) {
    if (!album || !album.capa) return Promise.resolve(null);
    if (colorCache[album.id] !== undefined) return Promise.resolve(colorCache[album.id]);
    return new Promise(function (resolve) {
      var img = new Image(), done = false;
      function fin(v) { if (done) return; done = true; colorCache[album.id] = v; resolve(v); }
      img.crossOrigin = "anonymous";
      img.onload = function () {
        try {
          var cv = document.createElement("canvas"), n = 24; cv.width = cv.height = n;
          var cx = cv.getContext("2d"); cx.drawImage(img, 0, 0, n, n);
          var d = cx.getImageData(0, 0, n, n).data, bins = {}, best = null, bn = 0;
          for (var i = 0; i < d.length; i += 4) {
            var r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
            if (mx - mn < 28 || mx < 50 || mn > 225) continue;          // ignora cinzas, quase-preto e quase-branco
            var k = (r >> 5) + "," + (g >> 5) + "," + (b >> 5), o = bins[k] || (bins[k] = { n: 0, r: 0, g: 0, b: 0 });
            o.n++; o.r += r; o.g += g; o.b += b;
            if (o.n > bn) { bn = o.n; best = o; }
          }
          if (!best) return fin(null);
          var h = function (v) { return ("0" + Math.round(v / best.n).toString(16)).slice(-2); };
          fin("#" + h(best.r) + h(best.g) + h(best.b));
        } catch (e) { fin(null); }
      };
      img.onerror = function () { fin(null); };
      setTimeout(function () { fin(null); }, 6000);
      img.src = album.capaHD || album.capa;
    });
  }

  function lookupTrack(id) {
    var cur = D.getTrackById(id);
    if (cur) return Promise.resolve(cur);
    return request("lookup", { id: rawId(id) }, "track").then(function (res) {
      var out = ingest(res);
      if (!out.tracks.length) throw err("notfound");
      return out.tracks[0];
    });
  }

  /* Restaura, após recarregar a página, os itens externos referenciados pelos dados do usuário
     (somente identificadores ficam no localStorage; capas, metadados e prévias vêm de novo da Apple). */
  function missingIds() {
    var st = B.store.state, A = {}, T = {};
    function a(id) { if (isExt(id, "album") && !D.album(id)) A[id] = 1; }
    function t(id) { if (isExt(id, "track") && !D.getTrackById(id)) T[id] = 1; }
    (st.saved || []).forEach(a); (st.favAlbums || []).forEach(a);
    if (st.draft) a(st.draft.albumId);
    (st.queue || []).forEach(t); (st.playlistTracks || []).forEach(t);
    Object.keys(st.replay || {}).forEach(function (k) { a(k); t(st.replay[k]); });
    (st.reviews || []).forEach(function (r) { a(r.albumId); });
    return { albums: Object.keys(A), tracks: Object.keys(T) };
  }
  function lookupMany(ids) {
    var chunks = [], i;
    for (i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
    return chunks.reduce(function (chain, ch) {
      return chain.then(function () {
        return request("lookup", { id: ch.map(rawId).join(",") }, "hydrate").then(ingest);
      });
    }, Promise.resolve());
  }
  var hydrating = null;
  function hydrate() {
    if (hydrating) return hydrating;
    var m = missingIds();
    if (!m.albums.length && !m.tracks.length) return Promise.resolve(0);
    hydrating = lookupMany(m.albums).then(function () { return lookupMany(m.tracks.filter(function (id) { return !D.getTrackById(id); })); })
      .then(function () { hydrating = null; emitChange(); return m.albums.length + m.tracks.length; },
        function (e) { hydrating = null; throw e; });
    return hydrating;
  }

  /* ------------------------------------------------------------ prévias */
  function norm(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[’'`]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function stripFeat(s) {
    return String(s || "").replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with|com)\s[^\)\]]*[\)\]]/ig, "")
      .replace(/\s+(?:feat\.?|ft\.?|featuring)\s.*$/i, "").trim();
  }
  function artistTokens() {
    var out = [];
    Array.prototype.slice.call(arguments).forEach(function (s) {
      String(s || "").split(/\s*(?:,|&|\/|\bfeat\.?\s|\bft\.?\s|\bfeaturing\b|\sx\s|\sand\s)\s*/i).forEach(function (p) {
        p = norm(p); if (p.length > 1 && out.indexOf(p) < 0) out.push(p);
      });
    });
    return out;
  }
  function wholeWord(hay, needle) { return (" " + hay + " ").indexOf(" " + needle + " ") >= 0; }

  /* Correspondência RIGOROSA: título idêntico (após normalização, ignorando apenas “feat.”) E artista coincidente.
     Nome parecido não basta. Preferência por candidato do mesmo álbum. */
  function strictMatch(local, album, cands) {
    var title = norm(local.titulo), titleNF = norm(stripFeat(local.titulo));
    var toks = artistTokens(local.artista, album && album.artista);
    var albumName = norm(album && album.titulo), best = null, bestScore = -1;
    cands.forEach(function (c) {
      if (!c || !c.previewUrl || c.wrapperType !== "track" || c.kind !== "song") return;
      var ct = norm(c.trackName), ctNF = norm(stripFeat(c.trackName));
      if (!(ct === title || ctNF === titleNF)) return;
      var who = norm((c.artistName || "") + " " + (c.collectionArtistName || ""));
      if (!toks.some(function (t) { return wholeWord(who, t); })) return;
      var score = 1;
      if (albumName && norm(String(c.collectionName || "").replace(/\s+-\s+(Single|EP)$/i, "")) === albumName) score += 2;
      if (score > bestScore) { best = c; bestScore = score; }
    });
    return best;
  }

  var localMatch = {}, localPending = {};
  function resolveLocal(t) {
    if (localMatch[t.id] !== undefined) return Promise.resolve(localMatch[t.id]);
    if (localPending[t.id]) return localPending[t.id];
    if (/^faixa \d+$/i.test(norm(t.titulo))) { localMatch[t.id] = null; return Promise.resolve(null); } // título genérico: não há como casar com segurança
    var album = D.album(t.albumId);
    var term = (stripFeat(String(t.artista || (album && album.artista) || "").split(/,|&|\bfeat\.?/i)[0]) + " " + stripFeat(t.titulo)).trim();
    var p = request("search", { term: term, media: "music", entity: "song", limit: 15 }, "preview").then(function (res) {
      var m = strictMatch(t, album, res);
      localMatch[t.id] = (m && safeUrl(m.previewUrl)) ? { previewUrl: m.previewUrl, trackViewUrl: safeUrl(m.trackViewUrl), collectionViewUrl: safeUrl(m.collectionViewUrl) } : null;
      return localMatch[t.id];
    });
    var clear = function () { delete localPending[t.id]; };
    p.then(clear, clear);
    localPending[t.id] = p;
    return p;
  }
  /* Resolve a URL de prévia (ou null). Rejeita somente em erro de comunicação. */
  function previewFor(t) {
    if (!t) return Promise.resolve(null);
    if (t.externo) return Promise.resolve(t.previewUrl || null);
    return resolveLocal(t).then(function (m) { return m ? m.previewUrl : null; });
  }
  /* Consulta síncrona: string = prévia conhecida; null = sabidamente indisponível; undefined = ainda não resolvida */
  function cachedPreview(t) {
    if (!t) return null;
    if (t.externo) return t.previewUrl || null;
    var m = localMatch[t.id];
    return m === undefined ? undefined : (m ? m.previewUrl : null);
  }
  /* Link oficial (loja) do conteúdo promocional que está tocando */
  function linkFor(t) {
    if (!t) return "";
    if (t.externo) return t.trackViewUrl || (D.album(t.albumId) || {}).collectionViewUrl || "";
    var m = localMatch[t.id];
    return m ? (m.trackViewUrl || m.collectionViewUrl || "") : "";
  }

  /* ------------------------------------------------------------ atribuição (condições de uso da Apple) */
  /* o = { text, badge } — por padrão apenas o texto. O badge é o arquivo oficial da Apple (ver assets/img/apple/LEIA-ME.txt);
     se o arquivo ainda não estiver no repositório, o elemento é removido sem quebrar a interface. */
  function creditHtml(url, o) {
    o = o || { text: true };
    var e = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var out = "";
    if (o.text) out += url
      ? '<a class="apple-credit__txt" href="' + e(url) + '" target="_blank" rel="noopener noreferrer">Provided courtesy of iTunes</a>'
      : '<span class="apple-credit__txt">Provided courtesy of iTunes</span>';
    if (o.badge && url) out += '<a class="apple-credit__badge" href="' + e(url) + '" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Apple Music"><img src="' + BADGE_SRC + '" alt="Ouvir no Apple Music" height="24" onerror="this.parentNode.remove()"></a>';
    return '<span class="apple-credit">' + out + "</span>";
  }

  function debounce(fn, ms) {
    var t;
    return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); };
  }

  B.Itunes = {
    COUNTRY: COUNTRY, PREFIX: PREFIX, BADGE_SRC: BADGE_SRC,
    isExternalId: function (id) { return typeof id === "string" && id.indexOf("itunes-") === 0; },
    isExternalAlbumId: function (id) { return isExt(id, "album"); },
    searchSongs: searchSongs, searchAlbums: searchAlbums, searchArtists: searchArtists,
    loadAlbum: loadAlbum, ensureAlbum: loadAlbum, discography: discography, lookupTrack: lookupTrack,
    resolveArtist: resolveArtist, lookupArtist: lookupArtist, topSongs: topSongs, coverColor: coverColor, fallbackColor: fallbackColor, norm: norm,
    hydrate: hydrate, previewFor: previewFor, cachedPreview: cachedPreview, linkFor: linkFor,
    creditHtml: creditHtml, errorMessage: errorMessage, debounce: debounce,
    onChange: function (fn) { listeners.push(fn); },
    /* diagnóstico / testes */
    _stats: function () { var n = Date.now(); return { calls: calls.filter(function (t) { return n - t < WINDOW; }).length, queued: queue.length, active: active, max: MAX_CALLS }; },
    _clear: function () { cache = {}; localMatch = {}; },
    _strictMatch: strictMatch
  };
})(window.Batuque);
