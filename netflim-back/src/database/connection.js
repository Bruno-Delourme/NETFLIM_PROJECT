const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/netflim.db');

let db = null;

// Initialisation de la base de données
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      // Créer le dossier database s'il n'existe pas
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Ouvrir la connexion à la base de données
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'ouverture de la base de données:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Connexion à la base de données SQLite établie');
        
        // Activer les clés étrangères
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'activation des clés étrangères:', err);
            reject(err);
            return;
          }
          
          // Créer les tables
          createTables()
            .then(() => resolve())
            .catch(reject);
        });
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      reject(error);
    }
  });
}

// Création des tables
async function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      // Table des utilisateurs
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Table des films
      `CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        overview TEXT,
        poster_path TEXT,
        release_date TEXT,
        vote_average REAL,
        vote_count INTEGER,
        genres TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Table des likes
      `CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        movie_id INTEGER NOT NULL,
        is_liked BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
        UNIQUE(user_id, movie_id)
      )`
    ];

    let completed = 0;
    const total = tables.length;

    // Créer d'abord les tables
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`❌ Erreur lors de la création de la table ${index + 1}:`, err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          console.log('✅ Toutes les tables ont été créées avec succès');
          // Créer les index après les tables
          createIndexes()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  });
}

// Création des index
async function createIndexes() {
  return new Promise((resolve, reject) => {
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_likes_movie_id ON likes(movie_id)`,
      `CREATE INDEX IF NOT EXISTS idx_likes_user_movie ON likes(user_id, movie_id)`,
      `CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title)`,
      `CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id)`
    ];

    let completed = 0;
    const total = indexes.length;

    indexes.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`❌ Erreur lors de la création de l'index ${index + 1}:`, err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          console.log('✅ Tous les index ont été créés avec succès');
          resolve();
        }
      });
    });
  });
}

// Obtenir l'instance de la base de données
function getDatabase() {
  if (!db) {
    throw new Error('Base de données non initialisée. Appelez initializeDatabase() d\'abord.');
  }
  return db;
}

// Fermer la connexion à la base de données
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Erreur lors de la fermeture de la base de données:', err);
          reject(err);
        } else {
          console.log('✅ Connexion à la base de données fermée');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};
