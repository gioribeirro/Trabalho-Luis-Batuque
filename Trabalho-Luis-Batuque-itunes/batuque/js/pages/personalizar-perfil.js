(function (B) {
  var A = B.auth, c = B.c, st = B.store.state;
  var GEN = ["Rap / Trap", "Rock", "Metalcore", "Eletrônica", "Trilhas sonoras", "Pop", "Indie", "R&B"];
  var TOG = [["publico", "Perfil público"], ["mostrarResenhas", "Mostrar resenhas no meu perfil"], ["buscavel", "Permitir que encontrem meu perfil pelo nome"]];
  var S;
  B.pages["personalizar-perfil"] = {
    title: "Monte seu perfil", layout: "auth",
    accent: function () { return "#5F7DE1"; },          // azul do wireframe, independente de "cor herdada da capa"
    render: function () {
      S = { gen: ["Rap / Trap", "Rock"], priv: { publico: true, mostrarResenhas: false, buscavel: false } };
      return A.shell('<p class="eyebrow eyebrow--accent">PRIMEIROS PASSOS</p><h1 class="auth__h1">Monte seu perfil</h1><p class="small muted">Você pode mudar estas escolhas depois.</p>' +
        '<form novalidate class="auth__fields">' + A.field("usuario", "Nome de usuário", { ph: "@seuusuario", max: 31 }) +
        '<p class="field__label" style="margin-bottom:0">O QUE VOCÊ CURTE OUVIR?</p>' + c.chips(GEN, S.gen, "data-gen", true) +
        '<p class="field__label" style="margin:6px 0 0">PREFERÊNCIAS DO PERFIL</p><div class="auth__toggles">' + TOG.map(function (t) {
          return '<div class="set-row set-row--line"><b class="small grow">' + t[1] + "</b>" + c.toggle(t[0], S.priv[t[0]], t[1]) + "</div>";
        }).join("") + '</div><button class="btn btn--primary auth__btn" data-submit type="submit"><span class="btn__t">Salvar e continuar</span><i class="btn__spin" aria-hidden="true"></i></button></form>' +
        '<p class="tiny muted auth__legal">As opções de privacidade podem ser alteradas a qualquer momento.</p><p class="eyebrow auth__proto">PROTÓTIPO · PREFERÊNCIAS E PRIVACIDADE</p>');
    },
    init: function (root) {
      root.addEventListener("click", function (e) {
        var g = e.target.closest("[data-gen]");
        if (g) { var i = S.gen.indexOf(g.dataset.gen); if (i >= 0) S.gen.splice(i, 1); else S.gen.push(g.dataset.gen); g.classList.toggle("is-active", i < 0); g.setAttribute("aria-pressed", i < 0); return; }
        var t = e.target.closest("[data-toggle]");
        if (t) { var k = t.dataset.toggle; S.priv[k] = !S.priv[k]; t.setAttribute("aria-checked", S.priv[k]); }
      });
      A.bind(root, function (v) {
        var u = v.usuario.trim().replace(/^@+/, "").replace(/\s+/g, "");
        return (u.length < 3 || u.length > 30) ? { usuario: "Use de 3 a 30 caracteres, sem espaços." } : {};
      }, function (v) {
        var u = v.usuario.trim().replace(/^@+/, "").replace(/\s+/g, ""), p = JSON.parse(JSON.stringify(st.profile));
        p.nome = st.session.nome || p.nome; p.usuario = u; p.generos = S.gen.slice();
        B.store.set("profile", p); B.store.set("privacy", JSON.parse(JSON.stringify(S.priv))); B.store.set("onboarded", true);
        B.ui.toast("Perfil criado"); location.hash = "#/inicio";
      });
    }
  };
})(window.Batuque);
