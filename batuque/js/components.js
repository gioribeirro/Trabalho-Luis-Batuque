/* Batuque — componentes HTML reutilizáveis + UI (toast, modal, popover) */
(function (B) {
  var P = function (d) { return '<path d="' + d + '"/>'; };
  var I = {
    home: P("M3 11l9-7 9 7") + P("M5 10v10h14V10") + P("M10 20v-6h4v6"),
    compass: '<circle cx="12" cy="12" r="9"/>' + P("M15.5 8.5l-2 5-5 2 2-5z"),
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
    user: '<circle cx="12" cy="8" r="4"/>' + P("M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"),
    chat: P("M4 5h16v11H9l-5 4z") + P("M8 9h8M8 12h5"),
    list: P("M9 6h11M9 12h11M9 18h11") + '<circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    note: P("M9 18V6l10-2v12") + '<circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>',
    bars: P("M5 20V10M10 20V4M15 20v-7M20 20v-11"),
    gear: '<circle cx="12" cy="12" r="3"/>' + P("M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"),
    search: '<circle cx="11" cy="11" r="6.5"/>' + P("M20 20l-4-4"),
    heart: P("M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"),
    arrow: P("M5 12h14M13 6l6 6-6 6"),
    prev: P("M6 5v14") + P("M18 6l-9 6 9 6z"),
    next: P("M18 5v14") + P("M6 6l9 6-9 6z"),
    moon: P("M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"),
    sun: '<circle cx="12" cy="12" r="4"/>' + P("M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"),
    palette: P("M12 3a9 9 0 1 0 0 18c1.2 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z") + '<circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    volume: P("M4 9h4l5-4v14l-5-4H4z") + P("M16.5 9a4 4 0 0 1 0 6"),
    expand: P("M14 4h6v6M20 4l-8 8") + P("M18 14v6H4V6h6"),
    shuffle: P("M4 7h3l10 10h3M4 17h3l3-3M14 10l3-3h3M18 5l2 2-2 2M18 15l2 2-2 2"),
    repeat: P("M4 12V9a3 3 0 0 1 3-3h12l-3-3M20 12v3a3 3 0 0 1-3 3H5l3 3"),
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
    pencil: P("M4 20l4-1 11-11-3-3L5 16z"),
    plus: P("M12 5v14M5 12h14"),
    x: P("M6 6l12 12M18 6L6 18"),
    menu: P("M4 7h16M4 12h16M4 17h16"),
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/>' + P("M8.2 11l7.6-4M8.2 13l7.6 4"),
    check: P("M5 12.5l4.5 4.5L19 7"),
    sparkle: P("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"),
    filter: P("M4 6h16M7 12h10M10 18h4"),
    trash: P("M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"),
    up: P("M12 19V5M6 11l6-6 6 6")
  };
  function icon(name, cls) {
    return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + I[name] + "</svg>";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function initial(t) { return t.replace(/[^A-Za-z0-9]/g, "").charAt(0) || "?"; }
  function cover(a, cls) {
    return '<span class="cover ' + (cls || "") + '" style="--c:' + a.corDestaque + '" data-ini="' + esc(initial(a.titulo)) + '">' +
      '<img src="' + a.capa + '" alt="Capa de ' + esc(a.titulo) + '" loading="lazy" onerror="this.remove()"></span>';
  }
  function tipoLabel(a) { return a.tipo === "Trilha sonora" ? "Trilha sonora" : a.tipo; }
  function faixasLabel(a) { return a.nFaixas === 1 ? "1 faixa" : a.nFaixas + " faixas"; }
  function eq() { return '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>'; }

  function albumCard(a, i) {
    var meta = a.id === "arquivo-x" ? "Álbum" : faixasLabel(a);
    return '<article class="album-card stagger" style="--i:' + (i || 0) + '" data-album="' + a.id + '" tabindex="0" role="link" aria-label="' + esc(a.titulo) + '">' +
      '<div class="album-card__top">' + cover(a, "cover--md") +
      '<div class="album-card__info"><span class="eyebrow eyebrow--accent">' + esc(tipoLabel(a)).toUpperCase() + "</span>" +
      '<h3 class="album-card__title">' + esc(a.titulo) + '</h3><p class="muted">' + esc(a.artista) + "</p></div></div>" +
      '<div class="album-card__bottom"><p class="small muted">' + esc(a.generos) + '</p><p class="small muted">' + a.ano + " · " + meta + "</p>" +
      '<button class="play-pill" data-play-album="' + a.id + '" aria-label="Tocar ' + esc(a.titulo) + '">' + icon("play") + eq() + "</button></div></article>";
  }
  function continueCard(a, i) {
    return '<article class="continue-card stagger" style="--i:' + i + '" data-album="' + a.id + '" tabindex="0" role="link">' + cover(a, "cover--sm") +
      '<div class="grow"><h3 class="t-strong">' + esc(a.titulo) + '</h3><p class="small muted">' + esc(a.artista) + '</p><p class="tiny accent-text">' +
      faixasLabel(a) + " &nbsp;·&nbsp; " + esc(a.generos) + "</p></div>" +
      '<button class="play-circle" data-play-album="' + a.id + '" aria-label="Tocar ' + esc(a.titulo) + '">' + icon("play") + eq() + "</button></article>";
  }
  function miniItem(a, sub, right) {
    return '<a class="mini-item" href="#/album/' + a.id + '">' + cover(a, "cover--xs") + '<span class="grow"><b>' + esc(a.titulo) + '</b><span class="tiny muted">' + esc(sub || a.artista) + "</span></span>" + (right || '<span class="arrow accent-text">' + icon("arrow") + "</span>") + "</a>";
  }
  function stars(value, opts) {
    opts = opts || {};
    var h = '<span class="stars' + (opts.interactive ? " stars--input" : "") + '" ' + (opts.attr || "") + ' role="' + (opts.interactive ? "radiogroup" : "img") + '" aria-label="Nota ' + value + ' de 5">';
    for (var i = 1; i <= 5; i++) {
      var fill = value >= i ? 1 : value > i - 1 ? 0.5 : 0;
      h += opts.interactive
        ? '<button type="button" class="star ' + (fill === 1 ? "on" : "") + '" data-star="' + i + '" aria-label="' + i + ' estrela' + (i > 1 ? "s" : "") + '" style="--d:' + i + '">' + icon("star") + "</button>"
        : '<span class="star ' + (fill === 1 ? "on" : fill ? "half" : "") + '">' + icon("star") + "</span>";
    }
    return h + "</span>";
  }
  function toggle(id, on, label) {
    return '<button class="toggle" role="switch" aria-checked="' + !!on + '" data-toggle="' + id + '" aria-label="' + esc(label || id) + '"><span></span></button>';
  }
  function chips(items, active, attr, multi) {
    return '<div class="chips" role="group">' + items.map(function (c) {
      var on = multi ? active.indexOf(c) >= 0 : c === active;
      return '<button class="chip' + (on ? " is-active" : "") + '" aria-pressed="' + on + '" ' + attr + '="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("") + "</div>";
  }
  function head(eyebrow, title, sub, right) {
    return '<header class="page-head"><div><p class="eyebrow">' + eyebrow + '</p><h1 class="page-title">' + title + '</h1><p class="page-sub">' + sub + "</p></div>" + (right || "") + "</header>";
  }
  function sectionHead(title, sub, link) {
    return '<div class="section-head"><div><h2 class="section-title">' + title + '</h2><p class="small muted">' + sub + "</p></div>" + (link || "") + "</div>";
  }
  function link(label, href, attr) { return '<a class="link" href="' + (href || "javascript:void(0)") + '" ' + (attr || "") + ">" + label + "</a>"; }

  /* ---------- UI ---------- */
  var ui = {
    toast: function (msg, kind) {
      var box = document.getElementById("toasts");
      var t = document.createElement("div");
      t.className = "toast " + (kind || "");
      t.setAttribute("role", "status");
      t.innerHTML = (kind === "soft" ? icon("note") : icon("check")) + "<span>" + esc(msg) + "</span>";
      box.appendChild(t);
      setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 250); }, 2400);
    },
    modal: function (title, body, actions, onMount) {
      ui.closeModal();
      var prev = document.activeElement;
      var wrap = document.createElement("div");
      wrap.className = "modal-backdrop";
      wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal__head"><h2 class="section-title">' + esc(title) +
        '</h2><button class="icon-btn" data-close aria-label="Fechar">' + icon("x") + '</button></div><div class="modal__body">' + body + '</div><div class="modal__foot">' + (actions || "") + "</div></div>";
      document.body.appendChild(wrap);
      wrap._prev = prev;
      wrap.addEventListener("click", function (e) { if (e.target === wrap || e.target.closest("[data-close]")) ui.closeModal(); });
      wrap.addEventListener("keydown", function (e) {
        if (e.key !== "Tab") return;
        var f = wrap.querySelectorAll("button, input, select, textarea, a[href]");
        if (!f.length) return;
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      });
      if (onMount) onMount(wrap);
      setTimeout(function () { var el = wrap.querySelector(".modal__body input, .modal__body textarea, .modal__body button, .modal__foot button"); if (el) el.focus(); }, 30);
      return wrap;
    },
    closeModal: function () {
      var m = document.querySelector(".modal-backdrop");
      if (m) { var p = m._prev; m.classList.add("out"); setTimeout(function () { m.remove(); }, 180); if (p && p.focus) p.focus(); return true; }
      return false;
    },
    copy: function (text, msg) {
      function done() { ui.toast(msg || "Link copiado"); }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
      else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); }
    },
    countUp: function (scope) {
      scope.querySelectorAll("[data-count]").forEach(function (el) {
        var target = +el.getAttribute("data-count"), pad = el.getAttribute("data-pad") || 0, t0 = performance.now(), D = 900;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = String(target).padStart(pad, "0"); return; }
        (function step(n) { var p = Math.min(1, (n - t0) / D), v = Math.round(target * (1 - Math.pow(1 - p, 3))); el.textContent = String(v).padStart(pad, "0"); if (p < 1) requestAnimationFrame(step); })(t0);
      });
    },
    growBars: function (scope) {
      var els = scope.querySelectorAll("[data-grow]");
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("grown"); io.unobserve(e.target); } });
      }, { threshold: 0.2 });
      els.forEach(function (el) { io.observe(el); });
    },
    bindStars: function (el, onSet) {
      var btns = el.querySelectorAll(".star");
      function paint(n) { btns.forEach(function (b, i) { b.classList.toggle("on", i < n); }); }
      var cur = el.querySelectorAll(".star.on").length;
      btns.forEach(function (b) {
        b.addEventListener("mouseenter", function () { paint(+b.dataset.star); });
        b.addEventListener("click", function (e) { e.stopPropagation(); cur = +b.dataset.star; paint(cur); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); onSet(cur); });
      });
      el.addEventListener("mouseleave", function () { paint(cur); });
    },
    markPlaying: function () {
      var t = B.Player.track, playing = B.Player.playing;
      document.querySelectorAll("[data-play-album]").forEach(function (b) { b.classList.toggle("is-playing", playing && b.dataset.playAlbum === t.albumId); });
      document.querySelectorAll("[data-track]").forEach(function (r) { r.classList.toggle("is-playing", playing && r.dataset.track === t.id); });
    }
  };

  B.ui = ui;
  B.pages = B.pages || {};
  B.c = { icon: icon, esc: esc, cover: cover, albumCard: albumCard, continueCard: continueCard, miniItem: miniItem, stars: stars, toggle: toggle, chips: chips, head: head, sectionHead: sectionHead, link: link, eq: eq, faixasLabel: faixasLabel, tipoLabel: tipoLabel };
})(window.Batuque);
