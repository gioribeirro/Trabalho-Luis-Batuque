(function (B) {
  var c = B.c, D = B.data, st = B.store.state;
  var DEF_ROT = ["trauma", "chainsaw-man", "conglomerate", "jobs-not-done"];
  function demo() { return !B.stats.plays().length && !(st.visited || []).length && !st.activity.length; }
  function pubArtistRatings() { return Object.keys(st.artistRatings).filter(function (k) { return st.artistRatings[k].visibilidade === "Pública"; }).length; }
  function counters() {
    if (demo()) return [[128, "Álbuns explorados*", 0], [42 + st.reviews.length, "Resenhas publicadas*", 0], [17, "Listas criadas*", 0], [6, "Dias seguidos ouvindo*", 2]];
    return [[B.stats.explored(), "Álbuns explorados", 0], [st.reviews.length + pubArtistRatings(), "Resenhas publicadas", 0], [1, "Listas criadas", 0], [B.stats.streak(), "Dias seguidos ouvindo", 2]];
  }
  function rotation() {
    var top = B.stats.byAlbum(B.stats.plays().filter(function (p) { return p.t > Date.now() - 30 * 864e5; })).slice(0, 4).map(function (x) { return x[0]; });
    return top.length ? top : (demo() ? DEF_ROT : (st.saved.filter(function (id) { return D.album(id); }).slice(0, 4)));
  }
  function taste() {
    var g = B.stats.genres().slice(0, 3);
    return g.length ? g : (demo() ? [["Rock / Metalcore", 73], ["Rap / Trap", 66], ["Trilhas sonoras", 38]] : []);
  }
  function rel(t) {
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return "Agora"; if (m < 60) return "Há " + m + " min"; var h = Math.round(m / 60); if (h < 24) return "Há " + h + (h === 1 ? " hora" : " horas");
    var d = Math.round(h / 24); return d === 1 ? "Ontem" : "Há " + d + " dias";
  }
  var LABEL = { resenha: "Resenha publicada", salvo: "Álbum salvo na biblioteca", playlist: "Playlist atualizada", artista: "Avaliação de artista" };
  function activityHtml() {
    if (demo()) return [["Resenha publicada", "trauma", "Há 2 horas"], [LABEL.salvo, "chainsaw-man", "Ontem"], [LABEL.playlist, "jobs-not-done", "Há 3 dias"]].map(function (r) {
      var a = D.album(r[1]); return '<a class="mini-item" href="#/album/' + a.id + '">' + c.cover(a, "cover--xs") + '<span class="grow"><b>' + r[0] + '</b><span class="tiny muted">' + c.esc(a.titulo) + '</span></span><span class="tiny muted">' + r[2] + "</span></a>";
    }).join("");
    var list = st.activity.slice(0, 3).map(function (x) {
      if (x.tipo === "artista") { var ar = D.getArtistById(x.id); if (!ar) return ""; return '<a class="mini-item" href="#/artista/' + encodeURIComponent(ar.id) + '">' + c.artistTile(ar, "xs") + '<span class="grow"><b>' + LABEL.artista + '</b><span class="tiny muted">' + c.esc(ar.nome) + '</span></span><span class="tiny muted">' + rel(x.t) + "</span></a>"; }
      var a = D.album(x.id); if (!a) return "";
      return '<a class="mini-item" href="#/album/' + c.esc(a.id) + '">' + c.cover(a, "cover--xs") + '<span class="grow"><b>' + (LABEL[x.tipo] || "Atividade") + '</b><span class="tiny muted">' + c.esc(a.titulo) + '</span></span><span class="tiny muted">' + rel(x.t) + "</span></a>";
    }).join("");
    return list || '<p class="small muted empty">Sua atividade aparece aqui.</p>';
  }

  B.pages.perfil = {
    title: "Perfil",
    render: function () {
      var p = st.profile, ini = B.app.renderAvatar();
      return '<p class="eyebrow">Seu arquivo pessoal</p><section class="card profile">' +
        '<div class="profile__banner"></div><div class="profile__body"><span class="profile__avatar">' + ini + '</span><div class="grow"><h1 class="profile__name">' + c.esc(p.nome) + '</h1><p class="tiny muted">@' + c.esc(p.usuario) + " · Membro desde " + p.desde + '</p><div class="chips" style="margin-top:8px">' +
        p.generos.map(function (g) { return '<span class="tag">' + c.esc(g) + "</span>"; }).join("") + '</div></div><div class="row"><button class="btn btn--lg" id="editProfile">Editar perfil</button><button class="btn btn--primary btn--lg" id="shareProfile">Compartilhar</button></div></div></section>' +
        '<div class="stat-cards" style="margin-top:16px">' + counters().map(function (s) {
          return '<div class="card"><p class="stat-num" data-count="' + s[0] + '" data-pad="' + s[2] + '">0</p><p class="tiny">' + s[1] + "</p></div>";
        }).join("") + "</div>" +
        c.sectionHead("Sua rotação atual", demo() ? "Exemplo de rotação — ouça faixas para ver a sua" : "Os álbuns que você mais ouviu recentemente", c.link("Ver histórico", null, 'id="histBtn"')) +
        '<div class="album-grid">' + rotation().map(function (id, i) { return c.albumCard(D.album(id), i); }).join("") + "</div>" +
        '<div class="two-col" style="margin-top:20px"><div class="card card--pad"><h2 class="panel-title">Resenhas recentes</h2><p class="tiny muted">Atividade pessoal resumida em uma única área.</p><div class="activity">' + activityHtml() + '</div></div><div class="card card--pad"><h2 class="panel-title">Seu gosto em perspectiva</h2><p class="tiny muted">' + (demo() ? "Exemplo até você gerar escuta." : "Gêneros mais frequentes no seu histórico.") + '</p><div data-grow style="margin-top:14px">' +
        taste().map(function (g) { return '<div class="bar-row bar-row--inline"><span class="muted">' + c.esc(g[0]) + '</span><div class="bar"><i style="--w:' + g[1] + '%"></i></div><b class="tiny">' + g[1] + " %</b></div>"; }).join("") + "</div></div></div>" +
        (demo() ? '<p class="footnote">* Valores de demonstração até você gerar atividade (tocar faixas, salvar álbuns, escrever resenhas).</p>' : "");
    },
    init: function (root) {
      B.ui.countUp(root); B.ui.growBars(root);
      root.querySelector("#histBtn").addEventListener("click", function () { location.hash = "#/estatisticas"; });
      root.querySelector("#editProfile").addEventListener("click", function () {
        var p = st.profile, all = ["Rock alternativo", "Rap", "Trilhas", "Metalcore", "UK Rap", "Hip-hop"];
        B.ui.modal("Editar perfil", '<label><span class="field-label">Nome</span><input class="input" id="pfNome" value="' + c.esc(p.nome) + '" maxlength="40"></label><label><span class="field-label">@usuário</span><input class="input" id="pfUser" value="' + c.esc(p.usuario) + '" maxlength="30"></label><div><span class="field-label">Gêneros</span>' + c.chips(all, p.generos, "data-pg", true) + '</div><p class="tiny" id="pfErr" style="color:var(--accent-text)"></p>',
          '<button class="btn" data-close>Cancelar</button><button class="btn btn--primary" id="pfSave">Salvar</button>', function (m) {
            var sel = p.generos.slice();
            m.addEventListener("click", function (e) {
              var g = e.target.closest("[data-pg]"); if (g) { var i = sel.indexOf(g.dataset.pg); if (i >= 0) sel.splice(i, 1); else sel.push(g.dataset.pg); g.classList.toggle("is-active", i < 0); g.setAttribute("aria-pressed", i < 0); }
              if (e.target.closest("#pfSave")) {
                var nome = m.querySelector("#pfNome").value.trim(), user = m.querySelector("#pfUser").value.trim().replace(/^@/, "").replace(/\s+/g, "");
                if (!nome || !user) { m.querySelector("#pfErr").textContent = "Preencha nome e @usuário."; return; }
                B.store.set("profile", { nome: nome, usuario: user, desde: p.desde, generos: sel });
                B.ui.closeModal(); B.Router.render(); B.ui.toast("Perfil atualizado");
              }
            });
          });
      });
      root.querySelector("#shareProfile").addEventListener("click", function () {
        var url = location.href.split("#")[0] + "#/perfil?u=" + st.profile.usuario;
        B.ui.modal("Compartilhar perfil", '<p class="small muted">Envie seu arquivo musical para amigos.</p><input class="input" readonly value="' + c.esc(url) + '" aria-label="Link do perfil">', '<button class="btn" data-close>Fechar</button><button class="btn btn--primary" id="copyLink">Copiar link</button>', function (m) {
          m.querySelector("#copyLink").addEventListener("click", function () { B.ui.copy(url, "Link do perfil copiado"); B.ui.closeModal(); });
        });
      });
    }
  };
})(window.Batuque);
