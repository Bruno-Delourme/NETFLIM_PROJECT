const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/connection');
const Movie = require('./Movie');

class Like {
  constructor(userId, movieId, isLiked = true) {
    this.id = uuidv4();
    this.userId = userId;
    this.movieId = movieId;
    this.isLiked = isLiked;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Créer ou mettre à jour un like
  static async createOrUpdate(userId, movieId, isLiked = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getDatabase();
        
        // D'abord, créer ou mettre à jour le film dans notre base
        // (cette partie sera gérée par l'API qui reçoit les données du film)
        
        const sql = `
          INSERT OR REPLACE INTO likes 
          (id, user_id, movie_id, is_liked, created_at, updated_at)
          VALUES (
            COALESCE((SELECT id FROM likes WHERE user_id = ? AND movie_id = ?), ?),
            ?, ?, ?, 
            COALESCE((SELECT created_at FROM likes WHERE user_id = ? AND movie_id = ?), CURRENT_TIMESTAMP),
            CURRENT_TIMESTAMP
          )
        `;
        
        const likeId = uuidv4();
        
        db.run(sql, [
          userId, movieId, // Pour COALESCE
          likeId,
          userId, 
          movieId, 
          isLiked,
          userId, movieId // Pour COALESCE created_at
        ], function(err) {
          if (err) {
            console.error('Erreur lors de la création/mise à jour du like:', err);
            reject(err);
            return;
          }
          
          resolve(new Like(userId, movieId, isLiked));
        });
      } catch (error) {
        console.error('Erreur lors de la création du like:', error);
        reject(error);
      }
    });
  }

  // Obtenir le statut de like d'un utilisateur pour un film
  static async getUserLikeStatus(userId, movieId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM likes WHERE user_id = ? AND movie_id = ?';
      
      db.get(sql, [userId, movieId], (err, row) => {
        if (err) {
          console.error('Erreur lors de la récupération du statut de like:', err);
          reject(err);
          return;
        }
        
        resolve(row || null);
      });
    });
  }

  // Supprimer un like
  static async remove(userId, movieId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'DELETE FROM likes WHERE user_id = ? AND movie_id = ?';
      
      db.run(sql, [userId, movieId], function(err) {
        if (err) {
          console.error('Erreur lors de la suppression du like:', err);
          reject(err);
          return;
        }
        
        resolve({ deleted: this.changes > 0 });
      });
    });
  }

  // Obtenir tous les likes d'un utilisateur
  static async getUserLikes(userId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT l.*, m.title, m.poster_path, m.release_date, m.vote_average
        FROM likes l
        INNER JOIN movies m ON l.movie_id = m.id
        WHERE l.user_id = ?
        ORDER BY l.updated_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des likes de l\'utilisateur:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
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

  // Obtenir les films non aimés par un utilisateur
  static async getDislikedMovies(userId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT m.*, l.created_at as disliked_at
        FROM movies m
        INNER JOIN likes l ON m.id = l.movie_id
        WHERE l.user_id = ? AND l.is_liked = 0
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des films non aimés:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }

  // Obtenir les statistiques globales
  static async getGlobalStats() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(CASE WHEN is_liked = 1 THEN 1 END) as total_likes,
          COUNT(CASE WHEN is_liked = 0 THEN 1 END) as total_dislikes,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT movie_id) as unique_movies
        FROM likes
      `;
      
      db.get(sql, (err, row) => {
        if (err) {
          console.error('Erreur lors de la récupération des statistiques globales:', err);
          reject(err);
          return;
        }
        
        resolve({
          totalInteractions: row.total_interactions || 0,
          totalLikes: row.total_likes || 0,
          totalDislikes: row.total_dislikes || 0,
          uniqueUsers: row.unique_users || 0,
          uniqueMovies: row.unique_movies || 0
        });
      });
    });
  }

  // Obtenir tous les likes
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT l.*, m.title as movie_title, u.session_id
        FROM likes l
        LEFT JOIN movies m ON l.movie_id = m.id
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
      `;
      
      db.all(sql, (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des likes:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }
}

module.exports = Like;
