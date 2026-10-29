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
        if (!B.data.album(r.param)) { location.replace("#/album/" + Router.focusAlbum); return; }
        Router.focusAlbum = r.param;
      }
      current = page;
      view.classList.remove("view-enter");
      view.innerHTML = page.render(r.param);
      void view.offsetWidth;
      view.classList.add("view-enter");
      main.scrollTop = 0;
      document.title = (typeof page.title === "function" ? page.title(r.param) : page.title) + " · BATUQUE.";
      B.app.setActive(r.name);
      if (r.name !== "album") B.Theme.resetAccent();
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
