const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Movie = require('../models/Movie');
const User = require('../models/User');

// Route pour obtenir tous les utilisateurs
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.getAll();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir tous les films
router.get('/movies', async (req, res, next) => {
  try {
    const movies = await Movie.getAll();
    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir tous les likes
router.get('/likes', async (req, res, next) => {
  try {
    const likes = await Like.getAll();
    res.json({
      success: true,
      data: likes
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques détaillées
router.get('/stats', async (req, res, next) => {
  try {
    const globalStats = await Like.getGlobalStats();
    const totalUsers = await User.getCount();
    const totalMovies = await Movie.getCount();
    
    res.json({
      success: true,
      data: {
        ...globalStats,
        totalUsers,
        totalMovies
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
