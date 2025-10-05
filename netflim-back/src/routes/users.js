const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validatePagination } = require('../middleware/validation');

// Obtenir les informations d'un utilisateur
router.get('/me', async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer ou créer l'utilisateur
    const user = await User.findOrCreate(sessionId);
    const stats = await User.getStats(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          sessionId: user.session_id,
          createdAt: user.created_at
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les statistiques d'un utilisateur
router.get('/me/stats', async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.ip;

    // Récupérer l'utilisateur
    const user = await User.findBySessionId(sessionId);
    
    if (!user) {
      return res.json({
        success: true,
        data: {
          totalLikes: 0,
          likedMovies: 0,
          dislikedMovies: 0
        }
      });
    }

    const stats = await User.getStats(user.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les films aimés par l'utilisateur
router.get('/me/liked-movies', validatePagination, async (req, res, next) => {
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
          offset,
          genres: [],
          commonGenres: []
        }
      });
    }

    const movies = await User.getLikedMovies(user.id, limit, offset);
    const stats = await User.getStats(user.id);
    
    // Récupérer les genres des films aimés
    const genres = await User.getLikedMoviesGenres(user.id);
    const commonGenres = await User.getCommonGenres(user.id);

    res.json({
      success: true,
      data: {
        movies,
        stats,
        genres,
        commonGenres,
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

// Générer un nouvel ID de session
router.post('/new-session', async (req, res, next) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const newSessionId = uuidv4();

    res.json({
      success: true,
      data: {
        sessionId: newSessionId,
        message: 'Nouvelle session créée'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
