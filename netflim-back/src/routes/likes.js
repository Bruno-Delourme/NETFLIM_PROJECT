const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { validateLike, validatePagination } = require('../middleware/validation');

// Créer ou mettre à jour un like
router.post('/', validateLike, async (req, res, next) => {
  try {
    const { movieId, isLiked, movieData } = req.body;
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Créer ou récupérer l'utilisateur
    const user = await User.findOrCreate(sessionId);

    // Si on a les données du film, les sauvegarder
    if (movieData) {
      await Movie.createOrUpdate(movieData);
    }

    // Créer ou mettre à jour le like
    const like = await Like.createOrUpdate(user.id, movieId, isLiked);

    // Récupérer les statistiques du film
    const movieStats = await Movie.getLikeStats(movieId);

    res.status(201).json({
      success: true,
      message: isLiked ? 'Film ajouté aux favoris' : 'Film ajouté aux non-favoris',
      data: {
        like: {
          id: like.id,
          userId: like.userId,
          movieId: like.movieId,
          isLiked: like.isLiked,
          createdAt: like.createdAt
        },
        movieStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir le statut de like d'un utilisateur pour un film
router.get('/:movieId/status', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer l'utilisateur
    const user = await User.findBySessionId(sessionId);
    
    if (!user) {
      return res.json({
        success: true,
        data: {
          isLiked: null,
          movieStats: await Movie.getLikeStats(parseInt(movieId))
        }
      });
    }

    // Récupérer le statut de like
    const likeStatus = await Like.getUserLikeStatus(user.id, parseInt(movieId));
    const movieStats = await Movie.getLikeStats(parseInt(movieId));

    res.json({
      success: true,
      data: {
        isLiked: likeStatus ? likeStatus.is_liked : null,
        movieStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Supprimer un like
router.delete('/:movieId', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer l'utilisateur
    const user = await User.findBySessionId(sessionId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer le like
    const result = await Like.remove(user.id, parseInt(movieId));
    
    if (!result.deleted) {
      return res.status(404).json({
        success: false,
        message: 'Like non trouvé'
      });
    }

    // Récupérer les nouvelles statistiques du film
    const movieStats = await Movie.getLikeStats(parseInt(movieId));

    res.json({
      success: true,
      message: 'Like supprimé avec succès',
      data: {
        movieStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir tous les likes d'un utilisateur
router.get('/user/likes', validatePagination, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer l'utilisateur
    const user = await User.findBySessionId(sessionId);
    
    if (!user) {
      return res.json({
        success: true,
        data: {
          likes: [],
          total: 0,
          limit,
          offset
        }
      });
    }

    // Récupérer les likes de l'utilisateur
    const likes = await Like.getUserLikes(user.id, limit, offset);
    const stats = await User.getStats(user.id);

    res.json({
      success: true,
      data: {
        likes,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.totalLikes
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les films aimés par un utilisateur
router.get('/user/liked-movies', validatePagination, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer l'utilisateur
    const user = await User.findBySessionId(sessionId);
    
    if (!user) {
      return res.json({
        success: true,
        data: {
          movies: [],
          total: 0,
          limit,
          offset
        }
      });
    }

    // Récupérer les films aimés
    const movies = await Like.getLikedMovies(user.id, limit, offset);
    const stats = await User.getStats(user.id);

    res.json({
      success: true,
      data: {
        movies,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.likedMovies
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les films non aimés par un utilisateur
router.get('/user/disliked-movies', validatePagination, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer l'utilisateur
    const user = await User.findBySessionId(sessionId);
    
    if (!user) {
      return res.json({
        success: true,
        data: {
          movies: [],
          total: 0,
          limit,
          offset
        }
      });
    }

    // Récupérer les films non aimés
    const movies = await Like.getDislikedMovies(user.id, limit, offset);
    const stats = await User.getStats(user.id);

    res.json({
      success: true,
      data: {
        movies,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.dislikedMovies
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les statistiques globales
router.get('/stats/global', async (req, res, next) => {
  try {
    const stats = await Like.getGlobalStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les films les plus aimés
router.get('/movies/most-liked', validatePagination, async (req, res, next) => {
  try {
    const { limit } = req.query;
    const movies = await Movie.getMostLiked(limit);
    
    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          limit,
          total: movies.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
