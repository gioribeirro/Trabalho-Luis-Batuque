/* Batuque — roteamento por hash */
(function (B) {
  B.pages = B.pages || {};
  var view, main, current = null;

  function parse() {
    var h = (location.hash || "#/inicio").replace(/^#\/?/, "");
    var parts = h.split("/").filter(Boolean);
    return { name: parts[0] || "inicio", param: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  var Router = {
    focusAlbum: "trauma",
    go: function (path) { location.hash = path; },
    render: function () {
      var r = parse();
      var page = B.pages[r.name];
      if (!page) { location.replace("#/inicio"); return; }
      if (current && current.leave) current.leave();
      if (r.name === "album") {
        var alb = B.data.album(r.param);
        // Álbum da Apple ainda sem a lista de faixas (ou aberto por link direto): consulta o lookup e renderiza em seguida
        if (B.Itunes.isExternalAlbumId(r.param) && (!alb || !alb.faixasCarregadas)) {
          var want = r.param;
          view.innerHTML = '<p class="small muted empty card" role="status">Carregando álbum na Apple…</p>';
          document.title = "Álbum · BATUQUE.";
          B.app.setActive("album");
          B.Itunes.loadAlbum(want).then(function () {
            if (parse().name === "album" && parse().param === want) Router.render();
          }, function (e) {
            B.ui.toast(B.Itunes.errorMessage(e), "soft");
            if (parse().name === "album" && parse().param === want) location.replace("#/album/" + Router.focusAlbum);
          });
          return;
        }
        if (!alb) { location.replace("#/album/" + Router.focusAlbum); return; }
        Router.focusAlbum = r.param;
      }
      /* Artista: se o ID não existe (ex.: link direto para artista da Apple), resolve por lookup antes de renderizar */
      if ((r.name === "artista" || r.name === "avaliar-artista") && !B.data.getArtistById(r.param)) {
        var wantA = r.param;
        if (!B.Itunes.isExternalId(wantA)) { location.replace("#/artistas"); return; }
        view.innerHTML = '<p class="small muted empty card" role="status">Carregando artista…</p>';
        document.title = "Artista · BATUQUE.";
        B.app.setActive(r.name);
        B.Itunes.lookupArtist(wantA).then(function () {
          if (parse().name === r.name && parse().param === wantA) Router.render();
        }, function (e) {
          B.ui.toast(B.Itunes.errorMessage(e), "soft");
          if (parse().param === wantA) location.replace("#/artistas");
        });
        return;
      }
      current = page;
      var app = document.getElementById("app"), wasAuth = app.classList.contains("is-auth"), isAuth = page.layout === "auth";
      app.classList.toggle("is-auth", isAuth);
      if (isAuth && !wasAuth && B.Player.playing) B.Player.audio.pause();   // o player some nas telas de conta; pausa ao entrar
      // Container novo a cada rota: evita que os listeners de clique registrados em init() (no #view) se acumulem a cada visita
      var fresh = view.cloneNode(false); view.parentNode.replaceChild(fresh, view); view = fresh;
      view.classList.remove("view-enter");
      view.innerHTML = page.render(r.param);
      void view.offsetWidth;
      view.classList.add("view-enter");
      main.scrollTop = 0;
      document.title = (typeof page.title === "function" ? page.title(r.param) : page.title) + " · BATUQUE.";
      B.app.setActive(r.name);
      if (r.name !== "album") B.Theme.resetAccent();
      if (page.accent) { var ac = page.accent(r.param); if (ac) B.Theme.applyAlbumAccent(ac, 0.25); }
      if (page.init) page.init(view, r.param);
      B.ui.markPlaying();
      document.getElementById("app").classList.remove("menu-open");
    },
    start: function () {
      view = document.getElementById("view");
      main = document.getElementById("main");
      window.addEventListener("hashchange", Router.render);
      if (!location.hash) location.replace("#/inicio");
      Router.render();
    }
  };
  B.Router = Router;
})(window.Batuque);
