(function (B) {
  var c = B.c, D = B.data, st = B.store.state, P = B.Player;
  var ORDER = ["trauma", "renovate", "paris", "huncho-jack", "jobs-not-done", "arquivo-x", "chainsaw-man", "conglomerate"];
  var active = {};

  function related(id) {
    var base = ["paris", "huncho-jack"].concat(ORDER);
    var out = [];
    base.forEach(function (x) { if (x !== id && out.indexOf(x) < 0 && out.length < 2) out.push(x); });
    return out.map(D.album);
  }
  function useCover(a) {
    var pc = st.pageColor[a.id];
    return st.inheritCover && pc !== "global";
  }
  function applyColor(a) { if (useCover(a)) B.Theme.applyAlbumAccent(a.corDestaque); else B.Theme.resetAccent(); }
  function firstMetric(a) { return a.id === "arquivo-x" ? "Álbum" : c.faixasLabel(a); }

  function trackRows(a) {
    var act = active[a.id] || a.faixas[0].id;
    return a.faixas.map(function (t, i) {
      var r = st.trackRatings[t.id] || 0;
      return '<div class="table__row' + (t.id === act ? " is-active" : "") + '" data-track="' + t.id + '" data-track-row tabindex="0" aria-label="Tocar ' + c.esc(t.titulo) + '" style="grid-template-columns:28px minmax(160px,2fr) 1.4fr 96px 44px">' +
        '<span class="num"><span>' + ("0" + (i + 1)).slice(-2) + "</span>" + c.icon("play") + c.eq() + "</span>" +
        '<span class="cell-main">' + c.cover(a, "cover--track") + '<span class="ellipsis"><b>' + c.esc(t.titulo) + '</b><span class="tiny">' + c.esc(a.titulo) + "</span></span></span>" +
        '<span class="muted ellipsis">' + c.esc(t.artista) + "</span>" +
        '<span class="track-rate">' + c.stars(r, { interactive: true, attr: 'data-rate-track="' + t.id + '"' }) + "</span>" +
        '<span class="muted" style="text-align:right">' + t.dur + "</span></div>";
    }).join("");
  }

  B.pages.album = {
    title: function (id) { var a = D.album(id); return a ? a.titulo : "Álbum"; },
    render: function (id) {
      var a = D.album(id), saved = st.saved.indexOf(a.id) >= 0, my = st.albumRatings[a.id] || 0, pc = st.pageColor[a.id] === "global" ? "global" : "capa";
      var tipoUp = a.tipo.toUpperCase();
      return '<div class="album-top"><div><p class="eyebrow">Detalhes da coleção / ' + tipoUp + '</p><label class="row album-pick"><span class="small muted">Álbum em foco</span>' +
        '<select class="select" id="albumSel" aria-label="Álbum em foco">' + ORDER.map(function (x) { var b = D.album(x); return '<option value="' + x + '"' + (x === a.id ? " selected" : "") + ">" + c.esc(b.titulo + " — " + b.artista) + "</option>"; }).join("") + "</select></label></div>" +
        c.link("Voltar à biblioteca", "#/biblioteca") + "</div>" +

        '<section class="card album-main">' + c.cover(a, "cover--lg") +
        '<div class="album-info"><p class="eyebrow eyebrow--accent">' + tipoUp + " · " + a.ano + '</p><h1 class="album-title">' + c.esc(a.titulo) + '</h1><p class="album-artist">' + c.esc(a.artista) + "</p>" +
        '<p class="small muted">' + c.faixasLabel(a) + " &nbsp;·&nbsp; " + c.esc(a.generos) + '</p><p class="tiny muted album-iv">Identidade visual: <b class="accent-text">' + c.esc(a.identidadeVisual) + '</b></p><p class="tiny muted">Paleta automática inspirada nas cores da capa.</p>' +
        '<div class="row album-actions"><button class="btn btn--primary" data-play-album="' + a.id + '" id="albPlay">' + c.icon("play") + c.eq() + "<span>Reproduzir</span></button>" +
        '<button class="btn' + (saved ? " is-done" : "") + '" id="albSave" aria-pressed="' + saved + '">' + (saved ? "Salvo ✓" : "Salvar") + '</button><button class="btn" id="albPl">Playlist</button><button class="btn" id="albShare">Compartilhar</button></div>' +
        '<div class="my-rating"><span class="tiny muted">Sua nota</span>' + c.stars(my, { interactive: true, attr: 'id="myStars"' }) + '<span class="tiny" id="myVal">' + (my ? my.toFixed(1).replace(".", ",") : "—") + "</span></div></div>" +
        '<div class="album-side"><p class="eyebrow">Nota da comunidade</p><p class="community"><b>' + a.nota.toFixed(1).replace(".", ",") + '</b><span class="muted">/5</span></p>' + c.stars(a.nota) +
        '<p class="tiny muted" style="margin-top:6px">128 avaliações ilustrativas</p><hr><a class="btn" href="#/resenhas" id="albReview">Escrever resenha</a><p class="eyebrow" style="margin-top:20px">Cor da página</p>' +
        '<select class="select select--muted" id="pageColor" aria-label="Cor da página"' + (st.inheritCover ? "" : " disabled") + '><option value="capa"' + (pc === "capa" ? " selected" : "") + '>Da capa do álbum</option><option value="global"' + (pc === "global" ? " selected" : "") + ">Cor global</option></select>" +
        (st.inheritCover ? "" : '<p class="tiny muted" style="margin-top:6px">“Cor herdada da capa” está desligada nas Configurações.</p>') + "</div></section>" +

        '<div class="stat-cards album-metrics"><div class="card"><p class="stat-num">' + firstMetric(a) + '</p><p class="tiny">Faixas</p></div><div class="card"><p class="stat-num">04:12</p><p class="tiny">Faixa em destaque*</p></div><div class="card"><p class="stat-num">128</p><p class="tiny">Notas*</p></div><div class="card"><p class="stat-num">76%</p><p class="tiny">Recomendariam*</p></div></div>' +

        '<div class="album-cols"><div>' + c.sectionHead("Lista de faixas", "Selecione uma faixa para tocar ou abrir opções") +
        '<div class="table"><div class="table__head" style="grid-template-columns:28px minmax(160px,2fr) 1.4fr 96px 44px"><span>#</span><span>Faixa</span><span>Artista</span><span class="tiny" style="text-transform:none">Sua nota</span><span style="text-align:right">Tempo</span></div><div id="trackRows">' + trackRows(a) + "</div></div></div>" +
        '<div class="album-panels"><div class="card card--pad"><h2 class="panel-title">Notas de escuta</h2><p class="tiny muted">Anote detalhes da produção, faixas favoritas e o que torna este álbum memorável.</p>' +
        '<button class="note-action" id="naReplay">' + c.icon("note", "accent-text") + '<span><b>Faixa para voltar</b><span class="tiny muted" id="replayLbl">' + (st.replay[a.id] ? "Marcada: " + c.esc(P.T(st.replay[a.id]).titulo) : "Marque a música que pede replay.") + "</span></span></button>" +
        '<a class="note-action" href="#/resenhas" id="naReview">' + c.icon("pencil", "accent-text") + '<span><b>Criar uma resenha</b><span class="tiny muted">Registre sua visão do álbum.</span></span></a>' +
        '<button class="note-action" id="naCollect">' + c.icon("plus", "accent-text") + '<span><b>Adicionar à coleção</b><span class="tiny muted" id="collectLbl">' + (saved ? "Já está na sua biblioteca." : "Guarde este álbum na biblioteca.") + "</span></span></button></div>" +
        '<div class="card card--pad"><h2 class="panel-title">Álbuns relacionados</h2><p class="tiny muted">Mais caminhos para continuar a escuta.</p>' + related(a.id).map(function (r) { return c.miniItem(r); }).join("") + "</div></div></div>" +
        '<p class="footnote">* Métricas e notas da comunidade são apenas exemplos visuais; não são dados reais.</p>';
    },
    init: function (root, id) {
      var a = D.album(id);
      applyColor(a);
      root.querySelector("#albumSel").addEventListener("change", function (e) { location.hash = "#/album/" + e.target.value; });
      root.querySelector("#pageColor").addEventListener("change", function (e) { st.pageColor[a.id] = e.target.value; B.store.save(); applyColor(a); });

      var save = root.querySelector("#albSave");
      function setSaved(on) {
        var i = st.saved.indexOf(a.id); if (on && i < 0) st.saved.push(a.id); if (!on && i >= 0) st.saved.splice(i, 1); B.store.save();
        save.classList.toggle("is-done", on); save.textContent = on ? "Salvo ✓" : "Salvar"; save.setAttribute("aria-pressed", on);
        root.querySelector("#collectLbl").textContent = on ? "Já está na sua biblioteca." : "Guarde este álbum na biblioteca.";
      }
      save.addEventListener("click", function () { var on = st.saved.indexOf(a.id) < 0; setSaved(on); B.ui.toast(on ? "Salvo na biblioteca" : "Removido da biblioteca"); });
      root.querySelector("#naCollect").addEventListener("click", function () { setSaved(true); B.ui.toast("“" + a.titulo + "” está na sua coleção"); });
      root.querySelector("#albShare").addEventListener("click", function () { B.ui.copy(location.href.split("#")[0] + "#/album/" + a.id, "Link do álbum copiado"); });
      root.querySelector("#albPl").addEventListener("click", function () {
        var pls = [D.playlist.nome, "Peso com refrão", "Trilhas para imaginar cenas"];
        B.ui.modal("Adicionar à playlist", '<p class="small muted">Escolha onde guardar as faixas de “' + c.esc(a.titulo) + '”.</p>' + pls.map(function (p, i) { return '<button class="option-row" data-pl="' + i + '">' + c.icon("list") + "<span>" + c.esc(p) + "</span></button>"; }).join(""), "", function (m) {
          m.addEventListener("click", function (e) {
            var b = e.target.closest("[data-pl]"); if (!b) return;
            if (b.dataset.pl === "0") { var ids = st.playlistTracks || D.album("conglomerate").faixas.map(function (f) { return f.id; }); a.faixas.forEach(function (f) { if (ids.indexOf(f.id) < 0) ids.push(f.id); }); B.store.set("playlistTracks", ids); }
            B.ui.closeModal(); B.ui.toast("Adicionado a “" + pls[+b.dataset.pl] + "”");
          });
        });
      });
      root.querySelector("#albReview").addEventListener("click", function () { st.draft.albumId = a.id; B.store.save(); });
      root.querySelector("#naReview").addEventListener("click", function () { st.draft.albumId = a.id; B.store.save(); });
      root.querySelector("#naReplay").addEventListener("click", function () {
        var tid = active[a.id] || a.faixas[0].id; st.replay[a.id] = tid; B.store.save();
        root.querySelector("#replayLbl").textContent = "Marcada: " + P.T(tid).titulo; B.ui.toast("Faixa marcada para replay");
      });

      var my = root.querySelector("#myStars");
      B.ui.bindStars(my, function (n) { st.albumRatings[a.id] = n; B.store.save(); root.querySelector("#myVal").textContent = n.toFixed(1).replace(".", ","); B.ui.toast("Sua nota: " + n + " estrela" + (n > 1 ? "s" : "")); });
      root.querySelectorAll("[data-rate-track]").forEach(function (el) {
        B.ui.bindStars(el, function (n) { st.trackRatings[el.dataset.rateTrack] = n; B.store.save(); });
      });

      var rows = root.querySelector("#trackRows");
      function select(row, play) {
        active[a.id] = row.dataset.track;
        rows.querySelectorAll(".table__row").forEach(function (r) { r.classList.toggle("is-active", r === row); });
        if (play) { var t = P.T(row.dataset.track); var after = a.faixas.slice(a.faixas.indexOf(t) + 1).map(function (f) { return f.id; }); P.queue = after.concat(P.queue.filter(function (q) { return after.indexOf(q) < 0; })); P.saveQueue(); P.play(t); }
      }
      rows.addEventListener("click", function (e) { if (e.target.closest(".stars")) return; var r = e.target.closest("[data-track-row]"); if (r) select(r, true); });
      rows.addEventListener("keydown", function (e) { var r = e.target.closest("[data-track-row]"); if (r && e.key === "Enter") select(r, true); });
    },
    leave: function () { B.Theme.resetAccent(); }
  };
})(window.Batuque);
