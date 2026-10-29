(function (B) {
  var c = B.c, D = B.data;
  var s = { q: "", tipo: "Todos", asc: null };
  var DEFAULT = ["paris", "arquivo-x", "huncho-jack", "chainsaw-man"];
  var page;

  function cards() {
    var q = s.q.toLowerCase();
    var list = D.artists.filter(function (a) { return (s.tipo === "Todos" || a.tipo === s.tipo) && (!q || (a.nome + " " + a.desc).toLowerCase().indexOf(q) >= 0); });
    if (s.asc !== null) list = list.slice().sort(function (a, b) { var r = a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" }); return s.asc ? r : -r; });
    
    if (!list.length) return '<p class="small muted empty card">Nenhum artista encontrado.</p>';
    return list.map(function (a, i) {
      var on = page.selected === a.id;
      return '<button class="artist-card stagger' + (on ? " is-active" : "") + '" style="--i:' + i + '" data-artist="' + a.id + '" aria-pressed="' + on + '"><span class="artist-ini">' + a.ini + '</span><span class="grow"><b class="artist-name">' + c.esc(a.nome) + '</b><span class="tiny muted">' + c.esc(a.desc) + '</span><span class="link artist-link">Ver álbuns e faixas</span></span><span class="row-arrow">' + c.icon("arrow") + "</span></button>";
    }).join("");
  }
  function disco() {
    var a = page.selected && D.artists.filter(function (x) { return x.id === page.selected; })[0];
    var ids = a ? a.albums : DEFAULT;
    return ids.map(function (id, i) { return c.albumCard(D.album(id), i); }).join("");
  }

  page = {
    title: "Artistas",
    selected: null,
    render: function () {
      var a = page.selected && D.artists.filter(function (x) { return x.id === page.selected; })[0];
      return c.head('<span class="mark">Pes</span>soas por trás das faixas', "Artistas &amp; universos", "Explore por discografia, colaborações e atmosfera; cada artista leva de volta aos álbuns da coleção.") +
        '<div class="filterbar"><label class="input-ico">' + c.icon("search") + '<input class="input" id="arQ" placeholder="Buscar artista..." value="' + c.esc(s.q) + '" aria-label="Buscar artista"></label>' + c.chips(["Todos", "Bandas", "Solo", "Compositores"], s.tipo, "data-atipo") + '<button class="link" id="arSort">Ordenar: ' + (s.asc === false ? "Z–A" : "A–Z") + "</button></div>" +
        '<div class="artist-grid" id="arGrid">' + cards() + "</div>" +
        '<div class="section-head"><div><h2 class="section-title">Discografias em destaque</h2><p class="small muted" id="discoSub">' + (a ? "Álbuns de " + c.esc(a.nome) + " na sua coleção" : "Seleção cruzada da sua coleção atual") + "</p></div><div class=\"row\">" + (a ? '<button class="link" id="arClear">Ver todos</button>' : "") + c.link("Abrir biblioteca", "#/biblioteca") + "</div></div>" +
        '<div class="album-grid" id="discoGrid">' + disco() + "</div>";
    },
    init: function (root) {
      root.querySelector("#arQ").addEventListener("input", function (e) { s.q = e.target.value; root.querySelector("#arGrid").innerHTML = cards(); });
      root.querySelector("#arSort").addEventListener("click", function () { s.asc = s.asc === null ? true : !s.asc; this.textContent = "Ordenar: " + (s.asc === false ? "Z–A" : "A–Z"); root.querySelector("#arGrid").innerHTML = cards(); });
      root.addEventListener("click", function (e) {
        var t = e.target.closest("[data-atipo]");
        if (t) { s.tipo = t.dataset.atipo; root.querySelectorAll("[data-atipo]").forEach(function (b) { var on = b === t; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }); root.querySelector("#arGrid").innerHTML = cards(); }
        var a = e.target.closest("[data-artist]");
        if (a) { page.selected = page.selected === a.dataset.artist ? null : a.dataset.artist; B.Router.render(); setTimeout(function () { var g = document.getElementById("discoGrid"); if (g && page.selected) g.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60); }
        if (e.target.closest("#arClear")) { page.selected = null; B.Router.render(); }
      });
    }
  };
  B.pages.artistas = page;
})(window.Batuque);
