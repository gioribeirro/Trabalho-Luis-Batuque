/* Avaliar artista (wireframe v2) — tudo simulado no navegador; o item "Resenhas" fica ativo na sidebar */
(function (B) {
  var c = B.c, D = B.data, st = B.store.state;
  var MAX = 1500;
  var CRIT = [
    ["identidade", "Identidade artística", "A personalidade e a direção musical"],
    ["repertorio", "Repertório", "Variedade e consistência das faixas"],
    ["producao", "Produção", "Arranjos, instrumentais e acabamento"],
    ["evolucao", "Evolução", "Mudanças e crescimento ao longo dos lançamentos"]
  ];
  var TIPS = ["Fale sobre aspectos específicos da música.", "Diferencie gosto pessoal de análise técnica.", "Mantenha a crítica respeitosa e construtiva."];
  var F = null;

  function media(cr) {
    var v = CRIT.map(function (k) { return cr[k[0]] || 0; }).filter(function (x) { return x > 0; });
    return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : 0;
  }
  function initial(id) {
    var done = st.artistRatings[id], dr = st.artistDrafts[id], src = dr || done;
    return {
      cr: src && src.criterios ? JSON.parse(JSON.stringify(src.criterios)) : {},
      texto: src ? src.texto || "" : "", vis: src ? src.visibilidade || "Pública" : "Pública", edit: !!done
    };
  }
  function crits() {
    return CRIT.map(function (k, i) {
      return '<div class="crit stagger" style="--i:' + i + '"><div class="grow"><b class="small">' + k[1] + '</b><p class="tiny muted">' + k[2] + "</p></div>" + c.stars(F.cr[k[0]] || 0, { interactive: true, attr: 'data-crit="' + k[0] + '"' }) + "</div>";
    }).join("");
  }
  function fmt(n) { return n ? c.fmtNota(n) : "—"; }

  B.pages["avaliar-artista"] = {
    title: "Avaliar artista",
    accent: function (id) { var a = D.getArtistById(id); return a && st.inheritCover ? a.cor : null; },
    render: function (id) {
      var a = D.getArtistById(id), s0 = initial(a.id);
      F = Object.assign({ a: a, tips: [] }, s0);
      return c.head("CADERNO DA COMUNIDADE", "Avaliar artista", "Registre sua opinião sobre a trajetória, o repertório e a identidade musical do artista.") +
        '<div class="av"><div class="stack-lg">' +
        '<section class="card card--pad av-sel"><p class="eyebrow">ARTISTA SELECIONADO</p><div class="row av-sel__row">' + c.artistTile(a, "sm") + '<div class="grow"><b class="av-sel__name">' + c.esc(a.nome) + '</b><p class="small muted">' + c.esc(a.generos) + '</p></div><button class="link" id="avSwap">Trocar artista</button></div></section>' +
        '<section class="card card--pad"><h2 class="section-title" style="font-size:16px">Sua avaliação</h2><p class="small muted">Escolha uma nota geral e depois detalhe o que mais chamou sua atenção.</p><div class="crit-list" id="avCrit">' + crits() + "</div>" +
        '<label class="field__label" for="avText" style="margin-top:18px">Sua resenha</label><textarea class="textarea av-text" id="avText" maxlength="' + MAX + '" placeholder="O que torna esse artista interessante para você?">' + c.esc(F.texto) + '</textarea><p class="tiny muted" id="avCount" style="text-align:right;margin-top:4px"></p></section></div>' +
        '<aside class="stack-lg"><section class="card card--pad"><p class="eyebrow">ANTES DE PUBLICAR</p><div class="checklist" id="avTips">' + TIPS.map(function (t, i) {
          return '<button type="button" class="check" aria-pressed="false" data-tip="' + i + '"><span class="check__dot">' + c.icon("check") + "</span><span>" + t + "</span></button>";
        }).join("") + '</div></section>' +
        '<section class="card card--pad"><p class="eyebrow">PRÉVIA DA PUBLICAÇÃO</p><div class="av-prev"><div><p class="tiny muted">Nota geral</p><p class="av-prev__n"><b id="avNota">' + fmt(media(F.cr)) + '</b><span class="muted"> / 5</span></p></div><span id="avStars">' + c.stars(media(F.cr)) + "</span></div>" +
        '<p class="tiny muted" style="margin:14px 0 6px">Visibilidade</p>' + c.chips(["Pública", "Privada"], F.vis, "data-vis") +
        '<p class="tiny muted" style="margin:14px 0">A publicação ficará vinculada ao seu perfil.</p><p class="tiny av-err" id="avErr" role="alert"></p>' +
        '<div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn" id="avDraft">Salvar rascunho</button><button class="btn btn--primary" id="avPub">' + (F.edit ? "Atualizar avaliação" : "Publicar avaliação") + "</button></div></section></aside></div>" +
        '<p class="footnote">Conteúdo de avaliação apresentado como demonstração de interface.</p>';
    },
    init: function (root, id) {
      if (!B.Session.requireLogin("#/avaliar-artista/" + encodeURIComponent(id))) return;
      var a = F.a, q = function (s) { return root.querySelector(s); }, shown = media(F.cr);
      var text = q("#avText");
      function count() { q("#avCount").textContent = text.value.length.toLocaleString("pt-BR") + " / 1.500 caracteres"; }
      count();
      text.addEventListener("input", function () { F.texto = text.value; count(); });
      function animateNota(to) {
        var el = q("#avNota"), from = shown, t0 = performance.now(); shown = to;
        q("#avStars").innerHTML = c.stars(to);
        if (!to || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(to); return; }
        (function step(n) { var p = Math.min(1, (n - t0) / 350), v = from + (to - from) * p; el.textContent = c.fmtNota(v); if (p >= 1) el.textContent = c.fmtNota(to); else requestAnimationFrame(step); })(t0);
      }
      root.querySelectorAll("[data-crit]").forEach(function (el) {
        B.ui.bindStars(el, function (n) { F.cr[el.dataset.crit] = n; q("#avErr").textContent = ""; animateNota(media(F.cr)); });
      });
      root.addEventListener("click", function (e) {
        var tip = e.target.closest("[data-tip]");
        if (tip) { var on = tip.getAttribute("aria-pressed") !== "true"; tip.setAttribute("aria-pressed", on); tip.classList.toggle("is-on", on); return; }
        var v = e.target.closest("[data-vis]");
        if (v) { F.vis = v.dataset.vis; root.querySelectorAll("[data-vis]").forEach(function (b) { var on = b === v; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }); return; }
        if (e.target.closest("#avDraft")) {
          st.artistDrafts[a.id] = { criterios: F.cr, texto: text.value, visibilidade: F.vis, data: Date.now() }; B.store.save(); B.ui.toast("Rascunho salvo"); return;
        }
        if (e.target.closest("#avPub")) {
          if (media(F.cr) === 0) { q("#avErr").textContent = "Marque ao menos uma estrela em algum critério para publicar."; return; }
          st.artistRatings[a.id] = { criterios: JSON.parse(JSON.stringify(F.cr)), nota: Math.round(media(F.cr) * 10) / 10, texto: text.value.trim(), visibilidade: F.vis, data: Date.now() };
          delete st.artistDrafts[a.id];
          st.activity.unshift({ tipo: "artista", id: a.id, t: Date.now() }); st.activity = st.activity.slice(0, 30);
          B.store.save(); B.ui.toast("Avaliação publicada"); location.hash = "#/artista/" + encodeURIComponent(a.id); return;
        }
        if (e.target.closest("#avSwap")) swap();
      });
      function swap() {
        var ap = { status: "idle", items: [] }, seq = 0;
        function list(qv) {
          var t = (qv || "").trim().toLowerCase(), cur = D.artists.filter(function (x) { return !t || (x.nome + " " + x.meta).toLowerCase().indexOf(t) >= 0; }), h = "";
          cur.forEach(function (x) { h += row(x); });
          if (t.length >= 2) {
            if (ap.status === "loading") h += '<p class="tiny muted" role="status">Buscando na Apple…</p>';
            else if (ap.status === "error") h += '<p class="tiny muted" role="alert">' + c.esc(ap.msg) + "</p>";
            else if (ap.status === "ok") h += ap.items.length ? '<p class="eyebrow" style="margin:8px 0 2px">Artistas na Apple</p>' + ap.items.map(row).join("") : '<p class="tiny muted">Nenhum artista encontrado na Apple.</p>';
          }
          return h || '<p class="small muted empty">Nenhum artista encontrado.</p>';
        }
        function row(x) { return '<button class="option-row" data-pick="' + c.esc(x.id) + '">' + c.artistTile(x, "xs") + '<span class="grow"><b class="small">' + c.esc(x.nome) + '</b><br><span class="tiny muted">' + c.esc(x.meta) + "</span></span></button>"; }
        B.ui.modal("Trocar artista", '<input class="input" id="swQ" placeholder="Buscar artista, banda ou compositor..." aria-label="Buscar artista"><div id="swList" class="add-list" style="margin-top:10px">' + list("") + "</div>", '<button class="btn" data-close>Cancelar</button>', function (w) {
          var go = B.Itunes.debounce(function () {
            var t = w.querySelector("#swQ").value.trim(); if (t.length < 2) return; var my = ++seq; ap = { status: "loading", items: [] }; w.querySelector("#swList").innerHTML = list(t);
            B.Itunes.searchArtists(t).then(function (r) { if (my !== seq) return; ap = { status: "ok", items: r.artists }; w.querySelector("#swList").innerHTML = list(t); },
              function (er) { if (my !== seq || (er && er.code === "cancelled")) return; ap = { status: "error", msg: B.Itunes.errorMessage(er) }; w.querySelector("#swList").innerHTML = list(t); });
          }, 500);
          w.querySelector("#swQ").addEventListener("input", function (e) { seq++; ap = { status: "idle", items: [] }; w.querySelector("#swList").innerHTML = list(e.target.value); go(); });
          w.addEventListener("click", function (e) { var b = e.target.closest("[data-pick]"); if (!b) return; B.ui.closeModal(); location.hash = "#/avaliar-artista/" + encodeURIComponent(b.dataset.pick); });
        });
      }
    },
    leave: function () { F = null; }
  };
})(window.Batuque);
