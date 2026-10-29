(function (B) {
  var c = B.c, D = B.data, st = B.store.state, P = B.Player;
  var tab = "Faixas";
  var COLS = "28px minmax(160px,2fr) 1.6fr 50px";

  function meta() { return st.playlistMeta || { nome: D.playlist.nome, descricao: D.playlist.descricao, privada: D.playlist.privada }; }
  function ids() { return st.playlistTracks || D.album("conglomerate").faixas.map(function (f) { return f.id; }); }
  function tracks() { return ids().map(P.T).filter(Boolean); }
  function row(t, i) {
    var a = D.album(t.albumId);
    var note = st.playlistToggles.notas ? '<span class="tiny accent-text" style="text-transform:none">' + c.esc(st.trackNotes[t.id] || "Salva pelo clima: " + (D.energy[t.titulo] ? "energia " + D.energy[t.titulo].toLowerCase() : "contraste")) + "</span>" : '<span class="tiny">' + c.esc(a.titulo) + "</span>";
    return '<div class="table__row' + (i === 0 ? " is-soft" : "") + '" data-track="' + t.id + '" data-pl-row tabindex="0" style="grid-template-columns:' + COLS + '"><span class="num"><span>' + ("0" + (i + 1)).slice(-2) + "</span>" + c.icon("play") + c.eq() + '</span><span class="cell-main">' + c.cover(a, "cover--track") +
      '<span class="ellipsis"><b>' + c.esc(t.titulo) + "</b>" + note + '</span></span><span class="muted ellipsis">' + c.esc(t.artista) + '</span><span class="muted" style="text-align:right">' + t.dur + "</span></div>";
  }
  function group(title, list, start) { return '<div class="table__group">' + c.esc(title) + "</div>" + list.map(function (t, i) { return row(t, start + i); }).join(""); }
  function body() {
    var list = tracks();
    if (st.playlistToggles.aleatorio && tab === "Faixas" && false) list = list;
    if (tab === "Faixas") {
      if (st.playlistToggles.porAlbum) {
        var by = {}, order = []; list.forEach(function (t) { if (!by[t.albumId]) { by[t.albumId] = []; order.push(t.albumId); } by[t.albumId].push(t); });
        if (order.length < 2) return list.map(row).join("");
        var n = 0; return order.map(function (id) { var h = group(D.album(id).titulo, by[id], n); n += by[id].length; return h; }).join("");
      }
      return list.map(row).join("");
    }
    if (tab === "Álbuns inteiros") {
      var al = []; list.forEach(function (t) { if (al.indexOf(t.albumId) < 0) al.push(t.albumId); });
      return al.map(function (id) { var a = D.album(id); return '<div class="table__row" data-album="' + a.id + '" style="grid-template-columns:' + COLS + '"><span class="num"><span>—</span></span><span class="cell-main">' + c.cover(a, "cover--track") + '<span><b>' + c.esc(a.titulo) + '</b><span class="tiny">' + c.faixasLabel(a) + '</span></span></span><span class="muted">' + c.esc(a.artista) + '</span><span class="row-arrow">' + c.icon("arrow") + "</span></div>"; }).join("");
    }
    var key = tab === "Por energia" ? function (t) { return "Energia " + (D.energy[t.titulo] || "Média").toLowerCase(); } : function (t) { return t.artista.split(",")[0]; };
    var g = {}, ord = []; list.forEach(function (t) { var k = key(t); if (!g[k]) { g[k] = []; ord.push(k); } g[k].push(t); });
    if (tab === "Por energia") ord.sort(function (a, b) { return ["Energia alta", "Energia média", "Energia baixa"].indexOf(a) - ["Energia alta", "Energia média", "Energia baixa"].indexOf(b); }); else ord.sort();
    var n = 0; return ord.map(function (k) { var h = group(k, g[k], n); n += g[k].length; return h; }).join("");
  }
  function playOrder() {
    var list = tracks().slice();
    if (st.playlistToggles.aleatorio) {
      for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = list[i]; list[i] = list[j]; list[j] = x; }
      for (var k = 1; k < list.length; k++) if (list[k].artista === list[k - 1].artista) for (var m = k + 1; m < list.length; m++) if (list[m].artista !== list[k - 1].artista) { var y = list[k]; list[k] = list[m]; list[m] = y; break; }
    }
    return list;
  }

  B.pages.playlists = {
    title: "Playlists e listas",
    render: function () {
      var m = meta(), cg = D.album("conglomerate");
      return c.head('<span class="mark">Col</span>eções com contexto', "Playlists e listas", "Organize por clima, ocasião ou ideia — sem perder a relação entre faixas e álbuns.") +
        '<section class="card pl-head">' + c.cover(cg, "cover--pl") + '<div class="grow"><p class="eyebrow eyebrow--accent" style="font-size:8.5px">Playlist editorial · ' + (m.privada ? "Privada" : "Pública") + '</p><h2 class="pl-title">' + c.esc(m.nome) + '</h2><p class="tiny muted pl-desc">' + c.esc(m.descricao) + '</p><p class="tiny muted">' + (ids().length + 10) + " faixas · 1h 06min* · Atualizada hoje</p></div>" +
        '<div class="pl-btns"><button class="btn btn--primary" id="plPlayAll">Reproduzir</button><button class="btn" id="plEdit">Editar lista</button><button class="btn" id="plShare">Compartilhar</button></div></section>' +
        '<div class="row between" style="margin:18px 0 16px">' + c.chips(["Faixas", "Álbuns inteiros", "Por energia", "Por artista"], tab, "data-ptab") + c.link("+ Adicionar faixas", null, 'id="plAdd"') + "</div>" +
        '<div class="album-cols"><div class="table"><div class="table__head" style="grid-template-columns:' + COLS + '"><span>#</span><span>Faixa</span><span>Artista</span><span style="text-align:right">Tempo</span></div><div id="plBody" class="fade-swap">' + body() + "</div></div>" +
        '<aside class="card card--pad pl-filters"><h2 class="panel-title">Filtros da lista</h2><p class="tiny muted">Refine sem complicar.</p>' +
        [["porAlbum", "Separar por álbum", "Mostra as faixas agrupadas"], ["aleatorio", "Modo aleatório inteligente", "Evita repetir artistas seguidos"], ["notas", "Mostrar notas pessoais", "Exibe seu motivo para salvar"]].map(function (t) {
          return '<div class="set-row"><div class="grow"><b class="small">' + t[1] + '</b><p class="tiny muted">' + t[2] + "</p></div>" + c.toggle(t[0], st.playlistToggles[t[0]], t[1]) + "</div>";
        }).join("") + '<p class="eyebrow" style="margin:18px 0 6px">Playlists relacionadas</p>' + c.miniItem(D.album("trauma"), "13 faixas · Coleção").replace("<b>TRAUMA</b>", "<b>Peso com refrão</b>") + c.miniItem(D.album("chainsaw-man"), "30 faixas · Coleção").replace("<b>Chainsaw Man: Reze Arc</b>", "<b>Trilhas para imaginar cenas</b>") + "</aside></div>";
    },
    init: function (root) {
      var bodyEl = root.querySelector("#plBody");
      function redraw() { bodyEl.classList.remove("fade-swap"); void bodyEl.offsetWidth; bodyEl.classList.add("fade-swap"); bodyEl.innerHTML = body(); B.ui.markPlaying(); }
      root.querySelector("#plPlayAll").addEventListener("click", function () { var l = playOrder(); P.queue = l.slice(1).map(function (t) { return t.id; }).concat(P.queue.filter(function (q) { return !l.some(function (t) { return t.id === q; }); })); P.saveQueue(); P.play(l[0]); B.ui.toast("Tocando “" + meta().nome + "”"); });
      root.querySelector("#plShare").addEventListener("click", function () { B.ui.copy(location.href.split("#")[0] + "#/playlists", "Link da playlist copiado"); });
      root.querySelector("#plEdit").addEventListener("click", function () {
        var m = meta();
        B.ui.modal("Editar lista", '<label><span class="field-label">Nome</span><input class="input" id="peNome" maxlength="60" value="' + c.esc(m.nome) + '"></label><label><span class="field-label">Descrição</span><textarea class="textarea" id="peDesc" maxlength="240">' + c.esc(m.descricao) + '</textarea></label><div class="set-row"><div class="grow"><b class="small">Lista privada</b><p class="tiny muted">Só você pode ver.</p></div>' + c.toggle("pePriv", m.privada, "Lista privada") + "</div>",
          '<button class="btn" data-close>Cancelar</button><button class="btn btn--primary" id="peSave">Salvar</button>', function (w) {
            w.querySelector("[data-toggle=pePriv]").addEventListener("click", function () { this.setAttribute("aria-checked", String(this.getAttribute("aria-checked") !== "true")); });
            w.querySelector("#peSave").addEventListener("click", function () {
              var nome = w.querySelector("#peNome").value.trim(); if (!nome) { w.querySelector("#peNome").focus(); return; }
              B.store.set("playlistMeta", { nome: nome, descricao: w.querySelector("#peDesc").value.trim(), privada: w.querySelector("[data-toggle=pePriv]").getAttribute("aria-checked") === "true" });
              B.ui.closeModal(); B.Router.render(); B.ui.toast("Lista atualizada");
            });
          });
      });
      root.querySelector("#plAdd").addEventListener("click", function () {
        function list(q) {
          var cur = ids(); q = (q || "").toLowerCase();
          return B.data.allTracks().filter(function (t) { return !q || (t.titulo + " " + t.artista).toLowerCase().indexOf(q) >= 0; }).slice(0, 30).map(function (t) {
            var on = cur.indexOf(t.id) >= 0;
            return '<button class="option-row" data-add="' + t.id + '"' + (on ? " disabled" : "") + ">" + c.cover(D.album(t.albumId), "cover--xs") + '<span class="grow"><b class="small">' + c.esc(t.titulo) + '</b><br><span class="tiny muted">' + c.esc(t.artista) + "</span></span>" + c.icon(on ? "check" : "plus") + "</button>";
          }).join("");
        }
        B.ui.modal("Adicionar faixas", '<input class="input" id="addQ" placeholder="Buscar faixas..." aria-label="Buscar faixas"><div id="addList" class="add-list">' + list() + "</div>", '<button class="btn btn--primary" data-close>Concluir</button>', function (w) {
          w.querySelector("#addQ").addEventListener("input", function (e) { w.querySelector("#addList").innerHTML = list(e.target.value); });
          w.addEventListener("click", function (e) {
            var b = e.target.closest("[data-add]"); if (!b || b.disabled) return;
            var cur = ids().slice(); cur.push(b.dataset.add); B.store.set("playlistTracks", cur);
            b.disabled = true; b.querySelector(".ico:last-child").outerHTML = c.icon("check"); redraw(); B.ui.toast("Faixa adicionada");
          });
        });
      });
      root.addEventListener("click", function (e) {
        var tb = e.target.closest("[data-ptab]");
        if (tb) { tab = tb.dataset.ptab; root.querySelectorAll("[data-ptab]").forEach(function (b) { var on = b === tb; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }); redraw(); }
        var tg = e.target.closest(".pl-filters [data-toggle]");
        if (tg) { var k = tg.dataset.toggle; st.playlistToggles[k] = !st.playlistToggles[k]; B.store.save(); tg.setAttribute("aria-checked", st.playlistToggles[k]); redraw(); }
        var r = e.target.closest("[data-pl-row]");
        if (r) P.play(P.T(r.dataset.track));
      });
      bodyEl.addEventListener("keydown", function (e) { var r = e.target.closest("[data-pl-row]"); if (r && e.key === "Enter") P.play(P.T(r.dataset.track)); });
    }
  };
})(window.Batuque);
