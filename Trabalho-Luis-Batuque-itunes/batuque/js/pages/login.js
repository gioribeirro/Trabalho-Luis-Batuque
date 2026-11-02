(function (B) {
  var c = B.c, A = B.auth;
  B.pages.login = {
    title: "Entrar", layout: "auth",
    render: function () {
      return A.shell('<p class="eyebrow eyebrow--accent">BEM-VINDO DE VOLTA</p><h1 class="auth__h1">Entre na sua conta</h1><p class="small muted">Continue de onde sua última escuta parou.</p>' +
        '<form novalidate class="auth__fields">' + A.field("email", "E-mail", { type: "email", ph: "seuemail@exemplo.com", ac: "email" }) +
        A.field("senha", "Senha", { password: true, ph: "Sua senha" }) +
        '<p class="auth__forgot"><a class="link" href="#/recuperar-acesso">Esqueceu a senha?</a></p>' +
        '<button class="btn btn--primary auth__btn" data-submit type="submit"><span class="btn__t">Entrar</span><i class="btn__spin" aria-hidden="true"></i></button>' +
        '<p class="auth__or"><span>ou</span></p><button type="button" class="btn auth__btn" id="gBtn">' + c.icon("ext") + 'Continuar com Google</button>' +
        '<p class="small muted" style="text-align:center">Ainda não tem conta? <a class="link" href="#/criar-conta">Criar conta</a></p></form>' +
        '<p class="tiny muted auth__legal">Ao continuar, você concorda com os termos e a política de privacidade.</p><p class="eyebrow auth__proto">PROTÓTIPO · FORMULÁRIO SEM AUTENTICAÇÃO REAL</p>');
    },
    init: function (root) {
      A.bind(root, function (v) {
        var e = {};
        if (!A.re.email.test(v.email.trim())) e.email = "Informe um e-mail válido.";
        if (v.senha.length < 6) e.senha = "A senha precisa ter 6 ou mais caracteres.";
        return e;
      }, function (v) {
        B.Session.login(v.email.trim());              // a senha é descartada: nunca é guardada
        location.hash = B.Session.takeReturn() || "#/inicio";
      });
      root.querySelector("#gBtn").addEventListener("click", function () { B.ui.toast("Login com Google indisponível neste protótipo", "soft"); });
    }
  };
})(window.Batuque);
