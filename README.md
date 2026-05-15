# FPV OS — Setup Guide

## Structure du projet

```
fpvos/
├── public/
│   ├── audio/            ← ajoute tes fichiers sons ici (.mp3)
│   │   ├── boot.mp3
│   │   ├── click.mp3
│   │   ├── hover.mp3
│   │   ├── menu-open.mp3
│   │   ├── navigate.mp3
│   │   ├── roulette-land.mp3
│   │   ├── roulette-spin.mp3
│   │   └── roulette-tick.mp3
│   └── logos/            ← ajoute tes logos PNG ici
│       └── example.png
├── src/
│   ├── FPVOS_Final.jsx   ← composant principal
│   └── main.jsx          ← point d'entrée
├── index.html
├── package.json
└── vite.config.js
```

## Installation

```bash
# 1. Installe les dépendances
npm install

# 2. Lance en local
npm run dev
# → ouvre http://localhost:5173

# 3. Build pour la production
npm run build
# → génère le dossier /dist
```

## Déploiement sur Vercel

1. Push le projet sur GitHub
2. Va sur https://vercel.com → "New Project"
3. Connecte ton repo
4. Vercel détecte Vite automatiquement
5. Clique Deploy ✅

## Déploiement sur Netlify

1. Push le projet sur GitHub
2. Va sur https://netlify.com → "Add new site"
3. Connecte ton repo
4. Build command : `npm run build`
5. Publish directory : `dist`
6. Clique Deploy ✅

## Activer les sons

Dans `FPVOS_Final.jsx`, trouve la fonction `useAudio` et décommente les lignes :

```js
// AVANT
refs.current[n] = new Audio(`/audio/${n}.mp3`);

// APRÈS (décommente)
refs.current[n] = new Audio(`/audio/${n}.mp3`);
refs.current[n].preload = 'auto';
```

Et pour jouer un son :
```js
// AVANT
// refs.current[name]?.play().catch(()=>{});

// APRÈS (décommente)
refs.current[name]?.play().catch(()=>{});
```

## Ajouter des sites

Dans `FPVOS_Final.jsx`, trouve le tableau `SITES` et ajoute une entrée :

```js
{
  id: 19,
  name: "Mon Site FPV",
  desc: "Description du site...",
  cat: "Shops",           // doit correspondre à un id dans CATS
  tags: ["Tag1", "Tag2", "Tag3"],
  emoji: "🚁",
  color: "#FF6B35",       // couleur accent du site
  url: "https://monsite.com",
  featured: false,        // apparaît dans la featured card
  trending: false,        // apparaît dans trending sidebar
}
```
