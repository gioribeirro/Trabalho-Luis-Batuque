(function (B) {
  var A = B.auth, c = B.c;
  B.pages["recuperar-acesso"] = {
    title: "Recuperar acesso", layout: "auth",
    render: function () {
      return A.shell('<p class="eyebrow eyebrow--accent">RECUPERAR ACESSO</p><h1 class="auth__h1">Redefina sua senha</h1><p class="small muted">Informe o e-mail cadastrado. Vamos mostrar uma confirmação de envio neste protótipo, sem disparar mensagens reais.</p>' +
        '<form novalidate class="auth__fields">' + A.field("email", "E-mail da conta", { type: "email", ph: "seuemail@exemplo.com", ac: "email" }) +
        '<p class="auth__ok" id="rcOk" role="status" hidden></p>' +
        '<button class="btn btn--primary auth__btn" data-submit type="submit"><span class="btn__t">Enviar instruções</span><i class="btn__spin" aria-hidden="true"></i></button>' +
        '<p class="small muted" style="text-align:center">Lembrou sua senha? <a class="link" href="#/login">Voltar ao login</a></p></form>' +
        '<div class="card auth__note"><b class="small">Privacidade em primeiro lugar</b><p class="tiny muted">Não exibimos se um e-mail existe ou não. A confirmação é neutra para proteger a conta.</p></div>' +
        '<p class="eyebrow auth__proto">PROTÓTIPO · RECUPERAÇÃO NÃO CONECTADA A E-MAIL</p>');
    },
    init: function (root) {
      A.bind(root, function (v) { return A.re.email.test(v.email.trim()) ? {} : { email: "Informe um e-mail válido." }; }, function () {
        var ok = root.querySelector("#rcOk");   // mesma mensagem, exista ou não conta; nada é enviado nem guardado
        ok.textContent = "Se este e-mail estiver cadastrado, enviaremos as instruções.";
        ok.hidden = false; ok.classList.remove("fade-in"); void ok.offsetWidth; ok.classList.add("fade-in");
      });
    }
  };
})(window.Batuque);
