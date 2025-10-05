# 🎬 Netflim - Site de Recherche de Films

Une application web moderne de recherche de films construite avec React, Vite et l'API The Movie Database (TMDB).

## ✨ Fonctionnalités

- 🔍 **Recherche de films** : Recherchez des films par titre
- 📱 **Interface responsive** : Optimisée pour tous les appareils
- 🎨 **Design moderne** : Interface utilisateur élégante avec animations
- 📄 **Détails complets** : Pages détaillées pour chaque film
- ⭐ **Films populaires** : Affichage des films tendance au démarrage
- 🔄 **Chargement infini** : Chargez plus de films automatiquement

## 🚀 Installation et Démarrage

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Ouvrir l'application** :
   Ouvrez votre navigateur et allez à `http://localhost:5173`

## 🛠️ Technologies Utilisées

- **React 18** - Bibliothèque JavaScript pour l'interface utilisateur
- **Vite** - Outil de build rapide et moderne
- **React Router** - Navigation entre les pages
- **Axios** - Client HTTP pour les appels API
- **The Movie Database API** - Source de données des films

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── SearchBar.jsx   # Barre de recherche
│   ├── MovieCard.jsx   # Carte d'affichage d'un film
│   ├── MovieList.jsx   # Liste des films
│   └── MovieDetails.jsx # Page de détails d'un film
├── services/           # Services API
│   └── movieApi.js     # Configuration et fonctions API
├── App.jsx            # Composant principal
├── main.jsx           # Point d'entrée de l'application
└── index.css          # Styles CSS globaux
```

## 🎯 Utilisation

1. **Page d'accueil** : Affiche les films populaires par défaut
2. **Recherche** : Tapez le nom d'un film dans la barre de recherche
3. **Détails** : Cliquez sur une carte de film pour voir les détails complets
4. **Navigation** : Utilisez le bouton "Retour" pour revenir à la liste

## 🔧 Configuration API

L'application utilise l'API The Movie Database. Le token d'authentification est configuré dans `src/services/movieApi.js`.

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à :
- 📱 Mobiles (320px+)
- 📱 Tablettes (768px+)
- 💻 Desktops (1024px+)

## 🎨 Fonctionnalités UI/UX

- **Animations fluides** : Transitions et effets hover
- **Design moderne** : Dégradés et ombres élégantes
- **Feedback visuel** : États de chargement et d'erreur
- **Accessibilité** : Navigation au clavier et contraste optimisé

## 🚀 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Vérifie le code avec ESLint

## 📄 Licence

Ce projet est à des fins éducatives et de démonstration.
