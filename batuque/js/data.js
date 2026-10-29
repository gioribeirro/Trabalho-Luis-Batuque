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

  function track(albumId, titulo) {
    var a = byId[albumId];
    return a.faixas.concat(a.extra || []).filter(function (t) { return t.titulo === titulo; })[0];
  }

  B.data = {
    albums: albums,
    album: function (id) { return byId[id]; },
    track: track,
    allTracks: function () {
      var out = [];
      albums.forEach(function (a) { out = out.concat(a.faixas, a.extra || []); });
      return out;
    },
    artists: [
      { id: "blxck", nome: "BLXCK", ini: "B", desc: "Rap / Trap · lançamentos na seleção", tipo: "Solo", albums: ["paris", "arquivo-x"] },
      { id: "kidwild", nome: "Kidwild", ini: "K", desc: "UK Rap · projetos recentes", tipo: "Solo", albums: ["jobs-not-done"] },
      { id: "i-prevail", nome: "I Prevail", ini: "IP", desc: "Rock / Metalcore · álbum conceitual", tipo: "Bandas", albums: ["trauma"] },
      { id: "until-i-wake", nome: "Until I Wake", ini: "UW", desc: "Metalcore · produção atmosférica", tipo: "Bandas", albums: ["renovate"] },
      { id: "fimiguerrero", nome: "Fimiguerrero", ini: "F", desc: "UK Rap · colaborações", tipo: "Solo", albums: ["conglomerate"] },
      { id: "kensuke-ushio", nome: "kensuke ushio", ini: "KU", desc: "Trilha sonora · desenho sonoro", tipo: "Compositores", albums: ["chainsaw-man"] },
      { id: "travis-quavo", nome: "Travis Scott & Quavo", ini: "TQ", desc: "Hip-hop · duo / colaboração", tipo: "Bandas", albums: ["huncho-jack"] }
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
