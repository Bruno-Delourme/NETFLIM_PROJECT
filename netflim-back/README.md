# 🎬 Netflim Backend - API de Likes

Backend API pour le système de likes de Netflim, construit avec Node.js, Express et SQLite.

## ✨ Fonctionnalités

- 🔐 **Gestion des utilisateurs** : Système de session automatique
- ❤️ **Système de likes** : Like/Dislike des films avec statistiques
- 📊 **Statistiques** : Statistiques utilisateur et globales
- 🎬 **Gestion des films** : Stockage et récupération des données de films
- 🛡️ **Sécurité** : Rate limiting, validation des données, gestion d'erreurs
- 📱 **API RESTful** : Endpoints bien structurés avec documentation

## 🚀 Installation et Démarrage

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer l'environnement** :
   ```bash
   cp env.example .env
   # Modifier les variables dans .env selon vos besoins
   ```

3. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

4. **Initialiser la base de données** :
   ```bash
   npm run init-db
   ```

## 🛠️ Technologies Utilisées

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Base de données légère
- **Joi** - Validation des données
- **Helmet** - Sécurité HTTP
- **CORS** - Gestion des origines croisées
- **Morgan** - Logging des requêtes

## 📁 Structure du Projet

```
src/
├── database/          # Configuration de la base de données
│   └── connection.js  # Connexion et initialisation SQLite
├── models/           # Modèles de données
│   ├── User.js       # Modèle utilisateur
│   ├── Movie.js      # Modèle film
│   └── Like.js       # Modèle like
├── routes/           # Routes API
│   ├── likes.js      # Routes pour les likes
│   └── users.js      # Routes pour les utilisateurs
├── middleware/       # Middlewares
│   ├── errorHandler.js   # Gestion d'erreurs
│   ├── notFound.js       # Route 404
│   └── validation.js     # Validation des données
└── server.js         # Point d'entrée du serveur
```

## 🔌 API Endpoints

### Utilisateurs
- `GET /api/users/me` - Informations de l'utilisateur
- `GET /api/users/me/stats` - Statistiques de l'utilisateur
- `GET /api/users/me/liked-movies` - Films aimés par l'utilisateur
- `POST /api/users/new-session` - Générer une nouvelle session

### Likes
- `POST /api/likes` - Créer ou modifier un like
- `GET /api/likes/:movieId/status` - Statut de like d'un film
- `DELETE /api/likes/:movieId` - Supprimer un like
- `GET /api/likes/user/likes` - Tous les likes de l'utilisateur
- `GET /api/likes/user/liked-movies` - Films aimés
- `GET /api/likes/user/disliked-movies` - Films non aimés
- `GET /api/likes/stats/global` - Statistiques globales
- `GET /api/likes/movies/most-liked` - Films les plus aimés

### Santé
- `GET /health` - Vérification de l'état du serveur

## 🗄️ Base de Données

### Tables

#### users
- `id` (TEXT, PRIMARY KEY) - UUID de l'utilisateur
- `session_id` (TEXT, UNIQUE) - ID de session
- `created_at` (DATETIME) - Date de création
- `updated_at` (DATETIME) - Date de mise à jour

#### movies
- `id` (INTEGER, PRIMARY KEY) - ID du film (TMDB)
- `title` (TEXT) - Titre du film
- `overview` (TEXT) - Synopsis
- `poster_path` (TEXT) - Chemin du poster
- `release_date` (TEXT) - Date de sortie
- `vote_average` (REAL) - Note moyenne
- `vote_count` (INTEGER) - Nombre de votes
- `created_at` (DATETIME) - Date de création
- `updated_at` (DATETIME) - Date de mise à jour

#### likes
- `id` (TEXT, PRIMARY KEY) - UUID du like
- `user_id` (TEXT) - ID de l'utilisateur
- `movie_id` (INTEGER) - ID du film
- `is_liked` (BOOLEAN) - Statut du like (true/false)
- `created_at` (DATETIME) - Date de création
- `updated_at` (DATETIME) - Date de mise à jour

## 🔧 Configuration

### Variables d'environnement (.env)

```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/netflim.db
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Scripts Disponibles

- `npm start` - Démarrer le serveur en production
- `npm run dev` - Démarrer le serveur de développement avec nodemon
- `npm run init-db` - Initialiser la base de données
- `npm test` - Lancer les tests (à implémenter)

## 🔒 Sécurité

- **Rate Limiting** : Limitation des requêtes par IP
- **CORS** : Configuration des origines autorisées
- **Helmet** : Headers de sécurité HTTP
- **Validation** : Validation stricte des données d'entrée
- **Gestion d'erreurs** : Gestion centralisée des erreurs

## 📊 Statistiques

L'API fournit des statistiques détaillées :

### Utilisateur
- Nombre de films aimés
- Nombre de films non aimés
- Total des interactions

### Globales
- Nombre d'utilisateurs actifs
- Nombre de films évalués
- Total des likes/dislikes
- Total des interactions

## 🔄 Gestion des Sessions

Le système utilise un ID de session unique stocké dans le localStorage du frontend. Chaque utilisateur est automatiquement créé lors de sa première interaction.

## 📝 Logs

Le serveur utilise Morgan pour logger toutes les requêtes HTTP avec des informations détaillées.

## 🐛 Gestion d'Erreurs

- Erreurs de validation (400)
- Ressources non trouvées (404)
- Conflits de données (409)
- Erreurs serveur (500)
- Gestion des erreurs de base de données

## 📄 Licence

Ce projet est à des fins éducatives et de démonstration.
