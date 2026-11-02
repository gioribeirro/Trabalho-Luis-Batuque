/* Batuque — sessão simulada (somente front-end). NUNCA guarda senha; nenhuma chamada de rede. */
(function (B) {
  var st = B.store.state, c = null;
  var returnTo = null;

  var Session = {
    isLogged: function () { return !!st.session.logado; },
    login: function (email) {
      var nome = st.session.nome || st.profile.nome;
      B.store.set("session", { logado: true, email: String(email || ""), nome: nome });
    },
    register: function (o) {
      B.store.set("session", { logado: true, email: String(o.email || ""), nome: String(o.nome || "") });
      var p = JSON.parse(JSON.stringify(st.profile));
      p.nome = o.nome; p.desde = new Date().getFullYear();
      B.store.set("profile", p);
      B.store.set("onboarded", false);
    },
    logout: function () {
      B.store.set("session", { logado: false, email: "", nome: st.session.nome });
      if (B.Player.playing) B.Player.audio.pause();
      B.ui.toast("Você saiu");
      location.hash = "#/login";
    },
    /* Guarda o retorno e manda para o login quando não há sessão */
    requireLogin: function (returnHash) {
      if (Session.isLogged()) return true;
      returnTo = returnHash || location.hash || "#/inicio";
      location.hash = "#/login";
      return false;
    },
    takeReturn: function () { var r = returnTo; returnTo = null; return r; }
  };
  B.Session = Session;

  /* ---------- Layout compartilhado das telas de conta ---------- */
  function E(s) { return B.c.esc(s); }
  var re = { email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ };

  B.auth = {
    re: re,
    shell: function (inner) {
      c = B.c;
      return '<div class="auth">' +
        '<section class="auth__left"><div class="auth__brand"><span class="logo__ring" aria-hidden="true"></span><span><b class="logo__name">BATUQUE.</b><span class="logo__sub">Music Journal</span></span></div>' +
        '<div class="auth__hero"><h2 class="auth__title">Sua música.<br>Sua história.</h2><p class="auth__sub">Um espaço para descobrir, organizar e registrar o que a música representa para você.</p></div>' +
        '<div class="auth__card"><span class="atile atile--lg" style="--c:var(--accent)"><b class="atile__ini">B</b><i class="atile__disc"></i><span class="atile__cap">BATUQUE</span></span>' +
        '<div><p class="eyebrow eyebrow--accent">Um arquivo feito de escutas</p><h3 class="auth__card-t">Álbuns, artistas e resenhas no mesmo lugar.</h3>' +
        '<p class="small muted">Crie coleções com contexto, acompanhe suas descobertas e guarde suas avaliações.</p><p class="tiny muted auth__cap">DESIGN LIMPO · MÚSICA EM PRIMEIRO PLANO</p></div></div></section>' +
        '<section class="auth__right"><div class="auth__form">' + inner + "</div></section></div>";
    },
    /* Campo de texto com rótulo em caixa alta e mensagem de erro associada */
    field: function (id, label, o) {
      o = o || {};
      return '<div class="field"><label class="field__label" for="' + id + '">' + E(label) + "</label>" +
        '<div class="field__box">' + (o.password
          ? '<input class="field__input" id="' + id + '" name="' + id + '" type="password" autocomplete="' + (o.ac || "current-password") + '" placeholder="' + E(o.ph || "") + '" aria-describedby="' + id + 'Err"><button type="button" class="field__eye" data-eye="' + id + '" aria-label="Mostrar senha" aria-pressed="false"><span class="eye-on">' + B.c.icon("eye") + '</span><span class="eye-off">' + B.c.icon("eyeoff") + "</span></button>"
          : '<input class="field__input" id="' + id + '" name="' + id + '" type="' + (o.type || "text") + '" autocomplete="' + (o.ac || "off") + '" placeholder="' + E(o.ph || "") + '"' + (o.max ? ' maxlength="' + o.max + '"' : "") + ' aria-describedby="' + id + 'Err">') +
        '</div><p class="field__err" id="' + id + 'Err" role="alert"></p></div>';
    },
    /* Liga olho de senha, Enter, foco inicial, validação e estado de carregamento.
       rules(values) -> { campo: "mensagem" }; onOk(values, done) roda após ~500 ms simulados. */
    bind: function (root, rules, onOk) {
      var form = root.querySelector("form"), btn = form.querySelector("[data-submit]"), busy = false;
      var first = form.querySelector("input"); if (first) setTimeout(function () { first.focus(); }, 60);
      form.addEventListener("click", function (e) {
        var eye = e.target.closest("[data-eye]"); if (!eye) return;
        var inp = form.querySelector("#" + eye.dataset.eye), show = inp.type === "password";
        inp.type = show ? "text" : "password";
        eye.setAttribute("aria-pressed", show); eye.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
        eye.classList.toggle("is-on", show);
      });
      function clearErr(inp) { inp.removeAttribute("aria-invalid"); var m = form.querySelector("#" + inp.id + "Err"); if (m) m.textContent = ""; inp.closest(".field").classList.remove("has-err"); }
      form.addEventListener("input", function (e) { if (e.target.matches("input")) clearErr(e.target); });
      form.addEventListener("submit", function (e) {
        e.preventDefault(); if (busy) return;
        var v = {}; form.querySelectorAll("input").forEach(function (i) { v[i.id] = i.value; });
        var errs = rules(v), keys = Object.keys(errs);
        form.querySelectorAll("input").forEach(clearErr);
        if (keys.length) {
          keys.forEach(function (k) {
            var inp = form.querySelector("#" + k); inp.setAttribute("aria-invalid", "true");
            inp.closest(".field").classList.add("has-err");
            form.querySelector("#" + k + "Err").textContent = errs[k];
          });
          form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
          form.querySelector("#" + keys[0]).focus();
          return;
        }
        busy = true; btn.classList.add("is-loading"); btn.disabled = true;
        setTimeout(function () { busy = false; btn.classList.remove("is-loading"); btn.disabled = false; onOk(v); }, 500);
      });
    }
  };
})(window.Batuque);
