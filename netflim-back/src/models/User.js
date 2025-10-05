const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');

class User {
  constructor(sessionId) {
    this.id = uuidv4();
    this.sessionId = sessionId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Créer un nouvel utilisateur
  static async create(sessionId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const user = new User(sessionId);
      
      const sql = `
        INSERT INTO users (id, session_id, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, [user.id, user.sessionId, user.createdAt, user.updatedAt], function(err) {
        if (err) {
          console.error('Erreur lors de la création de l\'utilisateur:', err);
          reject(err);
          return;
        }
        
        resolve(user);
      });
    });
  }

  // Trouver un utilisateur par session ID
  static async findBySessionId(sessionId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM users WHERE session_id = ?';
      
      db.get(sql, [sessionId], (err, row) => {
        if (err) {
          console.error('Erreur lors de la recherche de l\'utilisateur:', err);
          reject(err);
          return;
        }
        
        resolve(row || null);
      });
    });
  }

  // Trouver ou créer un utilisateur par session ID
  static async findOrCreate(sessionId) {
    try {
      let user = await this.findBySessionId(sessionId);
      
      if (!user) {
        user = await this.create(sessionId);
      }
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la recherche/création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'un utilisateur
  static async getStats(userId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT 
          COUNT(*) as total_likes,
          COUNT(CASE WHEN is_liked = 1 THEN 1 END) as liked_movies,
          COUNT(CASE WHEN is_liked = 0 THEN 1 END) as disliked_movies
        FROM likes 
        WHERE user_id = ?
      `;
      
      db.get(sql, [userId], (err, row) => {
        if (err) {
          console.error('Erreur lors de la récupération des statistiques:', err);
          reject(err);
          return;
        }
        
        resolve({
          totalLikes: row.total_likes || 0,
          likedMovies: row.liked_movies || 0,
          dislikedMovies: row.disliked_movies || 0
        });
      });
    });
  }

  // Obtenir les films aimés par un utilisateur
  static async getLikedMovies(userId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT m.*, l.created_at as liked_at
        FROM movies m
        INNER JOIN likes l ON m.id = l.movie_id
        WHERE l.user_id = ? AND l.is_liked = 1
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des films aimés:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }

  // Obtenir les genres des films aimés par un utilisateur
  static async getLikedMoviesGenres(userId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT DISTINCT m.genres
        FROM movies m
        INNER JOIN likes l ON m.id = l.movie_id
        WHERE l.user_id = ? AND l.is_liked = 1 AND m.genres IS NOT NULL
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des genres:', err);
          reject(err);
          return;
        }
        
        // Parser les genres JSON et les compter
        const genreCount = {};
        rows.forEach(row => {
          try {
            const genres = JSON.parse(row.genres);
            genres.forEach(genre => {
              genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
            });
          } catch (e) {
            // Ignorer les genres malformés
          }
        });
        
        // Trier par nombre d'occurrences
        const sortedGenres = Object.entries(genreCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        resolve(sortedGenres);
      });
    });
  }

  // Obtenir les genres les plus communs parmi tous les utilisateurs
  static async getCommonGenres(userId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT m.genres
        FROM movies m
        INNER JOIN likes l ON m.id = l.movie_id
        WHERE l.is_liked = 1 AND m.genres IS NOT NULL
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des genres communs:', err);
          reject(err);
          return;
        }
        
        // Parser les genres JSON et les compter
        const genreCount = {};
        rows.forEach(row => {
          try {
            const genres = JSON.parse(row.genres);
            genres.forEach(genre => {
              genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
            });
          } catch (e) {
            // Ignorer les genres malformés
          }
        });
        
        // Trier par nombre d'occurrences et prendre le top 10
        const sortedGenres = Object.entries(genreCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        resolve(sortedGenres);
      });
    });
  }
}

module.exports = User;
