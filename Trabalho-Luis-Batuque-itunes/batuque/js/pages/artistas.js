/* Artistas — diretório (wireframe v2). Abre sem nenhuma chamada à Apple; busca com 2+ caracteres consulta searchArtists. */
(function (B) {
  var c = B.c, D = B.data;
  var s = { q: "", tipo: "Todos" };
  var MIN_APPLE = 2;
  var ap = { status: "idle", items: [], q: "" }, apSeq = 0, view = null;

  function href(id) { return "#/artista/" + encodeURIComponent(id); }
  function card(a, i) {
    return '<article class="adir-card stagger" style="--i:' + i + ";--c:" + c.esc(a.cor) + '" data-aid="' + c.esc(a.id) + '" tabindex="0" role="link" aria-label="Abrir perfil de ' + c.esc(a.nome) + '">' +
      c.artistTile(a, "sm") + '<div class="adir-card__body"><h3 class="adir-card__name">' + c.esc(a.nome) + '</h3><p class="tiny muted">' + c.esc(a.meta) + '</p><p class="small adir-card__desc">' + c.esc(a.desc) + "</p>" +
      '<p class="adir-card__foot"><span class="adir-link">ABRIR PERFIL</span><span class="adir-arrow">' + c.icon("arrow") + "</span></p></div></article>";
  }
  function match(a) {
    var q = s.q.trim().toLowerCase();
    return (s.tipo === "Todos" || a.tipo === s.tipo) && (!q || (a.nome + " " + a.meta + " " + a.desc).toLowerCase().indexOf(q) >= 0);
  }
  function appleBlock() {
    var q = s.q.trim();
    if (q.length < MIN_APPLE) return "";
    var msg = "", list = "";
    if (ap.status === "pending" || ap.status === "loading") msg = '<p class="small muted" role="status">Buscando artistas na Apple…</p>';
    else if (ap.status === "error") msg = '<p class="small muted" role="alert">' + c.esc(ap.msg) + ' <button class="link" id="apRetry">Tentar novamente</button></p>';
    else if (ap.status === "ok" && !ap.items.length) msg = '<p class="small muted">Nenhum artista encontrado na Apple.</p>';
    else if (ap.status === "ok") list = '<div class="adir-grid">' + ap.items.map(function (a, i) { return card(a, i); }).join("") + "</div>";
    return '<div class="section-head" style="margin-top:28px"><div><h2 class="section-title">Artistas na Apple</h2><p class="small muted">Resultados da iTunes Search API (loja do Brasil)</p></div></div>' + list + msg;
  }
  function paintApple() { if (view && document.body.contains(view)) { view.querySelector("#arApple").innerHTML = appleBlock(); } }
  function fetchApple() {
    var q = s.q.trim(); if (q.length < MIN_APPLE || s.tipo !== "Todos") return;
    var my = ++apSeq; ap = { status: "loading", items: [], q: q }; paintApple();
    B.Itunes.searchArtists(q).then(function (r) {
      if (my !== apSeq) return;
      var cur = D.artists.map(function (x) { return B.Itunes.norm(x.nome); });
      ap = { status: "ok", q: q, items: r.artists.filter(function (a) { return cur.indexOf(B.Itunes.norm(a.nome)) < 0; }) }; paintApple();
    }, function (e) {
      if (my !== apSeq || (e && e.code === "cancelled")) return;
      ap = { status: "error", items: [], q: q, msg: B.Itunes.errorMessage(e) }; paintApple();
    });
  }
  var later = B.Itunes.debounce(fetchApple, 500);

  function filter(root) {
    var n = 0;
    root.querySelectorAll("#arGrid [data-aid]").forEach(function (el) {
      var a = D.artists.filter(function (x) { return x.id === el.dataset.aid; })[0], ok = match(a);
      if (ok) { n++; if (el.hidden) { el.hidden = false; void el.offsetWidth; } el.classList.remove("is-out"); }
      else if (!el.hidden) { el.classList.add("is-out"); setTimeout(function () { if (el.classList.contains("is-out")) el.hidden = true; }, 220); }
    });
    root.querySelector("#arCount").textContent = n + (n === 1 ? " perfil" : " perfis") + " nesta seleção";
    root.querySelector("#arEmpty").hidden = n > 0;
  }

  B.pages.artistas = {
    title: "Artistas",
    render: function () {
      var n = D.artists.filter(match).length;
      return c.head("EXPLORAR CRIADORES", "Artistas", "Encontre perfis, discografias, faixas populares e avaliações da comunidade.") +
        '<div class="filterbar"><label class="input-ico">' + c.icon("search") + '<input class="input" id="arQ" placeholder="Buscar por artista, banda ou compositor..." value="' + c.esc(s.q) + '" aria-label="Buscar por artista, banda ou compositor"></label>' +
        c.chips(["Todos", "Solo", "Bandas", "Compositores"], s.tipo, "data-atipo") + '<span class="small muted arcount" id="arCount" role="status">' + n + (n === 1 ? " perfil" : " perfis") + " nesta seleção</span></div>" +
        '<div class="adir-grid" id="arGrid">' + D.artists.map(card).join("") + "</div>" +
        '<p class="small muted empty card" id="arEmpty" hidden>Nenhum artista curado combina com a busca.</p>' +
        '<div id="arApple">' + appleBlock() + "</div>" +
        '<p class="footnote">As notas e resenhas exibidas nas páginas individuais são conteúdo de demonstração. <span id="arCredit">' + (ap.status === "ok" ? B.Itunes.creditHtml(null, { text: true }) : "") + "</span></p>";
    },
    init: function (root) {
      view = root;
      filter(root);
      var q = s.q.trim();
      if (s.tipo === "Todos" && q.length >= MIN_APPLE && !(ap.q === q && ap.status === "ok")) fetchApple();
      root.querySelector("#arQ").addEventListener("input", function (e) {
        s.q = e.target.value; filter(root); apSeq++;
        var t = s.q.trim();
        if (t.length >= MIN_APPLE && s.tipo === "Todos") { ap = { status: "pending", items: [], q: t }; later(); } else ap = { status: "idle", items: [], q: "" };
        paintApple();
      });
      root.addEventListener("click", function (e) {
        var t = e.target.closest("[data-atipo]");
        if (t) {
          s.tipo = t.dataset.atipo;
          root.querySelectorAll("[data-atipo]").forEach(function (b) { var on = b === t; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
          filter(root); apSeq++;
          if (s.tipo === "Todos" && s.q.trim().length >= MIN_APPLE) fetchApple(); else { ap = { status: "idle", items: [], q: "" }; paintApple(); }
          return;
        }
        if (e.target.closest("#apRetry")) { fetchApple(); return; }
        var cd = e.target.closest("[data-aid]"); if (cd) location.hash = href(cd.dataset.aid);
      });
      root.addEventListener("keydown", function (e) { var cd = e.target.closest("[data-aid]"); if (cd && e.key === "Enter" && e.target === cd) location.hash = href(cd.dataset.aid); });
    },
    leave: function () { view = null; }
  };
})(window.Batuque);
