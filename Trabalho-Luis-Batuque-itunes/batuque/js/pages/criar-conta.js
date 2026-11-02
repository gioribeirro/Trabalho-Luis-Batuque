(function (B) {
  var A = B.auth;
  B.pages["criar-conta"] = {
    title: "Criar conta", layout: "auth",
    render: function () {
      return A.shell('<p class="eyebrow eyebrow--accent">COMECE SUA COLEÇÃO</p><h1 class="auth__h1">Crie sua conta</h1><p class="small muted">Um perfil para organizar seus registros musicais.</p>' +
        '<form novalidate class="auth__fields">' + A.field("nome", "Nome de exibição", { ph: "Como você quer aparecer?", max: 40, ac: "nickname" }) +
        A.field("email", "E-mail", { type: "email", ph: "seuemail@exemplo.com", ac: "email" }) +
        A.field("senha", "Senha", { password: true, ph: "Crie uma senha", ac: "new-password" }) +
        A.field("confirma", "Confirmar senha", { password: true, ph: "Digite novamente", ac: "new-password" }) +
        '<button class="btn btn--primary auth__btn" data-submit type="submit"><span class="btn__t">Criar conta</span><i class="btn__spin" aria-hidden="true"></i></button>' +
        '<p class="small muted" style="text-align:center">Já tem uma conta? <a class="link" href="#/login">Entrar</a></p></form>' +
        '<p class="tiny muted auth__legal">Ao criar a conta, você poderá escolher o que fica público e configurar suas preferências de privacidade.</p><p class="eyebrow auth__proto">PROTÓTIPO · CADASTRO ILUSTRATIVO</p>');
    },
    init: function (root) {
      A.bind(root, function (v) {
        var e = {}, n = v.nome.trim();
        if (n.length < 2 || n.length > 40) e.nome = "Use de 2 a 40 caracteres.";
        if (!A.re.email.test(v.email.trim())) e.email = "Informe um e-mail válido.";
        if (v.senha.length < 6) e.senha = "A senha precisa ter 6 ou mais caracteres.";
        if (v.confirma !== v.senha || !v.confirma) e.confirma = "As senhas não coincidem.";
        return e;
      }, function (v) {
        B.Session.register({ nome: v.nome.trim(), email: v.email.trim() });   // sem senha
        location.hash = "#/personalizar-perfil";
      });
    }
  };
})(window.Batuque);
