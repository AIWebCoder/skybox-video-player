# Skybox VR Player

Application VR Next.js avec A-Frame pour la lecture de vidéos en réalité virtuelle.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure

- `/app` - Pages Next.js (App Router)
- `/components` - Composants React/A-Frame
- `/data` - Données (vidéos, channels, etc.)
- `/types` - Types TypeScript
- `/models` - Modèles 3D (GLB)
- `/thumbnails` - Miniatures vidéo
- `/icons` - Icônes pour les channels

## Pages

- `/` - Page d'accueil
- `/vr` - Interface VR principale

## Assets requis

Placez vos fichiers dans le dossier `/public` :

- `/public/models/skybox.glb` - Modèle 3D du skybox
- `/public/thumbnails/video1.jpg`, `video2.jpg`, etc. - Miniatures des vidéos
- `/public/icons/home.png`, `vr.png`, `network.png`, `air.png`, `hidden.png` - Icônes des channels

**Note :** Les dossiers `public/models`, `public/thumbnails` et `public/icons` ont été créés automatiquement.

