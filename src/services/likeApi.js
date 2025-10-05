import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Configuration d'axios avec les headers par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Timeout de 5 secondes
});

// Gestionnaire de session ID
class SessionManager {
  constructor() {
    this.sessionId = this.getSessionId();
  }

  getSessionId() {
    let sessionId = localStorage.getItem('netflim_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('netflim_session_id', sessionId);
    }
    return sessionId;
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  generateNewSession() {
    const newSessionId = this.generateSessionId();
    localStorage.setItem('netflim_session_id', newSessionId);
    this.sessionId = newSessionId;
    return newSessionId;
  }
}

const sessionManager = new SessionManager();

// Intercepteur pour ajouter le session ID à toutes les requêtes
api.interceptors.request.use((config) => {
  config.headers['x-session-id'] = sessionManager.getSessionId();
  return config;
});

export const likeApi = {
  // Ajouter ou modifier un like
  likeMovie: async (movieId, isLiked = true, movieData = null) => {
    try {
      const requestData = {
        movieId: parseInt(movieId),
        isLiked
      };
      
      // Ajouter les données du film si disponibles
      if (movieData) {
        requestData.movieData = movieData;
      }
      
      const response = await api.post('/likes', requestData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du like du film:', error);
      throw error;
    }
  },

  // Supprimer un like
  unlikeMovie: async (movieId) => {
    try {
      const response = await api.delete(`/likes/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du like:', error);
      throw error;
    }
  },

  // Obtenir le statut de like d'un film
  getLikeStatus: async (movieId) => {
    try {
      const response = await api.get(`/likes/${movieId}/status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de like:', error);
      throw error;
    }
  },

  // Obtenir les films aimés par l'utilisateur
  getLikedMovies: async (limit = 20, offset = 0) => {
    try {
      const response = await api.get('/users/me/liked-movies', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films aimés:', error);
      throw error;
    }
  },

  // Obtenir les films non aimés par l'utilisateur
  getDislikedMovies: async (limit = 20, offset = 0) => {
    try {
      const response = await api.get('/likes/user/disliked-movies', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films non aimés:', error);
      throw error;
    }
  },

  // Obtenir les statistiques de l'utilisateur
  getUserStats: async () => {
    try {
      const response = await api.get('/users/me/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Obtenir les informations de l'utilisateur
  getUserInfo: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw error;
    }
  },

  // Obtenir les statistiques globales
  getGlobalStats: async () => {
    try {
      const response = await api.get('/likes/stats/global');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      throw error;
    }
  },

  // Obtenir les films les plus aimés
  getMostLikedMovies: async (limit = 20) => {
    try {
      const response = await api.get('/likes/movies/most-liked', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films les plus aimés:', error);
      throw error;
    }
  },

  // Générer une nouvelle session
  generateNewSession: async () => {
    try {
      const response = await api.post('/users/new-session');
      const newSessionId = response.data.data.sessionId;
      localStorage.setItem('netflim_session_id', newSessionId);
      sessionManager.sessionId = newSessionId;
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération d\'une nouvelle session:', error);
      throw error;
    }
  }
};


export default likeApi;
