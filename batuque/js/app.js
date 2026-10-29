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
      '<div class="player__left"><a href="#/album/' + P.track.albumId + '" id="plCover"></a><div class="player__meta ellipsis"><b id="plTitle"></b><span id="plSub"></span></div>' +
      '<button class="player__fav" id="plFav" aria-label="Favoritar faixa" aria-pressed="false">' + c.icon("heart") + "</button></div>" +
      '<div class="player__center"><div class="controls"><button class="ctrl" id="plPrev" aria-label="Anterior">' + c.icon("prev") + '</button>' +
      '<button class="ctrl-main" id="plPlay" aria-label="Pausar"></button><button class="ctrl" id="plNext" aria-label="Próxima">' + c.icon("next") + "</button></div>" +
      '<div class="progress-row"><span id="plTime">0:00</span><div class="progress" id="plBar" role="slider" tabindex="0" aria-label="Progresso"><span class="progress__win" id="plWin"></span><span class="progress__fill" id="plFill"></span><span class="progress__thumb" id="plThumb"></span></div><span id="plDur">0:00</span><span class="preview-tag" title="As faixas tocam por até 30 segundos">Prévia 30 s</span></div></div>' +
      '<div class="player__right"><span class="muted">' + c.icon("volume") + '</span><input class="range" id="plVol" type="range" min="0" max="1" step="0.01" aria-label="Volume">' +
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
    $("plFill").style.width = (P.time / d * 100) + "%";
    $("plThumb").style.left = (P.time / d * 100) + "%";
    $("plWin").style.left = (P.start / d * 100) + "%";
    $("plWin").style.width = ((P.end() - P.start) / d * 100) + "%";
    $("plBar").setAttribute("aria-valuenow", Math.round(P.time));
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

  /* Busca global */
  var focusIdx = -1;
  function searchResults(q) {
    q = q.trim().toLowerCase();
    var box = $("searchResults"), inp = $("searchInput");
    if (!q) { box.hidden = true; inp.setAttribute("aria-expanded", "false"); return; }
    var m = function (s) { return s.toLowerCase().indexOf(q) >= 0; };
    var al = B.data.albums.filter(function (a) { return m(a.titulo) || m(a.artista) || m(a.generos); }).slice(0, 5);
    var tr = B.data.allTracks().filter(function (t) { return m(t.titulo) || m(t.artista); }).slice(0, 6);
    var ar = B.data.artists.filter(function (a) { return m(a.nome) || m(a.desc); }).slice(0, 4);
    var h = "";
    if (al.length) h += '<p class="eyebrow search__group">Álbuns</p>' + al.map(function (a) { return '<button class="search__item" data-go="#/album/' + a.id + '">' + c.cover(a, "cover--xs") + '<span><b class="small">' + c.esc(a.titulo) + '</b><br><span class="tiny muted">' + c.esc(a.artista) + "</span></span></button>"; }).join("");
    if (tr.length) h += '<p class="eyebrow search__group">Faixas</p>' + tr.map(function (t) { return '<button class="search__item" data-play-track="' + t.id + '" data-go="#/album/' + t.albumId + '">' + c.cover(B.data.album(t.albumId), "cover--xs") + '<span><b class="small">' + c.esc(t.titulo) + '</b><br><span class="tiny muted">' + c.esc(t.artista) + "</span></span></button>"; }).join("");
    if (ar.length) h += '<p class="eyebrow search__group">Artistas</p>' + ar.map(function (a) { return '<button class="search__item" data-go="#/artistas" data-artist="' + a.id + '"><span class="artist-ini artist-ini--xs">' + a.ini + '</span><span><b class="small">' + c.esc(a.nome) + '</b><br><span class="tiny muted">' + c.esc(a.desc) + "</span></span></button>"; }).join("");
    box.innerHTML = h || '<p class="search__empty">Nada encontrado para “' + c.esc(q) + "”.</p>";
    box.hidden = false; inp.setAttribute("aria-expanded", "true"); focusIdx = -1;
  }
  function closeSearch() { $("searchResults").hidden = true; $("searchInput").setAttribute("aria-expanded", "false"); }

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
    B.store.on(function (k) { if (k === "theme") renderThemeBtn(); if (k === "accent") renderPalette(); if (k === "profile") B.app.renderAvatar(); });
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
    });

    var inp = $("searchInput");
    inp.addEventListener("input", function () { searchResults(inp.value); });
    inp.addEventListener("focus", function () { if (inp.value) searchResults(inp.value); });
    inp.addEventListener("keydown", function (e) {
      var items = $("searchResults").querySelectorAll(".search__item");
      if (e.key === "Escape") { inp.value = ""; closeSearch(); inp.blur(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); e.stopPropagation(); if (!items.length) return;
        focusIdx = (focusIdx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle("is-focus", i === focusIdx); });
      } else if (e.key === "Enter") { var it = items[focusIdx >= 0 ? focusIdx : 0]; if (it) it.click(); }
    });
    $("searchResults").addEventListener("click", function (e) {
      var b = e.target.closest(".search__item"); if (!b) return;
      if (b.dataset.playTrack) P.play(P.T(b.dataset.playTrack));
      if (b.dataset.artist) B.pages.artistas.selected = b.dataset.artist;
      location.hash = b.dataset.go; inp.value = ""; closeSearch();
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
      if (e.key === "Escape") { if (B.ui.closeModal()) return; $("palettePop").hidden = true; closeSearch(); $("app").classList.remove("menu-open"); return; }
      if (typing || document.querySelector(".modal-backdrop")) return;
      if (e.key === "/") { e.preventDefault(); inp.focus(); }
      else if (e.code === "Space" && !/BUTTON|A/.test(document.activeElement.tagName)) { e.preventDefault(); P.toggle(); }
      else if (e.code === "Space" && /BUTTON|A/.test(document.activeElement.tagName)) { /* ativa o botão focado */ }
      else if (e.key === "ArrowRight" && !e.target.closest("[role=slider]")) P.next();
      else if (e.key === "ArrowLeft" && !e.target.closest("[role=slider]")) P.prev();
    });

    B.Router.start();
  }
  init();
})(window.Batuque);
