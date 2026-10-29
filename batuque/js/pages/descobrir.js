(function (B) {
  var c = B.c, D = B.data;
  var VIBES = ["Intenso", "Noturno", "Nostálgico", "Foco", "Cinematográfico", "Sem pressa", "Energia alta"];
  var GENRES = ["Rap / Trap", "Metalcore", "UK Rap", "Hip-hop", "Trilha sonora"];
  var s = { vibes: ["Intenso"], q: "", genres: [], yearMin: 2017, adv: false };
  var DEFAULT = ["jobs-not-done", "huncho-jack", "trauma", "renovate"];

  function results() {
    var q = s.q.trim().toLowerCase();
    var list = D.albums.filter(function (a) {
      var hay = (a.titulo + " " + a.artista + " " + a.generos + " " + a.vibes.join(" ")).toLowerCase();
      var okQ = !q || q.split(/[\s,]+/).some(function (w) { return w.length > 2 && hay.indexOf(w) >= 0; }) || hay.indexOf(q) >= 0;
      var okV = !s.vibes.length || s.vibes.some(function (v) { return a.vibes.indexOf(v) >= 0; });
      var okG = !s.genres.length || s.genres.some(function (g) { return a.generos.indexOf(g) >= 0; });
      return okQ && okV && okG && a.ano >= s.yearMin;
    });
    if (!q && s.vibes.length === 1 && s.vibes[0] === "Intenso" && !s.genres.length && s.yearMin === 2017) list = DEFAULT.map(D.album);
    return list;
  }
  function renderGrid(root) {
    var list = results(), g = root.querySelector("#comboGrid");
    g.innerHTML = list.length ? list.map(function (a, i) { return c.albumCard(a, i); }).join("") : '<div class="empty card">Nenhum álbum combina com essa mistura. Tente remover um filtro.</div>';
    root.querySelector("#comboSub").textContent = list.length === 4 && DEFAULT.every(function (id, i) { return list[i] && list[i].id === id; }) ? "Seleção feita com os oito álbuns de exemplo" : list.length + " " + (list.length === 1 ? "álbum encontrado" : "álbuns encontrados") + " entre os oito de exemplo";
    B.ui.markPlaying();
  }
  function syncChips(root) {
    root.querySelectorAll("[data-vibe]").forEach(function (b) { var on = s.vibes.indexOf(b.dataset.vibe) >= 0; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
  }

  B.pages.descobrir = {
    title: "Descobrir",
    render: function () {
      var j = D.album("jobs-not-done");
      return c.head('<span class="mark">Des</span>coberta guiada', "Descobrir", "Use humor, gênero ou contexto para encontrar sua próxima obsessão.") +
        '<form class="bigsearch card" id="discForm" role="search">' + c.icon("search") + '<input class="grow" id="discQ" placeholder="Ex.: riffs pesados, rap noturno, trilhas cinematográficas..." aria-label="Buscar por vibe" value="' + c.esc(s.q) + '"><button class="btn btn--primary">Buscar</button></form>' +
        c.sectionHead("Qual é a vibe?", "Escolha um ponto de partida; combine quantos quiser.", c.link("Filtros avançados", null, 'id="advBtn" aria-expanded="false"')) +
        c.chips(VIBES, s.vibes, "data-vibe", true) +
        '<div class="adv card card--pad" id="adv" hidden><div class="adv__grid"><div><p class="field-label">Gêneros</p>' + c.chips(GENRES, s.genres, "data-genre", true) +
        '</div><div><label class="field-label" for="yearMin">A partir do ano: <b id="yearLbl">' + s.yearMin + '</b></label><input class="range range--wide" id="yearMin" type="range" min="2017" max="2026" value="' + s.yearMin + '"></div><button class="btn" id="advReset">Limpar filtros</button></div></div>' +
        '<section class="hero hero--editorial card"><div class="hero__copy"><p class="eyebrow eyebrow--accent">Escolha editorial · 02</p><h2 class="hero__title hero__title--md">Uma história em cada faixa.</h2>' +
        '<p class="hero__text">Do rap melódico à trilha sonora atmosférica: crie sua rota por sons, texturas e sentimentos.</p><div class="row hero__btns"><button class="btn btn--primary btn--lg" id="exploreTrails">Explorar trilhas</button><a class="btn btn--lg" href="#/playlists">Ver coleções</a></div></div>' +
        '<div class="hero__art"><a href="#/album/' + j.id + '">' + c.cover(j, "cover--editorial") + "</a></div></section>" +
        '<div class="section-head"><div><h2 class="section-title">Combinações para hoje</h2><p class="small muted" id="comboSub"></p></div>' + c.link("Ver catálogo", "#/biblioteca") + "</div>" +
        '<div class="album-grid" id="comboGrid"></div>';
    },
    init: function (root) {
      renderGrid(root);
      root.querySelector("#discForm").addEventListener("submit", function (e) { e.preventDefault(); s.q = root.querySelector("#discQ").value; if (s.q) s.vibes = []; syncChips(root); renderGrid(root); });
      root.querySelector("#discQ").addEventListener("input", function (e) { s.q = e.target.value; renderGrid(root); });
      root.querySelector("#advBtn").addEventListener("click", function () { var a = root.querySelector("#adv"); a.hidden = !a.hidden; this.setAttribute("aria-expanded", String(!a.hidden)); });
      root.querySelector("#yearMin").addEventListener("input", function (e) { s.yearMin = +e.target.value; root.querySelector("#yearLbl").textContent = s.yearMin; renderGrid(root); });
      root.querySelector("#advReset").addEventListener("click", function () { s.genres = []; s.yearMin = 2017; s.vibes = ["Intenso"]; s.q = ""; B.Router.render(); });
      root.querySelector("#exploreTrails").addEventListener("click", function () { s.vibes = ["Cinematográfico"]; s.q = ""; root.querySelector("#discQ").value = ""; syncChips(root); renderGrid(root); root.querySelector("#comboGrid").scrollIntoView({ behavior: "smooth", block: "center" }); });
      root.addEventListener("click", function (e) {
        var v = e.target.closest("[data-vibe]");
        if (v) { var i = s.vibes.indexOf(v.dataset.vibe); if (i >= 0) s.vibes.splice(i, 1); else s.vibes.push(v.dataset.vibe); syncChips(root); renderGrid(root); }
        var g = e.target.closest("[data-genre]");
        if (g) { var k = s.genres.indexOf(g.dataset.genre); if (k >= 0) s.genres.splice(k, 1); else s.genres.push(g.dataset.genre); g.classList.toggle("is-active", k < 0); g.setAttribute("aria-pressed", k < 0); renderGrid(root); }
      });
    }
  };
})(window.Batuque);
