(function (B) {
  var c = B.c, D = B.data;
  var TABS = {
    "Para você": { hero: "trauma", n: "01", texto: "Um mergulho no rock alternativo de I Prevail: faixas intensas, contrastes cinematográficos e refrões que ficam na cabeça.", albums: ["paris", "huncho-jack", "jobs-not-done", "arquivo-x"] },
    "Novidades": { hero: "arquivo-x", n: "06", texto: "O novo arquivo de BLXCK: rap noturno, batidas secas e registros que pedem escuta com fone.", albums: ["arquivo-x", "paris", "jobs-not-done", "conglomerate"] },
    "Sua semana": { hero: "chainsaw-man", n: "08", texto: "A trilha de kensuke ushio que mais voltou na sua semana: delicadeza, tensão e cenas que continuam depois do fim.", albums: ["chainsaw-man", "renovate", "conglomerate", "trauma"] }
  };
  var tab = "Para você";

  function hero(t) {
    var a = D.album(t.hero);
    return '<section class="hero card fade-swap"><div class="hero__copy"><p class="eyebrow eyebrow--accent">Escuta em destaque</p><h2 class="hero__title">Encontre o som que fica.</h2>' +
      '<p class="hero__text">' + t.texto + '</p><div class="row hero__btns"><button class="btn btn--primary btn--lg" data-hero-play="' + a.id + '">Ouvir agora</button><a class="btn btn--lg" href="#/album/' + a.id + '">Ver álbum</a></div></div>' +
      '<div class="hero__art"><a href="#/album/' + a.id + '" aria-label="Abrir ' + c.esc(a.titulo) + '">' + c.cover(a, "cover--hero") + '</a><span class="tiny muted hero__cap">EDIÇÃO EM DESTAQUE / ' + a.ano + '</span><span class="tiny muted hero__count">' + t.n + " — 08</span></div></section>";
  }
  function grid(t) { return t.albums.map(function (id, i) { return c.albumCard(D.album(id), i); }).join(""); }

  B.pages.inicio = {
    title: "Início",
    render: function () {
      var t = TABS[tab];
      return c.head("Seu radar musical · Edição 08", "O que combina com seu agora?", "Descubra, organize e registre os álbuns que merecem voltar para o replay.", c.chips(Object.keys(TABS), tab, "data-tab")) +
        '<div id="heroSlot">' + hero(t) + "</div>" +
        c.sectionHead("Continue de onde parou", "Três caminhos rápidos para voltar à escuta", c.link("Abrir player", "#/agora-tocando")) +
        '<div class="continue-grid">' + ["trauma", "renovate", "chainsaw-man"].map(function (id, i) { return c.continueCard(D.album(id), i); }).join("") + "</div>" +
        c.sectionHead("Álbuns para explorar", "Uma seleção de oito pontos de partida", c.link("Abrir biblioteca", "#/biblioteca")) +
        '<div class="album-grid" id="exploreGrid">' + grid(t) + "</div>";
    },
    init: function (root) {
      root.querySelector(".page-head").classList.add("page-head--home");
      root.addEventListener("click", function (e) {
        var tb = e.target.closest("[data-tab]");
        if (tb) {
          tab = tb.dataset.tab;
          root.querySelectorAll("[data-tab]").forEach(function (b) { var on = b === tb; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
          root.querySelector("#heroSlot").innerHTML = hero(TABS[tab]);
          root.querySelector("#exploreGrid").innerHTML = grid(TABS[tab]);
          B.ui.markPlaying();
        }
        var hp = e.target.closest("[data-hero-play]");
        if (hp) B.Player.play(hp.dataset.heroPlay);
      });
    }
  };
})(window.Batuque);
