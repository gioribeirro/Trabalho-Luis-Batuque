/* Artista — perfil (wireframe v2). Até 3 chamadas à Apple na abertura (resolver ID, faixas populares, discografia). */
(function (B) {
  var c = B.c, D = B.data, st = B.store.state, P = B.Player;
  var S = null;   // estado da visita atual

  function two(n) { return n < 10 ? "0" + n : String(n); }
  function artist(id) { return D.getArtistById(id); }
  function norm(x) { return B.Itunes.norm(x); }
  function tipoAno(al) { return (al.tipo || "Álbum") + (al.ano ? " · " + al.ano : ""); }
  function href(id) { return "#/artista/" + encodeURIComponent(id); }

  /* ---------- faixas populares ---------- */
  function tracksHtml() {
    if (S.tstatus === "loading") return '<p class="small muted empty" role="status">Carregando faixas populares…</p>';
    var list = S.tracks;
    if (!list.length) return '<p class="small muted empty">Nenhuma faixa encontrada.</p>';
    return list.map(function (t, i) {
      var np = t.fallback || (t.externo && !t.previewUrl), sel = S.sel === t.id || (!S.sel && i === 0);
      return '<div class="table__row ap-row' + (sel ? " is-active" : "") + (np ? " is-nopreview" : "") + '" data-ap-track="' + c.esc(t.id) + '" tabindex="0" aria-label="Tocar ' + c.esc(t.titulo) + (np ? " (prévia indisponível)" : "") + '">' +
        '<span class="num ap-num"><span>' + two(i + 1) + '</span><button class="ap-play" tabindex="-1" aria-hidden="true">' + c.icon("play") + "</button>" + c.eq() + "</span>" +
        '<span class="cell-main"><span class="ellipsis"><b>' + c.esc(t.titulo) + '</b><span class="tiny muted">' + c.esc(t.artista) + "</span></span></span>" +
        '<span class="muted ellipsis ap-art">' + c.esc(t.artista) + "</span>" +
        '<button class="ap-more icon-btn" data-ap-more="' + c.esc(t.id) + '" aria-label="Mais opções da faixa" aria-haspopup="true">' + c.icon("dots") + "</button></div>";
    }).join("");
  }
  /* ---------- discografia ---------- */
  function discoItems() {
    if (S.astatus === "loading") return null;
    var seen = {}, out = [];
    S.albums.forEach(function (al) { var k = norm(al.titulo); if (!seen[k]) { seen[k] = 1; out.push(al); } });
    return out;
  }
  function localMatch(titulo) {
    var k = norm(titulo), hit = D.albums.filter(function (a) { return norm(a.titulo) === k; })[0];
    return hit || null;
  }
  function discoHtml() {
    var items = discoItems();
    if (!items) return '<p class="small muted empty" role="status">Carregando discografia…</p>';
    if (!items.length) return '<p class="small muted empty">A Apple não retornou álbuns para este artista.</p>';
    var show = S.all ? items : items.slice(0, 6);
    return '<div class="ap-disco">' + show.map(function (al, i) {
      var cover = al.externo ? c.cover(al, "cover--md") : '<span class="atile atile--md" style="--c:' + c.esc(S.a.cor) + '"><b class="atile__ini">' + c.esc(String(al.titulo).charAt(0)) + '</b><i class="atile__disc"></i></span>';
      return '<a class="ap-album stagger" style="--i:' + i + '" href="#" data-ap-album="' + (al.externo ? c.esc(al.id) : "") + '" data-ap-title="' + c.esc(al.titulo) + '">' + '<span class="ap-album__art">' + cover + '</span><b class="small ellipsis">' + c.esc(al.titulo) + '</b><span class="tiny muted">' + c.esc(tipoAno(al)) + "</span></a>";
    }).join("") + "</div>" + (items.length > 6 ? '<p style="margin-top:10px"><button class="link" id="apAll">' + (S.all ? "Ver menos" : "Ver tudo") + "</button></p>" : "");
  }
  function noticeHtml() {
    return S.fail ? '<p class="small ap-notice" role="status">Sem conexão com a Apple — exibindo dados de demonstração. <button class="link" id="apRetry">Tentar novamente</button></p>' : "";
  }
  function paint() {
    if (!S || !document.body.contains(S.root)) return;
    var r = S.root, q = function (s) { return r.querySelector(s); };
    q("#apTracks").innerHTML = tracksHtml(); q("#apDiscoBox").innerHTML = discoHtml(); q("#apNotice").innerHTML = noticeHtml();
    var ea = S.ea, btn = q("#apApple");
    if (btn) { var u = ea && ea.artistViewUrl; btn.toggleAttribute("disabled", !u); btn.setAttribute("aria-disabled", String(!u)); btn.dataset.url = u || ""; }
    q("#apCredit").innerHTML = ea && ea.artistViewUrl ? B.Itunes.creditHtml(ea.artistViewUrl, { text: true }) : B.Itunes.creditHtml(null, { text: true });
    B.ui.markPlaying();
  }

  /* ---------- carga (no máximo 3 chamadas) ---------- */
  function load() {
    var cur = S, a = S.a, my = ++S.seq;
    S.tstatus = S.astatus = "loading"; S.fail = false; paint();
    var rid = a.externo ? Promise.resolve(a.id) : B.Itunes.resolveArtist(a.nome, a.id);
    rid.then(function (aid) {
      if (S !== cur || my !== cur.seq) return;
      if (!aid) throw { code: "notfound" };
      S.ea = D.getArtistById(aid) && D.getArtistById(aid).externo ? D.getArtistById(aid) : (a.externo ? a : null);
      S.aid = aid;
      var ok = 0;
      function done() { ++ok; }
      B.Itunes.topSongs(aid, a.nome).then(function (t) {
        if (S !== cur || my !== cur.seq) return;
        if (t.length) { S.tracks = t; S.tstatus = "ok"; } else { S.tracks = fbTracks(); S.tstatus = "fb"; S.fail = true; }
        paint(); done();
      }, function () { if (S !== cur || my !== cur.seq) return; S.tracks = fbTracks(); S.tstatus = "fb"; S.fail = true; paint(); done(); });
      B.Itunes.discography(aid).then(function (r) {
        if (S !== cur || my !== cur.seq) return;
        S.albums = r.albums; S.astatus = "ok"; if (r.artist && r.artist.externo) S.ea = r.artist;
        if (!r.albums.length) { S.albums = fbAlbums(); S.astatus = "fb"; }
        paint(); done();
      }, function () { if (S !== cur || my !== cur.seq) return; S.albums = fbAlbums(); S.astatus = "fb"; S.fail = true; paint(); done(); });
    }, function () {
      if (S !== cur || my !== cur.seq) return;
      S.tracks = fbTracks(); S.albums = fbAlbums(); S.tstatus = S.astatus = "fb"; S.fail = true; paint();
    });
  }
  function fbTracks() { return (S.a.popularesFallback || []).slice(); }
  function fbAlbums() { return (S.a.discoFallback || []).map(function (d) { return { titulo: d.titulo, tipo: d.tipo, ano: d.ano, externo: false }; }); }

  /* ---------- tela ---------- */
  function rate() { return st.artistRatings[S ? S.a.id : null]; }
  function communityCard(a) {
    var mine = st.artistRatings[a.id], has = a.nota != null;
    return '<div class="ap-comm"><p class="eyebrow">AVALIAÇÃO DA COMUNIDADE</p>' +
      (has ? '<p class="ap-comm__n"><b id="apNota" data-nota="' + a.nota + '">' + c.fmtNota(a.nota) + '</b><span class="muted">/5</span></p>' + c.stars(a.nota) + '<p class="tiny muted">' + a.avaliacoes.toLocaleString("pt-BR") + " avaliações · exemplo</p>"
        : '<p class="small muted" style="margin:8px 0">Ainda sem avaliações de exemplo para este artista.</p>') +
      (mine ? '<p class="small ap-mine">Sua avaliação: <b>' + c.fmtNota(mine.nota) + "</b></p>" : "") + "</div>";
  }
  function countNota(root) {
    var el = root.querySelector("#apNota"); if (!el) return;
    var to = +el.dataset.nota, t0 = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    (function step(n) { var p = Math.min(1, (n - t0) / 900); el.textContent = c.fmtNota(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
  }

  B.pages.artista = {
    title: function (id) { var a = artist(id); return a ? a.nome : "Artista"; },
    accent: function (id) { var a = artist(id); return a && st.inheritCover ? a.cor : null; },
    render: function (id) {
      var a = artist(id), following = st.following.indexOf(a.id) >= 0;
      S = { a: a, root: null, ea: a.externo ? a : null, tracks: [], albums: [], tstatus: "loading", astatus: "loading", fail: false, all: false, sel: null, seq: 0 };
      return '<div class="ap" style="--c:' + c.esc(a.cor) + '"><p class="eyebrow ap-crumb"><a href="#/artistas">ARTISTA</a> / PERFIL</p>' +
        '<section class="card ap-main"><div class="ap-strip" aria-hidden="true"><i class="ap-bar ap-bar--a"></i><i class="ap-bar ap-bar--b"></i></div>' +
        '<div class="ap-main__body"><div class="ap-tile">' + c.artistTile(a, "lg") + '</div><div class="ap-info"><p class="eyebrow ap-label">' + c.esc(a.rotulo) + '</p><h1 class="ap-name">' + c.esc(a.nome) + '</h1><p class="small muted">' + c.esc(a.generos) + '</p>' +
        '<p class="small ap-desc">' + c.esc(a.desc) + '</p><div class="row ap-actions"><button class="btn btn--primary" id="apFollow" aria-pressed="' + following + '"><span class="fade-label">' + (following ? "Seguindo ✓" : "Seguir artista") + '</span></button>' +
        '<button class="btn" id="apApple" disabled aria-disabled="true">' + c.icon("ext") + 'Abrir na Apple Music</button></div></div>' + communityCard(a) + "</div></section>" +
        '<div id="apNotice" aria-live="polite"></div>' +
        '<div class="ap-cols"><section class="card card--pad ap-left">' + c.sectionHead("Faixas populares", "Seleção de faixas associadas ao perfil") +
        '<div class="table ap-table"><div class="table__head ap-row"><span>#</span><span>FAIXA</span><span class="ap-art" style="text-align:right">ARTISTA</span><span></span></div><div id="apTracks"></div></div></section>' +
        '<aside class="ap-right"><section class="card card--pad">' + c.sectionHead("Discografia", "Álbuns e projetos selecionados") + '<div id="apDiscoBox"></div></section>' +
        '<section class="card card--pad ap-says"><p class="eyebrow">O QUE A COMUNIDADE DESTACA</p><p class="row" style="gap:8px;margin:10px 0">' + c.stars(a.nota != null ? a.nota : 0) + '<span class="small">Nota média ilustrativa: <b>' + (a.nota != null ? c.fmtNota(a.nota) : "—") + '/5</b></span></p>' +
        '<p class="ap-quote">“Uma seleção que vale explorar com calma.”</p><p class="tiny muted">Trecho fictício para demonstrar o espaço de resenhas.</p><button class="btn btn--primary" id="apRate" style="margin-top:14px">Avaliar artista</button></section></aside></div>' +
        '<p class="footnote">Faixas e lançamentos identificados a partir do catálogo público da Apple (iTunes). Avaliações, notas e resenhas são fictícias. <span id="apCredit"></span></p></div>';
    },
    init: function (root, id) {
      S.root = root;
      var a = S.a, q = function (s) { return root.querySelector(s); };
      paint(); load(); countNota(root);

      q("#apFollow").addEventListener("click", function () {
        if (!B.Session.requireLogin(location.hash)) return;
        var on = B.store.toggleIn("following", a.id), lb = this.querySelector(".fade-label");
        this.setAttribute("aria-pressed", on); this.classList.remove("pop"); void this.offsetWidth; this.classList.add("pop");
        lb.classList.add("is-out");
        setTimeout(function () { lb.textContent = on ? "Seguindo ✓" : "Seguir artista"; lb.classList.remove("is-out"); }, 140);
        B.ui.toast(on ? "Seguindo " + a.nome : "Você deixou de seguir " + a.nome);
      });
      q("#apApple").addEventListener("click", function () { var u = this.dataset.url; if (u) window.open(u, "_blank", "noopener,noreferrer"); });
      q("#apRate").addEventListener("click", function () { location.hash = "#/avaliar-artista/" + encodeURIComponent(a.id); });

      function trk(tid) { return S.tracks.filter(function (t) { return t.id === tid; })[0]; }
      function playable(t) { return t && !t.fallback && !(t.externo && !t.previewUrl); }
      function play(t) {
        if (!t) return;
        S.sel = t.id; q("#apTracks").querySelectorAll(".ap-row").forEach(function (r) { r.classList.toggle("is-active", r.dataset.apTrack === t.id); });
        if (!playable(t)) { B.ui.toast(t.fallback ? "Prévia indisponível sem conexão com a Apple" : "Prévia indisponível para “" + t.titulo + "”", "soft"); return; }
        var after = S.tracks.slice(S.tracks.indexOf(t) + 1).filter(playable).map(function (f) { return f.id; });
        P.queue = after.concat(P.queue.filter(function (x) { return after.indexOf(x) < 0; })); P.saveQueue(); P.play(t);
      }
      function closeMenu() { var m = root.querySelector(".ap-menu"); if (m) m.remove(); }
      function openMenu(btn, t) {
        closeMenu();
        var m = document.createElement("div"); m.className = "menu ap-menu"; m.setAttribute("role", "menu");
        var fav = st.favTracks.indexOf(t.id) >= 0, ok = playable(t);
        m.innerHTML = [["play", "Tocar prévia"], ["queue", "Adicionar à fila"], ["list", "Adicionar à playlist"], ["fav", fav ? "Remover dos favoritos" : "Favoritar"], ["album", "Ver álbum"]].map(function (x) {
          return '<button role="menuitem" data-m="' + x[0] + '"' + (!ok ? " disabled" : "") + ">" + x[1] + "</button>";
        }).join("");
        btn.parentNode.appendChild(m);
        m.addEventListener("click", function (e) {
          var b = e.target.closest("[data-m]"); if (!b || b.disabled) return; e.stopPropagation(); closeMenu();
          if (b.dataset.m === "play") play(t);
          else if (b.dataset.m === "queue") { if (P.queue.indexOf(t.id) < 0) { P.queue.push(t.id); P.saveQueue(); } B.ui.toast("Adicionada à fila"); }
          else if (b.dataset.m === "list") { var ids = (st.playlistTracks || D.album("conglomerate").faixas.map(function (f) { return f.id; })).slice(); if (ids.indexOf(t.id) < 0) ids.push(t.id); B.store.set("playlistTracks", ids); B.ui.toast("Adicionada à playlist"); }
          else if (b.dataset.m === "fav") { var on = B.store.toggleIn("favTracks", t.id); B.ui.toast(on ? "Adicionada aos favoritos" : "Removida dos favoritos"); }
          else if (b.dataset.m === "album") location.hash = "#/album/" + t.albumId;
        });
        var f = m.querySelector("button:not([disabled])"); if (f) f.focus();
      }
      root.addEventListener("click", function (e) {
        var more = e.target.closest("[data-ap-more]");
        if (more) { e.stopPropagation(); var t = trk(more.dataset.apMore); if (t) { if (more.parentNode.querySelector(".ap-menu")) closeMenu(); else openMenu(more, t); } return; }
        if (!e.target.closest(".ap-menu")) closeMenu();
        var row = e.target.closest("[data-ap-track]"); if (row) { play(trk(row.dataset.apTrack)); return; }
        var al = e.target.closest("[data-ap-album]");
        if (al) {
          e.preventDefault();
          var loc = localMatch(al.dataset.apTitle);
          if (loc) location.hash = "#/album/" + loc.id;
          else if (al.dataset.apAlbum) location.hash = "#/album/" + al.dataset.apAlbum;
          else B.ui.toast("Disponível quando a Apple responder", "soft");
          return;
        }
        if (e.target.closest("#apAll")) { S.all = !S.all; paint(); return; }
        if (e.target.closest("#apRetry")) load();
      });
      root.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
        var row = e.target.closest("[data-ap-track]");
        if (row && e.key === "Enter" && e.target === row) play(trk(row.dataset.apTrack));
      });
    },
    leave: function () { S = null; }
  };
})(window.Batuque);
