/* Batuque — inicialização, layout fixo, busca global, atalhos */
(function (B) {
  var c = B.c, P = B.Player, st = B.store.state;
  var $ = function (id) { return document.getElementById(id); };

  var NAV = [
    ["inicio", "Início", "home"], ["descobrir", "Descobrir", "compass"], ["biblioteca", "Minha biblioteca", "grid"],
    ["album", "Página de álbum", "disc"], ["perfil", "Perfil", "user"], ["resenhas", "Resenhas", "chat"],
    ["playlists", "Playlists / lista", "list"], ["artistas", "Artistas", "note"], ["agora-tocando", "Agora tocando", "play"],
    ["estatisticas", "Estatísticas", "bars"], ["configuracoes", "Configurações", "gear"]
  ];
  var NAV2 = [["playlists", "Playlists salvas", "list"], ["estatisticas", "Estatísticas", "bars"], ["configuracoes", "Preferências", "sparkle"]];

  function navHtml(items, key) {
    return items.map(function (n) {
      var href = n[0] === "album" ? "#/album/" + B.Router.focusAlbum : "#/" + n[0];
      return '<a class="side-link" href="' + href + '" data-nav="' + n[0] + '" data-group="' + key + '">' + c.icon(n[2]) + "<span>" + n[1] + "</span></a>";
    }).join("");
  }

  B.app = {
    setActive: function (name) {
      if (name === "artista") name = "artistas";             // perfil do artista mantém "Artistas" ativo
      if (name === "avaliar-artista") name = "resenhas";     // "Avaliar artista" mantém "Resenhas" ativo
      document.querySelectorAll("[data-nav]").forEach(function (a) {
        var on = a.dataset.nav === name && a.dataset.group === "main";
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
        if (a.dataset.nav === "album") a.href = "#/album/" + B.Router.focusAlbum;
      });
      document.querySelectorAll("[data-top]").forEach(function (a) { a.classList.toggle("is-active", a.dataset.top === name || (a.dataset.top === "biblioteca" && ["descobrir", "playlists"].indexOf(name) < 0)); });
    },
    renderAvatar: function () {
      var ini = (st.profile.nome || "VC").split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
      $("topAvatar").textContent = ini;
      return ini;
    }
  };

  /* Player */
  function renderPlayer() {
    $("player").innerHTML =
      '<div class="player__left"><a href="#/album/' + P.track.albumId + '" id="plCover"></a><div class="player__meta ellipsis"><b id="plTitle"></b><span id="plSub"></span><span class="apple-credit apple-credit--meta" id="plCredit" hidden></span></div>' +
      '<button class="player__fav" id="plFav" aria-label="Favoritar faixa" aria-pressed="false">' + c.icon("heart") + "</button></div>" +
      '<div class="player__center"><div class="controls"><button class="ctrl" id="plPrev" aria-label="Anterior">' + c.icon("prev") + '</button>' +
      '<button class="ctrl-main" id="plPlay" aria-label="Pausar"></button><button class="ctrl" id="plNext" aria-label="Próxima">' + c.icon("next") + "</button></div>" +
      '<div class="progress-row"><span id="plTime">0:00</span><div class="progress" id="plBar" role="slider" tabindex="0" aria-label="Progresso"><span class="progress__win" id="plWin"></span><span class="progress__fill" id="plFill"></span><span class="progress__thumb" id="plThumb"></span></div><span id="plDur">0:00</span><span class="preview-tag" id="plTag" title="As faixas tocam por até 30 segundos">Prévia 30 s</span></div></div>' +
      '<div class="player__right"><span id="plBadge" hidden></span><span class="muted">' + c.icon("volume") + '</span><input class="range" id="plVol" type="range" min="0" max="1" step="0.01" aria-label="Volume">' +
      '<a class="icon-btn" href="#/agora-tocando" aria-label="Abrir Agora tocando">' + c.icon("expand") + "</a></div>";
    $("plPlay").onclick = P.toggle;
    $("plPrev").onclick = P.prev;
    $("plNext").onclick = function () { P.next(); };
    $("plFav").onclick = function () { P.toggleFav(); var f = $("plFav"); f.classList.remove("pop"); void f.offsetWidth; f.classList.add("pop"); };
    $("plVol").oninput = function (e) { P.setVolume(+e.target.value); };
    bindSeek($("plBar"));
  }
  function bindSeek(bar) {
    function at(e) { var r = bar.getBoundingClientRect(); P.seekRatio(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))); }
    bar.addEventListener("pointerdown", function (e) { at(e); bar.setPointerCapture(e.pointerId); bar.onpointermove = at; });
    bar.addEventListener("pointerup", function () { bar.onpointermove = null; });
    bar.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); P.seekRatio(Math.min(1, Math.max(0, (P.time + (e.key === "ArrowRight" ? 5 : -5)) / P.duration()))); }
    });
  }
  B.app.bindSeek = bindSeek;
  var lastTrack = null;
  function syncPlayer() {
    var t = P.track, a = B.data.album(t.albumId), d = P.duration();
    if (lastTrack !== t.id) {
      lastTrack = t.id;
      $("plCover").innerHTML = c.cover(a, "");
      $("plCover").href = "#/album/" + a.id;
      $("plTitle").textContent = t.titulo;
      $("plSub").textContent = t.artista + " · " + a.titulo;
    }
    $("plPlay").innerHTML = c.icon(P.playing ? "pause" : "play");
    $("plPlay").setAttribute("aria-label", P.playing ? "Pausar" : "Tocar");
    $("plTime").textContent = P.fmt(P.time);
    $("plDur").textContent = P.fmt(d);
    var pct = Math.min(100, P.time / d * 100);
    $("plFill").style.width = pct + "%";
    $("plThumb").style.left = pct + "%";
    $("plWin").style.left = (P.start / d * 100) + "%";
    $("plWin").style.width = ((P.end() - P.start) / d * 100) + "%";
    $("plBar").setAttribute("aria-valuenow", Math.round(P.time));
    var tag = $("plTag"), TAGS = { loading: "Carregando…", unavailable: "Prévia indisponível", error: "Erro na prévia" };
    tag.textContent = TAGS[P.status] || "Prévia 30 s";
    tag.title = P.notice || "As faixas tocam por até 30 segundos";
    tag.classList.toggle("is-warn", P.status === "unavailable" || P.status === "error");
    var link = B.Itunes.linkFor(t), cred = $("plCredit"), badge = $("plBadge");
    if (cred.dataset.link !== link) {   // atribuição exigida pela Apple, junto ao conteúdo promocional que está tocando
      cred.dataset.link = link;
      cred.innerHTML = link ? B.Itunes.creditHtml(link, { text: true }) : "";
      badge.innerHTML = link ? B.Itunes.creditHtml(link, { badge: true }) : "";
    }
    cred.hidden = badge.hidden = !link;
    var fav = P.isFav();
    $("plFav").classList.toggle("is-on", fav);
    $("plFav").setAttribute("aria-pressed", fav);
    $("plVol").value = P.volume;
    $("plVol").style.setProperty("--v", (P.volume * 100) + "%");
    B.ui.markPlaying();
    if (B.pages["agora-tocando"].sync) B.pages["agora-tocando"].sync();
  }

  /* Tema / paleta */
  function renderThemeBtn() {
    $("themeBtn").innerHTML = '<span class="theme-ico" style="display:grid">' + c.icon(st.theme === "escuro" ? "sun" : "moon") + "</span>";
  }
  function renderPalette() {
    var pop = $("palettePop");
    pop.innerHTML = '<p class="eyebrow">Cor de destaque</p><div class="popover__grid">' + B.data.accents.map(function (a) {
      var on = a.hex.toLowerCase() === st.accent.toLowerCase();
      return '<button class="swatch' + (on ? " is-active" : "") + '" style="--sw:' + a.hex + '" data-accent="' + a.hex + '" aria-label="' + a.nome + '" aria-pressed="' + on + '" title="' + a.nome + " " + a.hex + '">' + (on ? c.icon("check") : "") + "</button>";
    }).join("") + '</div><p class="tiny muted" style="margin-top:10px">Páginas de álbum podem herdar a cor da capa.</p>';
  }

  /* Busca global: catálogo local (imediato) + Apple iTunes Search API (debounce, uma consulta por vez) */
  var focusIdx = -1, searchMode = "tudo", searchSeq = 0, apple = { status: "idle" };
  var MODES = [["tudo", "Tudo"], ["faixas", "Faixas"], ["albuns", "Álbuns"], ["artistas", "Artistas"]];
  var MIN_APPLE = 2, DEBOUNCE = 500;

  function buildSearchPanel() {
    $("searchResults").innerHTML = '<div class="search__tabs chips" role="group" aria-label="Categoria da busca">' + MODES.map(function (m) {
      return '<button type="button" class="chip' + (m[0] === searchMode ? " is-active" : "") + '" data-smode="' + m[0] + '" aria-pressed="' + (m[0] === searchMode) + '">' + m[1] + "</button>";
    }).join("") + '</div><div id="searchBody"></div><p class="search__foot tiny muted" id="searchFoot" hidden></p>';
  }
  function itemAlbum(a) {
    return '<button class="search__item" data-key="' + c.esc(a.id) + '" data-go="#/album/' + c.esc(a.id) + '">' + c.cover(a, "cover--xs") + '<span><b class="small">' + c.esc(a.titulo) + '</b><br><span class="tiny muted">' + c.esc(a.artista) + (a.externo && a.ano ? " · " + a.ano : "") + "</span></span></button>";
  }
  function itemTrack(t) {
    var a = B.data.album(t.albumId);
    var sub = c.esc(t.artista) + (t.externo ? " · " + c.esc(a.titulo) + (t.previewUrl ? "" : " · sem prévia") : "");
    return '<button class="search__item" data-key="' + c.esc(t.id) + '" data-play-track="' + c.esc(t.id) + '"' + (t.externo ? "" : ' data-go="#/album/' + t.albumId + '"') + ">" + c.cover(a, "cover--xs") + '<span><b class="small">' + c.esc(t.titulo) + '</b><br><span class="tiny muted">' + sub + "</span></span></button>";
  }
  function itemArtist(a) {
    return '<button class="search__item" data-key="' + c.esc(a.id) + '" data-go="#/artista/' + encodeURIComponent(a.id) + '" data-artist="' + c.esc(a.id) + '">' + c.artistTile(a, "xs") + '<span><b class="small">' + c.esc(a.nome) + '</b><br><span class="tiny muted">' + c.esc(a.meta || a.desc) + "</span></span></button>";
  }
  function group(label, list, fn) { return list.length ? '<p class="eyebrow search__group">' + label + "</p>" + list.map(fn).join("") : ""; }

  function renderBody() {
    var inp = $("searchInput"), raw = inp.value.trim(), q = raw.toLowerCase(), body = $("searchBody"), foot = $("searchFoot");
    if (!raw) { closeSearch(); return; }
    var m = function (s) { return String(s || "").toLowerCase().indexOf(q) >= 0; };
    var L = {
      al: B.data.albums.filter(function (a) { return m(a.titulo) || m(a.artista) || m(a.generos); }).slice(0, 5),
      tr: B.data.localTracks().filter(function (t) { return m(t.titulo) || m(t.artista); }).slice(0, 6),
      ar: B.data.artists.filter(function (a) { return m(a.nome) || m(a.desc); }).slice(0, 4)
    };
    var mode = searchMode, lim = mode === "tudo" ? [5, 6, 4] : [10, 10, 10];
    var showA = mode === "tudo" || mode === "albuns", showT = mode === "tudo" || mode === "faixas", showR = mode === "tudo" || mode === "artistas";
    var d = apple.status === "ok" ? apple.data : null, h = "";
    if (showA) h += group("Álbuns", L.al, itemAlbum) + (d ? group("Álbuns na Apple", d.albums.slice(0, lim[0]), itemAlbum) : "");
    if (showT) h += group("Faixas", L.tr, itemTrack) + (d ? group("Faixas na Apple", d.tracks.slice(0, lim[1]), itemTrack) : "");
    if (showR) h += group("Artistas", L.ar, itemArtist) + (d ? group("Artistas na Apple", d.artists.slice(0, lim[2]), itemArtist) : "");
    var useApple = raw.length >= MIN_APPLE, busy = useApple && (apple.status === "pending" || apple.status === "loading"), failed = useApple && apple.status === "error";
    if (!h && !busy && !failed) h = '<p class="search__empty">Nada encontrado para “' + c.esc(raw) + "”.</p>";
    if (busy) h += '<p class="search__empty" role="status">Buscando na Apple…</p>';
    if (failed) h += '<p class="search__empty" role="alert">' + c.esc(apple.msg) + ' <button type="button" class="link" data-sretry>Tentar novamente</button></p>';

    var items = body.querySelectorAll(".search__item"), keep = focusIdx >= 0 && items[focusIdx] ? items[focusIdx].dataset.key : null;
    body.innerHTML = h;
    focusIdx = -1;
    if (keep) body.querySelectorAll(".search__item").forEach(function (it, i) { if (it.dataset.key === keep) { focusIdx = i; it.classList.add("is-focus"); } });
    foot.hidden = !(useApple && apple.status !== "idle");
    if (!foot.hidden) foot.innerHTML = B.Itunes.creditHtml(null, { text: true });
    openSearch();
  }
  function openSearch() { $("searchResults").hidden = false; $("searchInput").setAttribute("aria-expanded", "true"); }
  function closeSearch() { $("searchResults").hidden = true; $("searchInput").setAttribute("aria-expanded", "false"); }
  function resetSearch() { apple = { status: "idle" }; searchSeq++; focusIdx = -1; closeSearch(); }

  /* Uma única consulta por termo/categoria; respostas de buscas antigas são ignoradas (searchSeq) */
  function fetchApple(force) {
    var q = $("searchInput").value.trim();
    if (q.length < MIN_APPLE) return;
    var ent = searchMode === "albuns" ? "album" : searchMode === "artistas" ? "artist" : "song", key = ent + "|" + q.toLowerCase();
    if (!force && apple.key === key && apple.status !== "error") return;
    var my = ++searchSeq;
    apple = { status: "loading", key: key };
    renderBody();
    var call = ent === "album" ? B.Itunes.searchAlbums(q) : ent === "artist" ? B.Itunes.searchArtists(q) : B.Itunes.searchSongs(q);
    call.then(function (data) {
      if (my !== searchSeq) return;
      apple = { status: "ok", key: key, data: data }; renderBody();
    }, function (e) {
      if (my !== searchSeq || (e && e.code === "cancelled")) return;
      apple = { status: "error", key: key, msg: B.Itunes.errorMessage(e) }; renderBody();
    });
  }
  var runApple = B.Itunes.debounce(function () { fetchApple(); }, DEBOUNCE);

  function renderAvatarMenu() {
    $("avatarMenu").innerHTML = [["perfil", "Perfil", "user"], ["configuracoes", "Configurações", "gear"], ["sair", "Sair", "arrow"]].map(function (m) {
      return '<button role="menuitem" data-am="' + m[0] + '">' + c.icon(m[2]) + m[1] + "</button>";
    }).join("");
  }
  function closeAvatarMenu() { $("avatarMenu").hidden = true; $("topAvatar").setAttribute("aria-expanded", "false"); }

  function init() {
    $("sideNav").innerHTML = navHtml(NAV, "main");
    $("sideNav2").innerHTML = navHtml(NAV2, "sub");
    $("searchIco").innerHTML = c.icon("search");
    $("menuBtn").innerHTML = c.icon("menu");
    $("paletteBtn").innerHTML = c.icon("palette");
    B.app.renderAvatar();
    renderThemeBtn();
    renderPlayer();
    P.on(syncPlayer);
    syncPlayer();

    $("menuBtn").onclick = function () { $("app").classList.toggle("menu-open"); };
    $("app").addEventListener("click", function (e) { if (e.target === $("app")) $("app").classList.remove("menu-open"); });
    $("themeBtn").onclick = function () { B.Theme.toggleTheme(); renderThemeBtn(); };
    B.store.on(function (k) { if (k === "theme") renderThemeBtn(); if (k === "accent") renderPalette(); if (k === "profile" || k === "session") B.app.renderAvatar(); });
    renderAvatarMenu();
    $("topAvatar").onclick = function (e) {
      e.stopPropagation();
      if (!B.Session.isLogged()) { location.hash = "#/login"; return; }
      var m = $("avatarMenu"); m.hidden = !m.hidden; $("topAvatar").setAttribute("aria-expanded", String(!m.hidden));
      if (!m.hidden) { var f = m.querySelector("button"); if (f) f.focus(); }
    };
    $("avatarMenu").addEventListener("click", function (e) {
      var b = e.target.closest("[data-am]"); if (!b) return;
      closeAvatarMenu();
      if (b.dataset.am === "sair") B.Session.logout(); else location.hash = "#/" + b.dataset.am;
    });
    $("paletteBtn").onclick = function (e) {
      e.stopPropagation();
      var pop = $("palettePop"); renderPalette(); pop.hidden = !pop.hidden;
      $("paletteBtn").setAttribute("aria-expanded", String(!pop.hidden));
    };
    $("palettePop").addEventListener("click", function (e) {
      var b = e.target.closest("[data-accent]"); if (!b) return;
      B.Theme.setAccent(b.dataset.accent); renderPalette();
      if (B.Router && location.hash.indexOf("#/configuracoes") === 0) B.Router.render();
      B.ui.toast("Cor de destaque atualizada");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#palettePop") && !e.target.closest("#paletteBtn")) $("palettePop").hidden = true;
      if (!e.target.closest("#search")) closeSearch();
      if (!e.target.closest(".avatar-wrap")) closeAvatarMenu();
    });

    var inp = $("searchInput");
    buildSearchPanel();
    inp.addEventListener("input", function () {
      searchSeq++;
      if (inp.value.trim().length >= MIN_APPLE) { apple = { status: "pending" }; runApple(); } else apple = { status: "idle" };
      renderBody();
    });
    inp.addEventListener("focus", function () { if (inp.value.trim()) { renderBody(); fetchApple(); } });
    inp.addEventListener("keydown", function (e) {
      var items = $("searchResults").querySelectorAll(".search__item");
      if (e.key === "Escape") { inp.value = ""; resetSearch(); inp.blur(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); e.stopPropagation(); if (!items.length) return;
        focusIdx = (focusIdx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle("is-focus", i === focusIdx); });
        items[focusIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") { var it = items[focusIdx >= 0 ? focusIdx : 0]; if (it) it.click(); }
    });
    $("searchResults").addEventListener("click", function (e) {
      var ch = e.target.closest("[data-smode]");
      if (ch) {
        searchMode = ch.dataset.smode;
        $("searchResults").querySelectorAll("[data-smode]").forEach(function (x) { var on = x === ch; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", on); });
        focusIdx = -1; renderBody(); fetchApple(); inp.focus(); return;
      }
      if (e.target.closest("[data-sretry]")) { e.stopPropagation(); fetchApple(true); return; }
      var b = e.target.closest(".search__item"); if (!b) return;
      if (b.dataset.playTrack) {
        var t = P.T(b.dataset.playTrack);
        if (t && t.externo && !t.previewUrl) B.ui.toast("Prévia indisponível para “" + t.titulo + "”", "soft");
        else if (t) P.play(t);
      }
      if (b.dataset.go) { if (location.hash === b.dataset.go) B.Router.render(); else location.hash = b.dataset.go; }
      inp.value = ""; resetSearch();
    });

    /* Delegação global: cards e botões de play */
    document.addEventListener("click", function (e) {
      var pa = e.target.closest("[data-play-album]");
      if (pa) { e.stopPropagation(); e.preventDefault(); var id = pa.dataset.playAlbum; if (P.track.albumId === id && pa.classList.contains("is-playing")) P.toggle(); else P.play(id); return; }
      var card = e.target.closest("[data-album]");
      if (card && !e.target.closest("a, button, select, input")) location.hash = "#/album/" + card.dataset.album;
    });
    document.addEventListener("keydown", function (e) {
      var card = e.target.closest && e.target.closest("[data-album][tabindex]");
      if (card && e.key === "Enter" && e.target === card) location.hash = "#/album/" + card.dataset.album;
    });

    /* Atalhos */
    document.addEventListener("keydown", function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (e.key === "Escape") { if (B.ui.closeModal()) return; if (!$("avatarMenu").hidden) { closeAvatarMenu(); $("topAvatar").focus(); return; } $("palettePop").hidden = true; closeSearch(); $("app").classList.remove("menu-open"); return; }
      if (typing || document.querySelector(".modal-backdrop")) return;
      if (e.key === "/") { e.preventDefault(); inp.focus(); }
      else if (e.code === "Space" && !/BUTTON|A/.test(document.activeElement.tagName)) { e.preventDefault(); P.toggle(); }
      else if (e.code === "Space" && /BUTTON|A/.test(document.activeElement.tagName)) { /* ativa o botão focado */ }
      else if (e.key === "ArrowRight" && !e.target.closest("[role=slider]")) P.next();
      else if (e.key === "ArrowLeft" && !e.target.closest("[role=slider]")) P.prev();
    });

    B.Router.start();

    /* Restaura (por lookup) os itens da Apple referenciados na biblioteca/fila/playlist; só ids ficam no localStorage */
    B.Itunes.onChange(function () {
      var n = location.hash.replace(/^#\/?/, "").split("/")[0];
      if (["biblioteca", "playlists", "agora-tocando", "resenhas"].indexOf(n) >= 0) B.Router.render();
      syncPlayer();
    });
    B.Itunes.hydrate().catch(function (e) { B.ui.toast("Não foi possível restaurar itens salvos da Apple. " + B.Itunes.errorMessage(e), "soft"); });
  }
  init();
})(window.Batuque);
