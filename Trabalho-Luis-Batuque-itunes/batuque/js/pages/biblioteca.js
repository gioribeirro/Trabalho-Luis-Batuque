(function (B) {
  var c = B.c, D = B.data, st = B.store.state;
  var s = { q: "", filtro: "Todos", ordem: "recentes" };
  var ORD = { recentes: "adicionados recentemente", az: "A–Z", ano: "ano", nota: "nota" };

  function durTotal(a) {
    if (a.externo) { var ok = a.faixas.length > 0, tot = 0; a.faixas.forEach(function (f) { if (f.durationSeconds) tot += f.durationSeconds; else ok = false; }); return ok ? Math.round(tot / 60) + " min" : "—"; }
    var t = 0; a.faixas.forEach(function (f) { t += B.Player.secs(f.dur); }); return Math.round(t / 60) + " min";
  }
  // Álbuns da Apple não têm "adicionado"/nota fictícios: a ordem de adição vem da própria lista salva
  function addedKey(a) { return a.adicionado != null ? a.adicionado : 100 + st.saved.indexOf(a.id); }
  function cols() {
    var f = st.libFields, g = ["28px", "minmax(180px,2.4fr)"];
    if (f.genero) g.push("1.3fr"); g.push("1fr"); if (f.ano) g.push("70px"); if (f.nota) g.push("90px"); if (f.duracao) g.push("70px"); if (f.favoritos) g.push("34px"); g.push("24px");
    return g.join(" ");
  }
  function list() {
    var q = s.q.toLowerCase();
    var arr = st.saved.map(D.album).filter(Boolean).filter(function (a) {
      if (q && (a.titulo + " " + a.artista).toLowerCase().indexOf(q) < 0) return false;
      if (s.filtro === "Álbuns") return a.tipo === "Álbum";
      if (s.filtro === "Singles") return a.tipo === "Single";
      if (s.filtro === "Trilhas") return a.tipo === "Trilha sonora";
      if (s.filtro === "Favoritos") return st.favAlbums.indexOf(a.id) >= 0;
      return true;
    });
    var cmp = { recentes: function (a, b) { return addedKey(b) - addedKey(a); }, az: function (a, b) { return a.titulo.localeCompare(b.titulo); }, ano: function (a, b) { return b.ano - a.ano; }, nota: function (a, b) { return (st.albumRatings[b.id] || b.nota || 0) - (st.albumRatings[a.id] || a.nota || 0); } };
    return arr.sort(cmp[s.ordem]);
  }
  function table() {
    var f = st.libFields, rows = list(), g = cols();
    var h = '<div class="table__head" style="grid-template-columns:' + g + '"><span>#</span><span>Álbum / Artista</span>' + (f.genero ? "<span>Gênero</span>" : "") + "<span>Tipo</span>" + (f.ano ? "<span>Ano</span>" : "") + (f.nota ? "<span>Nota</span>" : "") + (f.duracao ? "<span>Duração</span>" : "") + (f.favoritos ? '<span class="sr-only">Favorito</span>' : "") + "<span></span></div>";
    if (!rows.length) return h + '<div class="empty">Nenhum álbum encontrado com esse filtro.</div>';
    return h + rows.map(function (a, i) {
      var fav = st.favAlbums.indexOf(a.id) >= 0, nota = st.albumRatings[a.id] || a.nota || 0;
      return '<div class="table__row stagger" style="--i:' + i + ";grid-template-columns:" + g + '" data-album="' + c.esc(a.id) + '"' + (a.faixas[0] ? ' data-track="' + a.faixas[0].id + '"' : "") + ' tabindex="0" role="link" aria-label="' + c.esc(a.titulo) + '">' +
        '<span class="num"><span>' + ("0" + (i + 1)).slice(-2) + '</span><button class="num-play" data-play-album="' + c.esc(a.id) + '" aria-label="Tocar ' + c.esc(a.titulo) + '">' + c.icon("play") + "</button>" + c.eq() + "</span>" +
        '<span class="cell-main">' + c.cover(a, "cover--sm") + '<span class="ellipsis"><b>' + c.esc(a.titulo) + '</b><span class="tiny muted" style="text-transform:none">' + c.esc(a.artista) + "</span></span></span>" +
        (f.genero ? '<span class="muted">' + c.esc(a.generos || "—") + "</span>" : "") + '<span><span class="pill pill--type">' + c.esc(a.tipo) + "</span></span>" +
        (f.ano ? '<span class="muted">' + (a.ano || "—") + "</span>" : "") + (f.nota ? "<span>" + c.stars(nota) + "</span>" : "") + (f.duracao ? '<span class="muted">' + durTotal(a) + "</span>" : "") +
        (f.favoritos ? '<button class="fav-btn' + (fav ? " is-fav" : "") + '" data-fav-album="' + c.esc(a.id) + '" aria-pressed="' + fav + '" aria-label="Favoritar ' + c.esc(a.titulo) + '">' + c.icon("heart") + "</button>" : "") +
        '<span class="row-arrow">' + c.icon("arrow") + "</span></div>";
    }).join("");
  }

  B.pages.biblioteca = {
    title: "Minha biblioteca",
    render: function () {
      return c.head('<span class="mark">Tud</span>o o que você guardou', "Minha biblioteca", "Uma visão direta da coleção, com filtros, favoritos, avaliação e atalhos de reprodução.") +
        '<div class="card stat-strip"><div><p class="stat-num" data-count="' + st.saved.length + '" data-pad="2">00</p><p class="tiny muted">Álbuns nesta coleção</p></div><div><p class="stat-num" data-count="' + st.saved.map(D.album).filter(Boolean).reduce(function (n, a) { return n + (a.nFaixas || a.faixas.length || 0); }, 0) + '" data-pad="2">00</p><p class="tiny muted">Faixas catalogadas</p></div><div><p class="stat-num" data-count="1" data-pad="2">00</p><p class="tiny muted">Playlists temáticas</p></div><div><p class="stat-num" data-count="' + (st.reviews.length + Object.keys(st.artistRatings).length) + '" data-pad="2">00</p><p class="tiny muted">Resenhas escritas</p></div></div>' +
        '<div class="filterbar"><label class="input-ico">' + c.icon("search") + '<input class="input" id="libQ" placeholder="Filtrar por álbum ou artista..." value="' + c.esc(s.q) + '" aria-label="Filtrar biblioteca"></label>' + c.chips(["Todos", "Álbuns", "Singles", "Trilhas", "Favoritos"], s.filtro, "data-filter") +
        '<div class="menu-wrap"><button class="link" id="sortBtn" aria-haspopup="true" aria-expanded="false">Ordenar: <span id="sortLbl">' + ORD[s.ordem] + '</span></button><div class="menu" id="sortMenu" hidden role="menu">' +
        Object.keys(ORD).map(function (k) { return '<button role="menuitemradio" aria-checked="' + (k === s.ordem) + '" data-sort="' + k + '">' + (k === s.ordem ? c.icon("check") : '<span class="ico"></span>') + ORD[k].charAt(0).toUpperCase() + ORD[k].slice(1) + "</button>"; }).join("") + "</div></div></div>" +
        '<div class="table table--lib" id="libTable">' + table() + "</div>" +
        '<p class="footnote">Totais calculados a partir dos álbuns que você salvou. Faixas e durações aparecem quando identificadas.</p>';
    },
    init: function (root) {
      B.ui.countUp(root);
      var t = root.querySelector("#libTable");
      function redraw() { t.innerHTML = table(); B.ui.markPlaying(); }
      root.querySelector("#libQ").addEventListener("input", function (e) { s.q = e.target.value; redraw(); });
      var menu = root.querySelector("#sortMenu"), sb = root.querySelector("#sortBtn");
      sb.addEventListener("click", function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; sb.setAttribute("aria-expanded", String(!menu.hidden)); });
      document.addEventListener("click", function close(e) { if (!root.contains(menu)) return document.removeEventListener("click", close); if (!e.target.closest(".menu-wrap")) menu.hidden = true; });
      root.addEventListener("click", function (e) {
        var fb = e.target.closest("[data-filter]");
        if (fb) { s.filtro = fb.dataset.filter; root.querySelectorAll("[data-filter]").forEach(function (b) { var on = b === fb; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }); redraw(); }
        var so = e.target.closest("[data-sort]");
        if (so) { s.ordem = so.dataset.sort; B.Router.render(); }
        var fa = e.target.closest("[data-fav-album]");
        if (fa) { e.stopPropagation(); var on = B.store.toggleIn("favAlbums", fa.dataset.favAlbum); fa.classList.toggle("is-fav", on); fa.setAttribute("aria-pressed", on); fa.classList.remove("pop"); void fa.offsetWidth; fa.classList.add("pop"); if (s.filtro === "Favoritos") redraw(); B.ui.toast(on ? "Adicionado aos favoritos" : "Removido dos favoritos"); }
      });
    }
  };
})(window.Batuque);
