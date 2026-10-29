/* Batuque — tema, cor de destaque, cor herdada da capa */
(function (B) {
  var root = document.documentElement;
  function hexToRgb(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function lum(hex) {
    return hexToRgb(hex).map(function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); })
      .reduce(function (s, c, i) { return s + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function apply(hex) {
    var L = lum(hex);
    root.style.setProperty("--accent", hex);
    root.style.setProperty("--on-accent", L > 0.42 ? "#1C1F24" : "#FFFFFF");
    // Texto de destaque legível: escurece cores muito claras no tema claro
    var dark = root.getAttribute("data-theme") === "escuro";
    root.style.setProperty("--accent-text", (!dark && L > 0.42) ? "color-mix(in srgb, " + hex + " 45%, #1C1F24)" : hex);
  }
  var Theme = {
    current: null,
    setTheme: function (t) {
      root.setAttribute("data-theme", t);
      B.store.set("theme", t);
      apply(Theme.current || B.store.get("accent"));
      document.querySelectorAll("[data-theme-sync]").forEach(function (el) { el.value = t; });
    },
    toggleTheme: function () { Theme.setTheme(B.store.get("theme") === "escuro" ? "claro" : "escuro"); },
    setAccent: function (hex) { B.store.set("accent", hex); if (!Theme.current) apply(hex); },
    applyAlbumAccent: function (hex) { Theme.current = hex; apply(hex); },
    resetAccent: function () { Theme.current = null; apply(B.store.get("accent")); },
    setDensity: function (d) { root.setAttribute("data-density", d); B.store.set("density", d); },
    init: function () {
      root.setAttribute("data-theme", B.store.get("theme"));
      root.setAttribute("data-density", B.store.get("density"));
      apply(B.store.get("accent"));
    }
  };
  B.Theme = Theme;
  Theme.init();
})(window.Batuque);
