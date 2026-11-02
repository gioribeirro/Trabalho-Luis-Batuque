/* Batuque — dados fictícios */
window.Batuque = window.Batuque || {};
(function (B) {
  var CAPA = "assets/img/capas/";
  function f(t, d, a) { return { titulo: t, dur: d, artista: a }; }

  var albums = [
    { id: "paris", titulo: "PARIS", artista: "BLXCK", tipo: "Single", ano: 2026, generos: "Rap / Trap", nFaixas: 1,
      identidadeVisual: "Rosa queimado / azul noite", corDestaque: "#EF815E", vibes: ["Noturno", "Sem pressa"], adicionado: 8, nota: 4.3,
      faixas: [f("PARIS", "—")] },
    { id: "huncho-jack", titulo: "Huncho Jack, Jack Huncho", artista: "Travis Scott, Quavo", tipo: "Álbum", ano: 2017, generos: "Hip-hop", nFaixas: 13,
      identidadeVisual: "Areia / azul / amarelo", corDestaque: "#D6B84B", vibes: ["Energia alta", "Noturno"], adicionado: 7, nota: 4.0,
      faixas: [f("Modern Slavery", "2:52", "Travis Scott, Quavo"), f("Eye 2 Eye", "3:11", "Huncho Jack feat. Takeoff"), f("Saint", "2:21", "Huncho Jack"), f("Go", "2:37", "Huncho Jack"), f("Dubai Shit", "3:14", "Huncho Jack")] },
    { id: "jobs-not-done", titulo: "Job's Not Done", artista: "Kidwild", tipo: "Álbum", ano: 2026, generos: "UK Rap", nFaixas: 10,
      identidadeVisual: "Âmbar / carvão", corDestaque: "#C7955D", vibes: ["Intenso", "Foco", "Energia alta"], adicionado: 6, nota: 4.4,
      faixas: [f("Job's Not Done (feat. ERA)", "2:27", "Kidwild, ERA"), f("Remontada (feat. Blanco)", "2:41", "Kidwild, Blanco"), f("Pac-Man", "2:00"), f("Allstar Freestyle", "2:22"), f("TNT (feat. Nemzzz)", "2:36", "Kidwild, Nemzzz")] },
    { id: "trauma", titulo: "TRAUMA", artista: "I Prevail", tipo: "Álbum", ano: 2019, generos: "Metalcore / Rock", nFaixas: 13,
      identidadeVisual: "Vermelho neon / azul noite", corDestaque: "#EF4057", vibes: ["Intenso", "Energia alta", "Nostálgico"], adicionado: 5, nota: 4.8,
      faixas: [f("Bow Down", "3:41"), f("Breaking Down", "3:32"), f("Paranoid", "3:14"), f("Every Time You Leave", "3:37", "I Prevail feat. Delaney Jane"), f("Rise Above It", "3:14")],
      extra: [f("Hurricane", "3:12")] },
    { id: "renovate", titulo: "Renovate", artista: "Until I Wake", tipo: "Álbum", ano: 2024, generos: "Metalcore", nFaixas: 3,
      identidadeVisual: "Ciano / azul profundo", corDestaque: "#37BFD3", vibes: ["Intenso", "Cinematográfico"], adicionado: 4, nota: 4.5,
      faixas: [f("Renovate", "3:46"), f("The Reverence", "3:31"), f("Hole Hearted", "3:13")] },
    { id: "arquivo-x", titulo: "ARQUIVO X", artista: "BLXCK", tipo: "Álbum", ano: 2026, generos: "Rap / Trap", nFaixas: 3,
      identidadeVisual: "Ferrugem / carvão", corDestaque: "#B96C4A", vibes: ["Noturno", "Foco"], adicionado: 3, nota: 4.1,
      faixas: [f("Faixa 01", "—"), f("Faixa 02", "—"), f("Faixa 03", "—")] },
    { id: "conglomerate", titulo: "CONGLOMERATE", artista: "Fimiguerrero, Len, Lancey Foux", tipo: "Álbum", ano: 2024, generos: "UK Rap", nFaixas: 13,
      identidadeVisual: "Monocromático", corDestaque: "#BFC0C0", vibes: ["Noturno", "Intenso"], adicionado: 2, nota: 4.5,
      faixas: [f("Blackbirds", "3:36", "Lancey Foux, Fimiguerrero, Len"), f("Kerosene", "2:18", "Fimiguerrero, Len"), f("After Life", "3:05", "Len, Fimiguerrero"), f("How High", "2:10", "Lancey Foux, Len"), f("Excuse My French", "1:27", "Fimiguerrero, Len"), f("Spanish Guitar", "3:03", "Lancey Foux, Fimiguerrero"), f("Osbatt", "4:03", "Fimiguerrero, Lancey Foux, Len"), f("Wet Mouth", "2:43", "Fimiguerrero, Len")] },
    { id: "chainsaw-man", titulo: "Chainsaw Man: Reze Arc", artista: "kensuke ushio", tipo: "Trilha sonora", ano: 2025, generos: "Trilha sonora", nFaixas: 30,
      identidadeVisual: "Azul névoa / vermelho flor", corDestaque: "#B93450", vibes: ["Cinematográfico", "Sem pressa", "Nostálgico"], adicionado: 1, nota: 4.6,
      faixas: [f("from below with love", "1:07"), f("our film", "1:09"), f("silly walk", "1:54"), f("first glance", "1:14"), f("daydream", "0:24")],
      extra: [f("in the pool", "1:31")] }
  ];

  /* Fábrica de artista curado: rotulo/meta derivados do tipo */
  function A(id, nome, ini, tipo, generos, desc, cor, nota, n, albums, pop, disco) {
    var rot = tipo === "Bandas" ? "BANDA" : tipo === "Compositores" ? "COMPOSITOR" : "ARTISTA SOLO";
    var pre = tipo === "Bandas" ? "Banda" : tipo === "Compositores" ? "Compositor" : "Artista solo";
    var art = {
      id: id, nome: nome, ini: ini, tipo: tipo, rotulo: rot, generos: generos, meta: tipo === "Compositores" ? "Compositor · " + generos : pre + " · " + generos,
      desc: desc, cor: cor, albums: albums, nota: nota, avaliacoes: n,
      popularesFallback: pop.map(function (p, i) { var x = p.split("|"); return { id: "fb:" + id + ":" + i, titulo: x[0], artista: x[1] || nome, fallback: true, dur: "—" }; }),
      discoFallback: disco.map(function (d) { var x = d.split("|"); return { titulo: x[0], tipo: x[1], ano: +x[2] }; })
    };
    return art;
  }

  var byId = {};
  albums.forEach(function (a) {
    a.capa = CAPA + a.id + ".jpg";
    byId[a.id] = a;
    (a.faixas.concat(a.extra || [])).forEach(function (t, i) {
      t.id = a.id + ":" + t.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      t.albumId = a.id;
      t.artista = t.artista || a.artista;
      t.n = i + 1;
    });
  });

  /* Catálogo externo (iTunes Search API): registro separado, em memória.
     Nunca altera nem substitui os álbuns/faixas de demonstração acima. */
  var ext = { albums: {}, tracks: {}, artists: {} };
  var localTrackById = {};
  albums.forEach(function (a) { a.faixas.concat(a.extra || []).forEach(function (t) { localTrackById[t.id] = t; }); });

  function upsert(map, o) {
    var cur = map[o.id];
    if (!cur) { map[o.id] = o; return o; }
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (v === undefined || v === null || v === "") return;
      if (k === "faixas" && !v.length) return;
      cur[k] = v;
    });
    return cur;
  }
  function values(map) { return Object.keys(map).map(function (k) { return map[k]; }); }

  function track(albumId, titulo) {
    var a = byId[albumId] || ext.albums[albumId];
    if (!a) return undefined;
    return a.faixas.concat(a.extra || []).filter(function (t) { return t.titulo === titulo; })[0];
  }

  B.data = {
    albums: albums,
    album: function (id) { return byId[id] || ext.albums[id]; },
    track: track,
    allTracks: function () {
      var out = [];
      albums.forEach(function (a) { out = out.concat(a.faixas, a.extra || []); });
      return out.concat(values(ext.tracks));
    },
    /* Complementares: o catálogo local e o externo coexistem */
    localTracks: function () {
      var out = [];
      albums.forEach(function (a) { out = out.concat(a.faixas, a.extra || []); });
      return out;
    },
    allAlbums: function () { return albums.concat(values(ext.albums)); },
    allArtists: function () { return B.data.artists.concat(values(ext.artists)); },
    getTrackById: function (id) { return localTrackById[id] || ext.tracks[id]; },
    getArtistById: function (id) { return ext.artists[id] || B.data.artists.filter(function (a) { return a.id === id; })[0]; },
    isExternal: function (id) { return typeof id === "string" && id.indexOf("itunes-") === 0; },
    registerAlbum: function (o) { return upsert(ext.albums, o); },
    registerTrack: function (o) { return upsert(ext.tracks, o); },
    registerArtist: function (o) { return upsert(ext.artists, o); },
    /* 9 artistas curados do wireframe v2. Notas/avaliações são ilustrativas. popularesFallback/discoFallback só aparecem se a Apple estiver indisponível. */
    artists: [
      A("blxck", "Blxck", "B", "Solo", "Anime rap · Rap / Trap", "Rap inspirado em personagens, narrativas e universos da cultura pop.", "#C97962", 4.8, 128, ["paris", "arquivo-x"],
        ["Pressão|Zaraki Kenpachi", "O Rei Voltou|Yhwach", "Anoitecer Cruel|Kokushibo", "O Escolhido|Michael Kaiser", "A Criança Demônio|Okita Souji", "Invisível|Toji Fushiguro"],
        ["ARQUIVO X|Álbum|2026", "PARIS|Single|2026"], "paris"),
      A("travis-scott", "Travis Scott", "T", "Solo", "Hip-hop · Trap", "Produção atmosférica, energia de palco e camadas psicodélicas no hip-hop.", "#C5A45A", 4.9, 2600, ["huncho-jack"],
        ["goosebumps", "SICKO MODE", "FE!N (feat. Playboi Carti)", "HIGHEST IN THE ROOM", "BUTTERFLY EFFECT", "90210 (feat. Kacy Hill)"],
        ["UTOPIA|Álbum|2023", "ASTROWORLD|Álbum|2018", "Rodeo|Álbum|2015", "JACKBOYS 2|Álbum|2025"]),
      A("kidwild", "Kidwild", "K", "Solo", "UK Rap · Hip-hop", "Rap britânico que combina melodias introspectivas, flows diretos e faixas curtas.", "#BD9362", 4.6, 98, ["jobs-not-done"],
        ["Redemption (feat. Nemzzz)", "Indecisive", "has to be you 2", "Popular Loner", "Fake Friends", "Victory Lap"],
        ["Job's Not Done|Álbum|2026", "Distro Kid|Álbum|2025", "Job's Still Not Done|Álbum|2026"]),
      A("i-prevail", "I Prevail", "IP", "Bandas", "Rock · Metalcore", "Metalcore contemporâneo que alterna peso, refrões expansivos e momentos melódicos.", "#DB5360", 4.7, 542, ["trauma"],
        ["Hurricane", "Blank Space", "Gasoline", "Scars", "Bow Down", "Breaking Down"],
        ["Violent Nature|Álbum|2025", "TRUE POWER|Álbum|2022", "TRAUMA|Álbum|2019", "Lifelines|Álbum|2016"]),
      A("until-i-wake", "Until I Wake", "UW", "Bandas", "Metalcore · Post-hardcore", "Guitarras densas, refrões melódicos e atmosferas de metalcore moderno.", "#43B5C8", 4.6, 214, ["renovate"],
        ["Self Medicated", "Octane", "Inside My Head", "Less Of Me", "Nightmares", "Cold"],
        ["Renovate|Álbum|2024", "Inside My Head (Deluxe)|Álbum|2023", "Inside My Head|Álbum|2022"]),
      A("fimiguerrero", "Fimiguerrero", "F", "Solo", "UK Rap · Hip-hop", "Rap britânico de estética crua, colaborações e batidas de energia imediata.", "#8C9298", 4.7, 97, ["conglomerate"],
        ["Tartan", "Sam", "Vogue", "MVP", "Mandy", "Skywalker"],
        ["New World Order|Álbum|2024", "CONGLOMERATE|Álbum|2024", "IMMIGRANT|Álbum|2023"]),
      A("len-lucci", "Len Lucci", "LL", "Solo", "UK Rap · Hip-hop", "Artista presente na cena de colaborações do rap britânico e no projeto CONGLOMERATE.", "#907BB5", 4.5, 62, ["conglomerate"],
        ["Osbatt", "Excuse My French", "Ankle Lock", "CHAKRa"],
        ["CONGLOMERATE|Projeto colaborativo|2024"]),
      A("lancey-foux", "Lancey Foux", "LF", "Solo", "UK Rap · Hip-hop experimental", "Rap experimental com mudanças de flow, texturas eletrônicas e estética visual marcante.", "#CC829F", 4.8, 391, ["conglomerate"],
        ["LANCEY OR LANCEY", "25WAGG3DOU2", "MMM HMM (feat. Sexyy Red)", "Luv monéy", "Black & Tan", "INDIA"],
        ["THE TIME OF OUR LIVES|Álbum|2026", "CONGLOMERATE|Álbum|2024", "LIFE IN HELL|Álbum|2022", "BACK2DATRAP|Álbum|2023"]),
      A("kensuke-ushio", "kensuke ushio", "KU", "Compositores", "Trilha sonora · Eletrônica", "Compositor japonês conhecido por trilhas que misturam texturas eletrônicas, piano e desenho sonoro.", "#7294B8", 4.9, 186, ["chainsaw-man"],
        ["in the pool", "in the sea", "Smells Blood", "slow summer eve", "the city mouse and the country mouse"],
        ["CHAINSAW MAN THE MOVIE: REZE ARC|Trilha sonora|2025", "Dan Da Dan|Trilha sonora|2024", "DEVILMAN crybaby|Trilha sonora|2018", "A Shape of Light|Álbum|2016"])
    ],
    user: { nome: "Victor Carvalho", usuario: "ouvindocomintencao", desde: 2024, ini: "VC", generos: ["Rock alternativo", "Rap", "Trilhas"] },
    playlist: { nome: "Graves, guitarras & noites longas", descricao: "Uma coleção de contrastes: rap sombrio, metalcore, texturas eletrônicas e trilhas cinematográficas. Cada faixa tem um contexto.", privada: true },
    defaultQueue: [["renovate", "Renovate"], ["trauma", "Breaking Down"], ["conglomerate", "Blackbirds"], ["jobs-not-done", "Job's Not Done (feat. ERA)"], ["chainsaw-man", "in the pool"], ["huncho-jack", "Eye 2 Eye"], ["paris", "PARIS"]],
    reviews: [
      { id: "r1", titulo: "Renovate: clareza no caos", albumId: "renovate", nota: 4.5, data: 4 },
      { id: "r2", titulo: "A estética de Conglomerate", albumId: "conglomerate", nota: 4.5, data: 3 },
      { id: "r3", titulo: "Uma trilha para a Reze Arc", albumId: "chainsaw-man", nota: 4.5, data: 2 },
      { id: "r4", titulo: "Rap como relato de persistência", albumId: "jobs-not-done", nota: 4.5, data: 1 }
    ],
    accents: [
      { nome: "Laranja", hex: "#F0783C" }, { nome: "Verde", hex: "#4CA77D" }, { nome: "Amarelo", hex: "#E0B63C" },
      { nome: "Azul", hex: "#5F7DE1" }, { nome: "Ciano", hex: "#38B8C7" }, { nome: "Roxo", hex: "#9C79DB" }, { nome: "Cinza", hex: "#8E969F" }
    ],
    energy: { "Blackbirds": "Alta", "Kerosene": "Média", "After Life": "Baixa", "How High": "Alta", "Excuse My French": "Alta", "Spanish Guitar": "Média", "Osbatt": "Baixa", "Wet Mouth": "Média" }
  };
})(window.Batuque);
