import axios from 'axios';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MWY2MThmMzJhYmYyMzRiZGEzYzQ1YTM1ZmNjOWEzMCIsIm5iZiI6MTcwODg1NDg3NC45MDQsInN1YiI6IjY1ZGIwZTVhYTI0YzUwMDE4NjEwNGUzOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1qWPBTDxN-vUDDxKWNS9nZo6F7QUX52PMr3yIZetaek';

// Configuration d'axios avec les headers par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'accept': 'application/json',
  },
});

export const movieApi = {
  // Rechercher des films
  searchMovies: async (query, page = 1) => {
    try {
      const response = await api.get('/search/movie', {
        params: {
          query,
          page,
          language: 'fr-FR',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de films:', error);
      throw error;
    }
  },

  // Obtenir les détails d'un film
  getMovieDetails: async (movieId) => {
    try {
      const response = await api.get(`/movie/${movieId}`, {
        params: {
          language: 'fr-FR',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du film:', error);
      throw error;
    }
  },

  // Obtenir les films populaires
  getPopularMovies: async (page = 1) => {
    try {
      const response = await api.get('/movie/popular', {
        params: {
          page,
          language: 'fr-FR',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films populaires:', error);
      throw error;
    }
  },

  // Obtenir les films les mieux notés
  getTopRatedMovies: async (page = 1) => {
    try {
      const response = await api.get('/movie/top_rated', {
        params: {
          page,
          language: 'fr-FR',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films les mieux notés:', error);
      throw error;
    }
  },

  // Obtenir les films à venir
  getUpcomingMovies: async (page = 1) => {
    try {
      const response = await api.get('/movie/upcoming', {
        params: {
          page,
          language: 'fr-FR',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des films à venir:', error);
      throw error;
    }
  },

  // Obtenir le casting d'un film
  getMovieCredits: async (movieId) => {
    try {
      const response = await api.get(`/movie/${movieId}/credits`, {
        params: {
          language: 'fr-FR',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du casting:', error);
      throw error;
    }
  },
};

// Fonction utilitaire pour construire l'URL de l'image
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Fonction utilitaire pour formater la date
export const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Fonction utilitaire pour formater la durée
export const formatRuntime = (minutes) => {
  if (!minutes) return 'Durée inconnue';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
};
