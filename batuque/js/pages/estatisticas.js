(function (B) {
  var c = B.c, D = B.data;
  var DAYS = [["S", "Segunda", 45], ["T", "Terça", 65], ["Q", "Quarta", 42], ["Q", "Quinta", 90], ["S", "Sexta", 55], ["S", "Sábado", 70], ["D", "Domingo", 35]];
  var MAXMIN = 180;
  B.pages.estatisticas = {
    title: "Estatísticas",
    render: function () {
      return c.head('<span class="mark">Seu</span> gosto, em perspectiva', "Estatísticas de escuta", "Veja padrões e tendências da sua biblioteca sem transformar música em competição.") +
        '<div class="stat-cards"><div class="card"><p class="stat-num">34h 12m</p><p class="tiny">Escuta estimada neste mês*</p></div><div class="card"><p class="stat-num" data-count="42">0</p><p class="tiny">Álbuns revisitados*</p></div><div class="card"><p class="stat-num" data-count="8" data-pad="2">00</p><p class="tiny">Álbuns nesta amostra</p></div><div class="card"><p class="stat-num">Rap</p><p class="tiny">Gênero mais anotado*</p></div></div>' +
        '<div class="stats-cols"><section class="card card--pad"><p class="eyebrow" style="font-size:8.5px">Ritmo da semana</p><h2 class="section-title" style="font-size:15px;margin:12px 0 6px">Sua escuta ao longo dos dias</h2><p class="tiny muted">Minutos por dia · valores fictícios para demonstrar o gráfico.</p>' +
        '<div class="chart" data-grow>' + DAYS.map(function (d, i) { var m = Math.round(d[2] / 100 * MAXMIN); return '<div class="chart-col"><button class="chart-bar" style="--h:' + d[2] + "%;--i:" + i + '" aria-label="' + d[1] + ": " + m + ' minutos"><i></i><span class="chart-tip">' + m + " min</span></button><span class=\"tiny muted\">" + d[0] + "</span></div>"; }).join("") + "</div>" +
        '<h2 class="section-title" style="font-size:15px;margin:22px 0 16px">Distribuição por gênero</h2><div data-grow>' + [["Rap / Trap", 76], ["Rock / Metalcore", 66], ["Trilha sonora", 42], ["Hip-hop", 38]].map(function (g) { return '<div class="bar-row bar-row--inline bar-row--wide"><span class="muted">' + g[0] + '</span><div class="bar"><i style="--w:' + g[1] + '%"></i></div><b class="tiny">' + g[1] + "%</b></div>"; }).join("") + "</div></section>" +
        '<section class="card card--pad"><h2 class="section-title" style="font-size:15px">Álbuns que mais voltam</h2><p class="tiny muted">Com base em reproduções de exemplo</p><div class="rank">' +
        [["trauma", 14], ["chainsaw-man", 11], ["jobs-not-done", 9], ["renovate", 7], ["huncho-jack", 6], ["conglomerate", 5]].map(function (r, i) { var a = D.album(r[0]); return '<a class="rank-item stagger" style="--i:' + i + '" href="#/album/' + a.id + '"><span class="tiny muted">0' + (i + 1) + "</span>" + c.cover(a, "cover--rank") + '<span class="grow"><b class="small">' + c.esc(a.titulo) + '</b><span class="tiny muted">' + c.esc(a.id === "conglomerate" ? "Fimiguerrero, Len" : a.artista) + '</span></span><span class="tiny muted">' + r[1] + " plays</span></a>"; }).join("") +
        '</div><p class="tiny muted" style="margin-top:22px">Use os dados para notar mudanças de gosto, não como metas.</p></section></div>';
    },
    init: function (root) { B.ui.countUp(root); B.ui.growBars(root); }
  };
})(window.Batuque);
