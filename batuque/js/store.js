/* Batuque — estado global + localStorage */
(function (B) {
  var KEY = "batuque:v1";
  var defaults = {
    theme: "claro",
    accent: "#F0783C",
    inheritCover: true,
    density: "confortavel",
    listening: { autoplay: true, crossfade: false, letras: true, historico: true, notificacoes: false, dados: true },
    libFields: { ano: true, genero: true, nota: true, duracao: false, favoritos: true },
    saved: ["paris", "huncho-jack", "jobs-not-done", "trauma", "renovate", "arquivo-x", "conglomerate", "chainsaw-man"],
    favAlbums: [],
    favTracks: [],
    albumRatings: {},
    trackRatings: {},
    reviews: [],
    savedReviews: ["r1"],
    draft: { albumId: "trauma", nota: 5, texto: "" },
    profile: null,
    volume: 0.65,
    queue: null,
    trackNotes: {},
    replay: {},
    playlistTracks: null,
    playlistMeta: null,
    playlistToggles: { porAlbum: true, aleatorio: true, notas: false },
    pageColor: {}
  };
  var state;
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { state = {}; }
  Object.keys(defaults).forEach(function (k) {
    if (state[k] === undefined || state[k] === null) state[k] = JSON.parse(JSON.stringify(defaults[k]));
  });
  if (!state.profile) state.profile = JSON.parse(JSON.stringify(B.data.user));

  var listeners = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  B.store = {
    state: state,
    get: function (k) { return state[k]; },
    set: function (k, v) { state[k] = v; save(); listeners.forEach(function (fn) { fn(k, v); }); },
    save: save,
    on: function (fn) { listeners.push(fn); },
    toggleIn: function (k, id) {
      var arr = state[k], i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1); else arr.push(id);
      save(); return i < 0;
    }
  };
})(window.Batuque);
