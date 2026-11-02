/* Estatísticas — derivadas do histórico REAL de escuta (store.plays), sem back-end */
(function (B) {
  var c = B.c, D = B.data, st = B.store.state;
  var WD = [["S", "Segunda"], ["T", "Terça"], ["Q", "Quarta"], ["Q", "Quinta"], ["S", "Sexta"], ["S", "Sábado"], ["D", "Domingo"]];

  function dayKey(t) { var d = new Date(t); return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); }
  function weekStart() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
  function fmtTime(sec) { var m = Math.round(sec / 60); return m >= 60 ? Math.floor(m / 60) + "h " + (m % 60) + "m" : m + "m"; }

  /* Derivações compartilhadas com Perfil e Biblioteca */
  var S = B.stats = {
    plays: function () { return st.plays || []; },
    byAlbum: function (list) {
      var m = {}; (list || S.plays()).forEach(function (p) { m[p.albumId] = (m[p.albumId] || 0) + 1; });
      return Object.keys(m).map(function (k) { return [k, m[k]]; }).filter(function (x) { return D.album(x[0]); }).sort(function (a, b) { return b[1] - a[1]; });
    },
    genres: function () {
      var m = {}, tot = 0;
      S.plays().forEach(function (p) { var a = D.album(p.albumId); if (!a || !a.generos) return; m[a.generos] = (m[a.generos] || 0) + 1; tot++; });
      return Object.keys(m).map(function (k) { return [k, Math.round(m[k] / tot * 100)]; }).sort(function (a, b) { return b[1] - a[1]; });
    },
    streak: function () {
      var days = {}; S.plays().forEach(function (p) { days[dayKey(p.t)] = 1; });
      var n = 0, d = new Date(); if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);   // sequência ainda vale se hoje não terminou
      while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    minutesByDay: function () {
      var out = [0, 0, 0, 0, 0, 0, 0], ws = weekStart();
      S.plays().forEach(function (p) { if (p.t >= ws) out[(new Date(p.t).getDay() + 6) % 7] += p.seg || 0; });
      return out.map(function (s) { return Math.round(s / 60 * 10) / 10; });
    },
    monthSeconds: function () { var n = new Date(), m = n.getMonth(), y = n.getFullYear(); return S.plays().filter(function (p) { var d = new Date(p.t); return d.getMonth() === m && d.getFullYear() === y; }).reduce(function (a, p) { return a + (p.seg || 0); }, 0); },
    revisited: function () { var m = {}; S.plays().forEach(function (p) { (m[p.albumId] = m[p.albumId] || {})[dayKey(p.t)] = 1; }); return Object.keys(m).filter(function (k) { return Object.keys(m[k]).length >= 2; }).length; },
    explored: function () { var m = {}; S.plays().forEach(function (p) { m[p.albumId] = 1; }); (st.visited || []).forEach(function (id) { m[id] = 1; }); return Object.keys(m).length; }
  };

  function empty() {
    return '<div class="card card--pad empty-state" style="text-align:center;padding:48px 24px"><h2 class="section-title">Ainda não há escuta registrada</h2><p class="small muted" style="margin:8px 0 18px">Ouça algumas faixas para ver seus padrões aqui.</p><a class="btn btn--primary" href="#/descobrir">Ir para Descobrir</a>' +
      (st.listening.historico ? "" : '<p class="tiny muted" style="margin-top:14px">O histórico está desligado em Configurações (“Salvar histórico”).</p>') + "</div>";
  }

  B.pages.estatisticas = {
    title: "Estatísticas",
    render: function () {
      var head = c.head('<span class="mark">Seu</span> gosto, em perspectiva', "Estatísticas de escuta", "Veja padrões e tendências da sua biblioteca sem transformar música em competição.");
      if (!S.plays().length) return head + empty();
      var days = S.minutesByDay(), mx = Math.max.apply(null, days.concat([1])), gen = S.genres(), top = S.byAlbum().slice(0, 6), nAlb = S.byAlbum().length;
      return head +
        '<div class="stat-cards"><div class="card"><p class="stat-num">' + fmtTime(S.monthSeconds()) + '</p><p class="tiny">Escuta estimada neste mês</p></div><div class="card"><p class="stat-num" data-count="' + S.revisited() + '">0</p><p class="tiny">Álbuns revisitados</p></div><div class="card"><p class="stat-num" data-count="' + nAlb + '" data-pad="2">00</p><p class="tiny">Álbuns nesta amostra</p></div><div class="card"><p class="stat-num">' + c.esc(gen.length ? gen[0][0].split(" / ")[0] : "—") + '</p><p class="tiny">Gênero mais anotado</p></div></div>' +
        '<div class="stats-cols"><section class="card card--pad"><p class="eyebrow" style="font-size:8.5px">Ritmo da semana</p><h2 class="section-title" style="font-size:15px;margin:12px 0 6px">Sua escuta ao longo dos dias</h2><p class="tiny muted">Minutos por dia desta semana, a partir do que você ouviu aqui (prévias de 30 s).</p>' +
        '<div class="chart" data-grow>' + WD.map(function (d, i) { var m = days[i]; return '<div class="chart-col"><button class="chart-bar" style="--h:' + Math.max(m ? 6 : 2, Math.round(m / mx * 100)) + "%;--i:" + i + '" aria-label="' + d[1] + ": " + m + ' minutos"><i></i><span class="chart-tip">' + m + ' min</span></button><span class="tiny muted">' + d[0] + "</span></div>"; }).join("") + "</div>" +
        '<h2 class="section-title" style="font-size:15px;margin:22px 0 16px">Distribuição por gênero</h2><div data-grow>' + (gen.length ? gen.slice(0, 5).map(function (g) { return '<div class="bar-row bar-row--inline bar-row--wide"><span class="muted">' + c.esc(g[0]) + '</span><div class="bar"><i style="--w:' + g[1] + '%"></i></div><b class="tiny">' + g[1] + "%</b></div>"; }).join("") : '<p class="tiny muted">Os álbuns tocados ainda não informam gênero.</p>') + "</div></section>" +
        '<section class="card card--pad"><h2 class="section-title" style="font-size:15px">Álbuns que mais voltam</h2><p class="tiny muted">Com base nas suas reproduções</p><div class="rank">' +
        top.map(function (r, i) { var a = D.album(r[0]); return '<a class="rank-item stagger" style="--i:' + i + '" href="#/album/' + c.esc(a.id) + '"><span class="tiny muted">0' + (i + 1) + "</span>" + c.cover(a, "cover--rank") + '<span class="grow"><b class="small">' + c.esc(a.titulo) + '</b><span class="tiny muted">' + c.esc(a.artista) + '</span></span><span class="tiny muted">' + r[1] + (r[1] === 1 ? " play" : " plays") + "</span></a>"; }).join("") +
        '</div><p class="tiny muted" style="margin-top:22px">Use os dados para notar mudanças de gosto, não como metas.</p></section></div>';
    },
    init: function (root) { B.ui.countUp(root); B.ui.growBars(root); }
  };
})(window.Batuque);
