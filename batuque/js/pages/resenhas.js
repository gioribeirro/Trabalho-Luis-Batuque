(function (B) {
  var c = B.c, D = B.data, st = B.store.state;
  var tab = "Em destaque", MAX = 1500;

  function all() { return st.reviews.concat(D.reviews); }
  function item(r, i) {
    var a = D.album(r.albumId), saved = st.savedReviews.indexOf(r.id) >= 0;
    return '<div class="review-item stagger" style="--i:' + i + '"><a href="#/album/' + a.id + '">' + c.cover(a, "cover--review") + '</a><div class="grow"><b class="small">' + c.esc(r.titulo) + '</b><p class="tiny muted row" style="gap:6px">' + c.stars(r.nota) + " " + r.nota.toFixed(1).replace(".", ",") + " · " + (r.texto ? "por você" : "leitura rápida") + "</p></div>" +
      '<button class="fav-btn' + (saved ? " is-fav" : "") + '" data-save-review="' + r.id + '" aria-pressed="' + saved + '" aria-label="Salvar resenha">' + c.icon("heart") + "</button></div>";
  }
  function others() {
    var list = all();
    if (tab === "Mais recentes") list = list.slice().sort(function (a, b) { return b.data - a.data; });
    if (tab === "Salvas") list = list.filter(function (r) { return st.savedReviews.indexOf(r.id) >= 0; });
    if (tab === "Rascunhos") {
      var d = st.draft;
      return d.texto ? '<div class="review-item"><span class="icon-circle">' + c.icon("pencil") + '</span><div class="grow"><b class="small">Rascunho — ' + c.esc(D.album(d.albumId).titulo) + '</b><p class="tiny muted">' + c.esc(d.texto.slice(0, 80)) + (d.texto.length > 80 ? "…" : "") + '</p></div><button class="link" id="continueDraft">Continuar</button></div>' : '<p class="small muted empty">Nenhum rascunho salvo.</p>';
    }
    return list.length ? list.map(item).join("") : '<p class="small muted empty">Nada por aqui ainda.</p>';
  }

  B.pages.resenhas = {
    title: "Resenhas",
    render: function () {
      var t = D.album("trauma"), d = st.draft;
      var featured = tab === "Em destaque" || tab === "Mais recentes";
      return c.head('<span class="mark">Cad</span>erno crítico', "Resenhas", "Sua opinião em primeiro lugar: escreva com contexto, destaque pontos fortes e deixe tudo organizado.") +
        '<div class="row between" style="margin:-10px 0 18px">' + c.chips(["Em destaque", "Mais recentes", "Salvas", "Rascunhos"], tab, "data-rtab") + c.link("+ Nova resenha", null, 'id="newReview"') + "</div>" +
        '<div class="reviews-layout"><div class="stack-lg">' +
        (featured ? '<section class="card feat-review"><a href="#/album/trauma">' + c.cover(t, "cover--feat") + '</a><div><p class="eyebrow eyebrow--accent" style="font-size:8.5px">Resenha em destaque · 6 min de leitura</p><h2 class="feat-title">TRAUMA — quando o contraste vira linguagem</h2><p class="row tiny muted" style="gap:10px">' + c.stars(4.8) + "4,8 / 5</p>" +
          '<p class="tiny muted feat-text">Um disco que alterna peso e vulnerabilidade, usando a mudança de intensidade como parte da narrativa. A sequência também conta.</p><div class="chips">' + ["Produção", "Letras", "Dinâmica"].map(function (x) { return '<span class="tag">' + x + "</span>"; }).join("") + "</div></div></section>" +
          '<div class="two-col two-col--even"><div class="card card--pad"><h3 class="panel-title">O que funciona</h3><ul class="bullets"><li>Contraste entre faixas</li><li>Refrões marcantes</li><li>Atmosfera coesa</li></ul></div><div class="card card--pad"><h3 class="panel-title">Para observar</h3><ul class="bullets"><li>Variação de andamento</li><li>Transições do álbum</li><li>Repetição de fórmulas</li></ul></div></div>' : "") +
        '<form class="card card--pad review-form" id="reviewForm" novalidate><h2 class="section-title" style="font-size:15px">Escreva sua próxima resenha</h2><p class="tiny muted">Escolha um álbum e dê contexto à sua avaliação.</p>' +
        '<div class="row review-form__row"><select class="select select--muted" id="rvAlbum" aria-label="Escolher álbum"><option value="">Escolher álbum</option>' + D.albums.map(function (a) { return '<option value="' + a.id + '"' + (a.id === d.albumId ? " selected" : "") + ">" + c.esc(a.titulo) + "</option>"; }).join("") + "</select>" +
        '<span class="tiny muted">Sua nota</span>' + c.stars(d.nota, { interactive: true, attr: 'id="rvStars"' }) + '<span class="tiny" id="rvVal">' + d.nota.toFixed(1).replace(".", ",") + "</span></div>" +
        '<label class="sr-only" for="rvText">Texto da resenha</label><textarea class="textarea select--muted" id="rvText" maxlength="' + MAX + '" placeholder="Comece falando da primeira impressão...">' + c.esc(d.texto) + "</textarea>" +
        '<div class="row between"><p class="tiny muted" id="rvCount"></p><button class="btn btn--primary btn--lg">Publicar resenha</button></div><p class="tiny" id="rvErr" style="color:var(--accent-text)"></p></form></div>' +
        '<aside class="stack-lg"><div class="card card--pad"><h2 class="panel-title">Modelo de avaliação</h2><p class="tiny muted">Uma estrutura curta ajuda a transformar opinião em crítica clara.</p><div data-grow class="model-bars">' +
        [["Produção", 4.5], ["Composição", 4.2], ["Coesão", 4.0], ["Replay", 4.8]].map(function (m) { return '<div class="bar-row bar-row--inline"><span class="muted">' + m[0] + '</span><div class="bar"><i style="--w:' + (m[1] / 5 * 100) + '%"></i></div><b class="tiny">' + m[1].toFixed(1) + "</b></div>"; }).join("") +
        '</div><p class="tiny muted">Explique o motivo da nota com exemplos de faixas.</p></div><div class="card card--pad"><h2 class="panel-title">Outras resenhas</h2><p class="tiny muted">Leituras recentes da comunidade de exemplo.</p><div id="otherReviews">' + others() + "</div></div></aside></div>";
    },
    init: function (root) {
      B.ui.growBars(root);
      var text = root.querySelector("#rvText"), count = root.querySelector("#rvCount"), d = st.draft;
      function upd() { count.textContent = text.value.length.toLocaleString("pt-BR") + " / 1.500 caracteres · rascunho automático"; }
      upd();
      var tmr; text.addEventListener("input", function () { upd(); clearTimeout(tmr); tmr = setTimeout(function () { d.texto = text.value; B.store.save(); }, 300); });
      root.querySelector("#rvAlbum").addEventListener("change", function (e) { d.albumId = e.target.value; B.store.save(); });
      B.ui.bindStars(root.querySelector("#rvStars"), function (n) { d.nota = n; B.store.save(); root.querySelector("#rvVal").textContent = n.toFixed(1).replace(".", ","); });
      root.querySelector("#newReview").addEventListener("click", function () { var f = root.querySelector("#reviewForm"); f.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { text.focus(); }, 300); });
      root.querySelector("#reviewForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var err = root.querySelector("#rvErr"), alb = root.querySelector("#rvAlbum").value, tx = text.value.trim();
        if (!alb) { err.textContent = "Escolha um álbum para resenhar."; return; }
        if (tx.length < 20) { err.textContent = "Escreva pelo menos 20 caracteres."; text.focus(); return; }
        err.textContent = "";
        var a = D.album(alb);
        st.reviews.unshift({ id: "u" + Date.now(), titulo: a.titulo + ": " + tx.split(/[.!?\n]/)[0].slice(0, 40), albumId: alb, nota: d.nota, data: Date.now(), texto: tx });
        d.texto = ""; B.store.save();
        text.value = ""; upd();
        if (tab === "Rascunhos" || tab === "Salvas") tab = "Mais recentes";
        root.querySelector("#otherReviews").innerHTML = others();
        B.ui.toast("Resenha publicada");
      });
      root.addEventListener("click", function (e) {
        var tb = e.target.closest("[data-rtab]");
        if (tb) { tab = tb.dataset.rtab; B.Router.render(); return; }
        var sv = e.target.closest("[data-save-review]");
        if (sv) { var on = B.store.toggleIn("savedReviews", sv.dataset.saveReview); sv.classList.toggle("is-fav", on); sv.setAttribute("aria-pressed", on); sv.classList.remove("pop"); void sv.offsetWidth; sv.classList.add("pop"); if (tab === "Salvas") root.querySelector("#otherReviews").innerHTML = others(); B.ui.toast(on ? "Resenha salva" : "Resenha removida das salvas"); }
        if (e.target.closest("#continueDraft")) { text.focus(); text.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    }
  };
})(window.Batuque);
