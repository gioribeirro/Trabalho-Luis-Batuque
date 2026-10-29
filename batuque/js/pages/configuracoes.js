(function (B) {
  var c = B.c, D = B.data, st = B.store.state;
  var LISTEN = [["autoplay", "Reprodução automática", "Continuar com faixas relacionadas", "note"], ["crossfade", "Crossfade", "Suavizar a transição entre faixas", "bars"], ["letras", "Mostrar letras", "Exibir letras quando disponíveis", "note"], ["historico", "Salvar histórico", "Usar histórico para recomendações", "bars"], ["notificacoes", "Notificações de descoberta", "Receber novidades da coleção", "note"], ["dados", "Respeitar dados móveis", "Evitar pré-carregar imagens grandes", "bars"]];
  var FIELDS = [["ano", "Ano"], ["genero", "Gênero"], ["nota", "Nota"], ["duracao", "Duração"], ["favoritos", "Favoritos"]];
  var DENS = [["confortavel", "Confortável"], ["compacta", "Compacta"], ["ampliada", "Leitura ampliada"]];
  var pending;

  function mix(hex, t, w) { return "color-mix(in srgb, " + hex + " " + w + "%, " + t + ")"; }

  B.pages.configuracoes = {
    title: "Configurações",
    render: function () {
      pending = { listening: JSON.parse(JSON.stringify(st.listening)), libFields: JSON.parse(JSON.stringify(st.libFields)) };
      return c.head('<span class="mark">Seu</span> espaço, suas regras', "Configurações", "Personalize a interface, escolha uma cor de destaque e ajuste o comportamento da sua biblioteca.") +
        '<div class="settings"><section class="card settings__card"><h2 class="section-title" style="font-size:15px">Aparência</h2><p class="tiny muted">As alterações são aplicadas imediatamente no protótipo.</p>' +
        '<div class="set-row set-row--line"><span class="icon-circle">' + c.icon("moon") + '</span><div class="grow"><b class="small">Tema da interface</b><p class="tiny muted">Alterne entre modo claro e escuro.</p></div><div class="seg" role="group" aria-label="Tema">' +
        [["claro", "Claro"], ["escuro", "Escuro"]].map(function (t) { return '<button class="seg__btn' + (st.theme === t[0] ? " is-active" : "") + '" aria-pressed="' + (st.theme === t[0]) + '" data-theme-set="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div></div>" +
        '<div class="set-row"><span class="icon-circle">' + c.icon("palette") + '</span><div class="grow"><b class="small">Cor de destaque</b><p class="tiny muted">Páginas de álbum podem herdar a cor da capa.</p></div><span class="tiny muted">Global / Da capa</span></div>' +
        '<div class="accent-grid" role="radiogroup" aria-label="Cor de destaque">' + D.accents.map(function (a) {
          var on = a.hex.toLowerCase() === st.accent.toLowerCase();
          return '<button class="accent-card' + (on ? " is-active" : "") + '" role="radio" aria-checked="' + on + '" data-accent-set="' + a.hex + '"><span class="dots"><i style="background:' + a.hex + '"></i><i style="background:' + mix(a.hex, "white", 15) + '"></i><i style="background:' + mix(a.hex, "#222", 72) + '"></i></span><b class="small">' + a.nome + '</b><span class="tiny muted">' + a.hex + (a.nome === "Laranja" ? " · padrão" : "") + "</span></button>";
        }).join("") + "</div>" +
        '<div class="set-row set-row--top"><span class="icon-circle">' + c.icon("sparkle") + '</span><div class="grow"><b class="small">Cor herdada da capa</b><p class="tiny muted">Cada álbum usa o tom visual associado à sua arte.</p></div>' + c.toggle("inheritCover", st.inheritCover, "Cor herdada da capa") + "</div>" +
        '<b class="small" style="display:block;margin-top:18px">Densidade da interface</b><p class="tiny muted" style="margin:4px 0 12px">Escolha entre mais respiro e mais informação por tela.</p><div class="chips">' +
        DENS.map(function (d) { var on = st.density === d[0]; return '<button class="chip' + (on ? " is-active" : "") + '" aria-pressed="' + on + '" data-density-set="' + d[0] + '">' + d[1] + "</button>"; }).join("") + "</div></section>" +
        '<section class="card settings__card"><h2 class="section-title" style="font-size:15px">Experiência de escuta</h2><p class="tiny muted">Pequenos ajustes para uma biblioteca mais útil.</p><div class="listen-list">' +
        LISTEN.map(function (l) { return '<div class="set-row set-row--line"><span class="icon-circle icon-circle--soft accent-text">' + c.icon(l[3]) + '</span><div class="grow"><b class="small">' + l[1] + '</b><p class="tiny muted">' + l[2] + "</p></div>" + c.toggle(l[0], pending.listening[l[0]], l[1]) + "</div>"; }).join("") + "</div>" +
        '<b class="small" style="display:block;margin-top:28px">Organização</b><p class="tiny muted" style="margin:4px 0 12px">Campos visíveis na sua biblioteca.</p><div class="chips">' +
        FIELDS.map(function (f) { var on = pending.libFields[f[0]]; return '<button class="chip' + (on ? " is-active" : "") + '" aria-pressed="' + on + '" data-field="' + f[0] + '">' + f[1] + "</button>"; }).join("") +
        '</div><button class="btn btn--primary btn--lg" id="savePrefs" style="margin-top:24px">Salvar preferências</button></section></div>' +
        '<p class="footnote">As cores de destaque são personalizáveis. O tema claro/escuro é independente da paleta.</p>';
    },
    init: function (root) {
      root.addEventListener("click", function (e) {
        var t = e.target.closest("[data-theme-set]");
        if (t) { B.Theme.setTheme(t.dataset.themeSet); root.querySelectorAll("[data-theme-set]").forEach(function (b) { var on = b === t; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }); }
        var a = e.target.closest("[data-accent-set]");
        if (a) { B.Theme.setAccent(a.dataset.accentSet); root.querySelectorAll("[data-accent-set]").forEach(function (b) { var on = b === a; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on); }); }
        var d = e.target.closest("[data-density-set]");
        if (d) { B.Theme.setDensity(d.dataset.densitySet); root.querySelectorAll("[data-density-set]").forEach(function (b) { var on = b === d; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }); }
        var tg = e.target.closest("[data-toggle]");
        if (tg) {
          var k = tg.dataset.toggle, v = tg.getAttribute("aria-checked") !== "true";
          tg.setAttribute("aria-checked", v);
          if (k === "inheritCover") B.store.set("inheritCover", v); else pending.listening[k] = v;
        }
        var f = e.target.closest("[data-field]");
        if (f) { var fk = f.dataset.field; pending.libFields[fk] = !pending.libFields[fk]; f.classList.toggle("is-active", pending.libFields[fk]); f.setAttribute("aria-pressed", pending.libFields[fk]); }
        if (e.target.closest("#savePrefs")) { B.store.set("listening", pending.listening); B.store.set("libFields", pending.libFields); pending = { listening: JSON.parse(JSON.stringify(st.listening)), libFields: JSON.parse(JSON.stringify(st.libFields)) }; B.ui.toast("Preferências salvas"); }
      });
    }
  };
})(window.Batuque);
