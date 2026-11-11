# Batuque — Music Journal

Site front-end avaliador de música: biblioteca, resenhas, estatísticas de escuta, artistas, perfil e prévias de 30 s.
Projeto em HTML, CSS e JavaScript puros (sem frameworks, sem build, **sem back-end**).

## Como abrir
Abra `batuque/index.html` no navegador (funciona via `file://`; é preciso internet para a Apple e as fontes).

## Integração com a Apple (iTunes Search API)
- Pesquisa de álbuns, faixas e artistas, prévias de 30 s e discografias, via JSONP (sem chave).
- Fila com no máximo 18 chamadas/min e 2 em paralelo, cache de 10 min, cancelamento de buscas antigas.
- Nenhum áudio é baixado ou guardado; no `localStorage` ficam só IDs e números.
- Atribuição "Provided courtesy of iTunes" exibida junto ao conteúdo da Apple.
- **Pendente:** o badge oficial da Apple (ver `batuque/assets/img/apple/LEIA-ME.txt`). Não foi desenhado nem improvisado.

## Telas
Início · Descobrir · Minha biblioteca · Página de álbum · Perfil · Resenhas · Playlists · Artistas (diretório) ·
Perfil do artista · Avaliar artista · Agora tocando · Estatísticas · Configurações ·
Entrar · Criar conta · Recuperar acesso · Monte seu perfil.
Tudo que é "da conta" é **simulado** no navegador (`localStorage`); nenhuma senha é guardada.

## Estrutura
```
batuque/
├── index.html
├── css/    tokens · base · layout · components · pages · auth · animations
├── js/     data · itunes · store · session · theme · player · components · router · app
│   └── pages/  uma página por arquivo (inclui artista, avaliar-artista, login, criar-conta, ...)
└── assets/ img/capas · img/apple
```
Notas e avaliações da comunidade são conteúdo de demonstração.
file:///C:/Users/giova/Downloads/Trabalho-Luis-Batuque-main/Trabalho-Luis-Batuque-main/Trabalho-Luis-Batuque-itunes/batuque/index.html#/descobrir

 Backend (pasta backend/)

É Node.js + Express + SQLite, sem banco para instalar, porque o arquivo do banco é criado sozinho.


## Para rodar

-cd backend; npm install; npm start
