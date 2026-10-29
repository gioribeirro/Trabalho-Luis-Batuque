(function (B) {
  var c = B.c, D = B.data, st = B.store.state, P = B.Player;
  var N = 72, editing = false, root = null;
  var heights = []; (function () { var s = 7; for (var i = 0; i < N; i++) { s = (s * 9301 + 49297) % 233280; var r = s / 233280; heights.push(25 + Math.round((Math.sin(i / 3.2) * 0.5 + 0.5) * 50 + r * 25)); } })();
  var TAGS = { "Metalcore / Rock": ["Rock", "Intenso"], "Metalcore": ["Metalcore", "Intenso"], "Rap / Trap": ["Rap", "Noturno"], "UK Rap": ["UK Rap", "Foco"], "Hip-hop": ["Hip-hop", "Energia alta"], "Trilha sonora": ["Trilha", "Cinematográfico"] };

  function queueHtml() {
    if (!P.queue.length) return '<p class="small muted empty">A fila está vazia. Toque um álbum para começar.</p>';
    return P.queue.map(function (id, i) {
      var t = P.T(id), a = D.album(t.albumId);
      return '<div class="queue-item" data-q="' + id + '"><button class="queue-main" data-qplay="' + id + '" aria-label="Tocar ' + c.esc(t.titulo) + '">' + c.cover(a, "cover--q") + '<span class="grow ellipsis"><b>' + c.esc(t.titulo) + '</b><span class="tiny muted">' + c.esc(t.artista) + "</span></span></button>" +
        (editing ? '<span class="q-edit"><button class="icon-btn icon-btn--sm" data-qup="' + i + '" aria-label="Subir"' + (i === 0 ? " disabled" : "") + ">" + c.icon("up") + '</button><button class="icon-btn icon-btn--sm" data-qdel="' + i + '" aria-label="Remover">' + c.icon("trash") + "</button></span>" : '<span class="tiny muted">' + ("0" + (i + 1)).slice(-2) + "</span>") + "</div>";
    }).join("");
  }

  var page = {
    title: "Agora tocando",
    render: function () {
      var t = P.track, a = D.album(t.albumId), idx = a.faixas.concat(a.extra || []).indexOf(t) + 1;
      var tags = TAGS[a.generos] || ["Som", "Intenso"];
      return '<div class="np"><section class="card np__left"><p class="eyebrow" style="font-size:8.5px">Tocando agora · <span id="npIdx">' + ("0" + idx).slice(-2) + "/" + a.nFaixas + "</span></p>" +
        '<a href="#/album/' + a.id + '" id="npCoverLink">' + c.cover(a, "cover--xl") + '</a><h1 class="np__title" id="npTitle">' + c.esc(t.titulo) + '</h1><p class="small muted" id="npSub">' + c.esc(t.artista + " · " + a.titulo) + '</p><div class="chips" id="npTags" style="justify-content:center">' + tags.map(function (g) { return '<span class="tag">' + g + "</span>"; }).join("") + "</div>" +
        '<span class="np__note accent-text">' + c.icon("note") + '</span><div class="np__session"><p class="eyebrow" style="font-size:8.5px">Sessão de escuta</p><p class="np__session-t">Cores, capas e contexto sem sair da reprodução.</p></div></section>' +
        '<section class="np__center"><p class="eyebrow">Sua sessão de escuta</p><h1 class="page-title" style="font-size:30px">Deixe o som conduzir.</h1><p class="tiny muted">Controles diretos, contexto da faixa e acesso à fila.</p>' +
        '<div class="card wave-card"><div class="wave" id="wave" role="slider" tabindex="0" aria-label="Posição na faixa">' + heights.map(function (h, i) { return '<i style="height:' + h + "%;--k:" + i + '"></i>'; }).join("") + "</div></div>" +
        '<div class="progress-row np__prog"><span id="npTime"></span><div class="progress" id="npBar" role="slider" tabindex="0" aria-label="Progresso"><span class="progress__win" id="npWin"></span><span class="progress__fill" id="npFill"></span><span class="progress__thumb" id="npThumb"></span></div><span id="npDur"></span></div>' +
        '<div class="controls np__controls"><button class="ctrl" id="npShuf" aria-label="Aleatório" aria-pressed="false">' + c.icon("shuffle") + '</button><button class="ctrl" id="npPrev" aria-label="Anterior">' + c.icon("prev") + '</button><button class="ctrl-main ctrl-main--xl" id="npPlay" aria-label="Tocar/pausar"></button><button class="ctrl" id="npNext" aria-label="Próxima">' + c.icon("next") + '</button><button class="ctrl" id="npRep" aria-label="Repetir" aria-pressed="false">' + c.icon("repeat") + "</button></div>" +
        '<div class="card card--pad about"><h2 class="panel-title">Sobre esta faixa</h2><p class="tiny muted">Uma área para notas de escuta, créditos básicos e relações com outras faixas.</p><hr><p class="eyebrow" style="font-size:8.5px">Detalhes de escuta</p><b class="small" style="display:block;margin:10px 0 8px">O que chamou sua atenção?</b><p class="tiny muted" style="max-width:300px">Escreva uma nota curta sobre a produção, a letra ou o momento em que esta faixa funciona melhor.</p>' +
        '<div class="row" style="margin-top:20px;flex-wrap:wrap"><button class="btn" id="npFav"></button><button class="btn" id="npNote">Anotar uma ideia</button><button class="btn" id="npAdd">Adicionar à lista</button></div><div id="noteBox" hidden><textarea class="textarea" id="noteText" maxlength="400" placeholder="Ex.: o refrão entra depois do silêncio..." style="margin-top:14px"></textarea><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn btn--primary" id="noteSave">Salvar nota</button></div></div></div></section>' +
        '<aside class="card np__queue"><div class="row between"><h2 class="section-title" style="font-size:15px">Na fila</h2>' + c.link(editing ? "Concluir" : "Editar", null, 'id="qEdit"') + '</div><p class="tiny muted">Próximas faixas desta sessão.</p><div id="queue" class="queue">' + queueHtml() + '</div><button class="btn btn--block" id="qClear">Limpar fila</button></aside></div>';
    },
    init: function (r) {
      root = r;
      var lastId = P.track.id;
      B.app.bindSeek(r.querySelector("#npBar"));
      var wave = r.querySelector("#wave");
      function waveSeek(e) { var b = wave.getBoundingClientRect(); P.seekRatio(Math.min(1, Math.max(0, (e.clientX - b.left) / b.width))); }
      wave.addEventListener("pointerdown", function (e) { waveSeek(e); wave.setPointerCapture(e.pointerId); wave.onpointermove = waveSeek; });
      wave.addEventListener("pointerup", function () { wave.onpointermove = null; });
      wave.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); P.seekRatio(Math.min(1, Math.max(0, (P.time + (e.key === "ArrowRight" ? 5 : -5)) / P.duration()))); } });
      r.querySelector("#npPlay").onclick = P.toggle;
      r.querySelector("#npPrev").onclick = P.prev;
      r.querySelector("#npNext").onclick = function () { P.next(); };
      r.querySelector("#npShuf").onclick = function () { P.shuffle = !P.shuffle; P.emit(); B.ui.toast(P.shuffle ? "Aleatório ligado" : "Aleatório desligado"); };
      r.querySelector("#npRep").onclick = function () { P.repeat = !P.repeat; P.emit(); B.ui.toast(P.repeat ? "Repetir ligado" : "Repetir desligado"); };
      r.querySelector("#npFav").onclick = function () { P.toggleFav(); var b = r.querySelector("#npFav"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); B.ui.toast(P.isFav() ? "Faixa favoritada" : "Removida dos favoritos"); };
      r.querySelector("#npNote").onclick = function () { var bx = r.querySelector("#noteBox"); bx.hidden = !bx.hidden; r.querySelector("#noteText").value = st.trackNotes[P.track.id] || ""; if (!bx.hidden) r.querySelector("#noteText").focus(); };
      r.querySelector("#noteSave").onclick = function () { st.trackNotes[P.track.id] = r.querySelector("#noteText").value.trim(); B.store.save(); r.querySelector("#noteBox").hidden = true; B.ui.toast("Nota salva"); };
      r.querySelector("#npAdd").onclick = function () { var ids = (st.playlistTracks || D.album("conglomerate").faixas.map(function (f) { return f.id; })).slice(); if (ids.indexOf(P.track.id) < 0) { ids.push(P.track.id); B.store.set("playlistTracks", ids); B.ui.toast("Adicionada a “" + (st.playlistMeta ? st.playlistMeta.nome : D.playlist.nome) + "”"); } else B.ui.toast("A faixa já está na lista"); };
      r.querySelector("#qEdit").onclick = function () { editing = !editing; this.textContent = editing ? "Concluir" : "Editar"; r.querySelector("#queue").innerHTML = queueHtml(); };
      r.querySelector("#qClear").onclick = function () { P.queue = []; P.saveQueue(); r.querySelector("#queue").innerHTML = queueHtml(); B.ui.toast("Fila limpa"); };
      r.querySelector("#queue").addEventListener("click", function (e) {
        var p = e.target.closest("[data-qplay]"); if (p && !editing) { P.playTrackFromQueue(p.dataset.qplay); return; }
        var u = e.target.closest("[data-qup]"); if (u) { var i = +u.dataset.qup; var x = P.queue[i]; P.queue[i] = P.queue[i - 1]; P.queue[i - 1] = x; P.saveQueue(); r.querySelector("#queue").innerHTML = queueHtml(); }
        var d = e.target.closest("[data-qdel]"); if (d) { P.queue.splice(+d.dataset.qdel, 1); P.saveQueue(); r.querySelector("#queue").innerHTML = queueHtml(); }
      });
      page._last = lastId;
      page.sync();
    },
    sync: function () {
      if (!root || !document.body.contains(root.querySelector && root.querySelector("#wave"))) return;
      var q = function (s) { return root.querySelector(s); };
      if (page._last !== P.track.id) { page._last = P.track.id; var y = q(".np").parentNode.parentNode.scrollTop; B.Router.render(); return; }
      var d = P.duration(), ratio = P.time / d, bars = q("#wave").children, k = Math.floor(ratio * N);
      for (var i = 0; i < N; i++) bars[i].classList.toggle("on", i <= k);
      q("#wave").classList.toggle("is-playing", P.playing);
      q("#npTime").textContent = P.fmt(P.time); q("#npDur").textContent = P.fmt(d);
      q("#npFill").style.width = ratio * 100 + "%"; q("#npThumb").style.left = ratio * 100 + "%";
      q("#npWin").style.left = (P.start / d * 100) + "%"; q("#npWin").style.width = ((P.end() - P.start) / d * 100) + "%";
      q("#npPlay").innerHTML = c.icon(P.playing ? "pause" : "play");
      q("#npShuf").classList.toggle("is-on", P.shuffle); q("#npShuf").setAttribute("aria-pressed", P.shuffle);
      q("#npRep").classList.toggle("is-on", P.repeat); q("#npRep").setAttribute("aria-pressed", P.repeat);
      var fav = P.isFav(); q("#npFav").textContent = fav ? "Favoritada ♥" : "Favoritar"; q("#npFav").classList.toggle("is-done", fav);
      var qe = q("#queue"); if (qe && qe.children.length !== Math.max(1, P.queue.length) && !editing) qe.innerHTML = queueHtml();
    },
    leave: function () { root = null; }
  };
  B.pages["agora-tocando"] = page;
})(window.Batuque);
