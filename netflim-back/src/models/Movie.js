const { getDatabase } = require('../database/connection');

class Movie {
  constructor(movieData) {
    this.id = movieData.id;
    this.title = movieData.title;
    this.overview = movieData.overview;
    this.posterPath = movieData.poster_path;
    this.releaseDate = movieData.release_date;
    this.voteAverage = movieData.vote_average;
    this.voteCount = movieData.vote_count;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Créer ou mettre à jour un film
  static async createOrUpdate(movieData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // Convertir les genres en JSON si c'est un tableau
      let genresJson = null;
      if (movieData.genres && Array.isArray(movieData.genres)) {
        genresJson = JSON.stringify(movieData.genres);
      } else if (movieData.genres) {
        genresJson = movieData.genres;
      }
      
      const sql = `
        INSERT OR REPLACE INTO movies 
        (id, title, overview, poster_path, release_date, vote_average, vote_count, genres, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 
                COALESCE((SELECT created_at FROM movies WHERE id = ?), CURRENT_TIMESTAMP),
                CURRENT_TIMESTAMP)
      `;
      
      db.run(sql, [
        movieData.id,
        movieData.title,
        movieData.overview,
        movieData.poster_path,
        movieData.release_date,
        movieData.vote_average,
        movieData.vote_count,
        genresJson,
        movieData.id // Pour COALESCE
      ], function(err) {
        if (err) {
          console.error('Erreur lors de la création/mise à jour du film:', err);
          reject(err);
          return;
        }
        
        resolve(new Movie(movieData));
      });
    });
  }

  // Trouver un film par ID
  static async findById(movieId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM movies WHERE id = ?';
      
      db.get(sql, [movieId], (err, row) => {
        if (err) {
          console.error('Erreur lors de la recherche du film:', err);
          reject(err);
          return;
        }
        
        resolve(row || null);
      });
    });
  }

  // Obtenir les statistiques de likes d'un film
  static async getLikeStats(movieId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(CASE WHEN is_liked = 1 THEN 1 END) as likes,
          COUNT(CASE WHEN is_liked = 0 THEN 1 END) as dislikes
        FROM likes 
        WHERE movie_id = ?
      `;
      
      db.get(sql, [movieId], (err, row) => {
        if (err) {
          console.error('Erreur lors de la récupération des statistiques du film:', err);
          reject(err);
          return;
        }
        
        resolve({
          totalInteractions: row.total_interactions || 0,
          likes: row.likes || 0,
          dislikes: row.dislikes || 0
        });
      });
    });
  }

  // Obtenir les films les plus aimés
  static async getMostLiked(limit = 20) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT 
          m.*,
          COUNT(CASE WHEN l.is_liked = 1 THEN 1 END) as like_count,
          COUNT(CASE WHEN l.is_liked = 0 THEN 1 END) as dislike_count
        FROM movies m
        LEFT JOIN likes l ON m.id = l.movie_id
        GROUP BY m.id
        HAVING like_count > 0
        ORDER BY like_count DESC, m.vote_average DESC
        LIMIT ?
      `;
      
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des films les plus aimés:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }

  // Rechercher des films par titre
  static async searchByTitle(searchTerm, limit = 50) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT * FROM movies 
        WHERE title LIKE ? 
        ORDER BY vote_average DESC, vote_count DESC
        LIMIT ?
      `;
      
      db.all(sql, [`%${searchTerm}%`, limit], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la recherche de films:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }

  // Obtenir les films récents
  static async getRecent(limit = 20) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT * FROM movies 
        WHERE release_date IS NOT NULL 
        ORDER BY release_date DESC, created_at DESC
        LIMIT ?
      `;
      
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des films récents:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      });
    });
  }
}

module.exports = Movie;
