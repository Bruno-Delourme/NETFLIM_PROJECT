import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { likeApi } from '../services/likeApi';

// État initial
const initialState = {
  likes: {}, // { movieId: { isLiked: boolean, movieStats: object } }
  loading: {},
  error: null
};

// Types d'actions
const LIKE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_LIKE_STATUS: 'SET_LIKE_STATUS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_MOVIE_STATS: 'UPDATE_MOVIE_STATS'
};

// Reducer pour gérer les actions
function likeReducer(state, action) {
  switch (action.type) {
    case LIKE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.movieId]: action.loading
        }
      };

    case LIKE_ACTIONS.SET_LIKE_STATUS:
      return {
        ...state,
        likes: {
          ...state.likes,
          [action.movieId]: {
            isLiked: action.isLiked,
            movieStats: action.movieStats || state.likes[action.movieId]?.movieStats || { likes: 0, dislikes: 0 }
          }
        },
        loading: {
          ...state.loading,
          [action.movieId]: false
        }
      };

    case LIKE_ACTIONS.UPDATE_MOVIE_STATS:
      return {
        ...state,
        likes: {
          ...state.likes,
          [action.movieId]: {
            ...state.likes[action.movieId],
            movieStats: action.movieStats
          }
        }
      };

    case LIKE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.error,
        loading: {
          ...state.loading,
          [action.movieId]: false
        }
      };

    case LIKE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Création du contexte
const LikeContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useLikeContext = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikeContext doit être utilisé dans un LikeProvider');
  }
  return context;
};

// Provider du contexte
export const LikeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(likeReducer, initialState);

  // Charger le statut de like pour un film
  const loadLikeStatus = useCallback(async (movieId) => {
    dispatch({ type: LIKE_ACTIONS.SET_LOADING, movieId, loading: true });
    dispatch({ type: LIKE_ACTIONS.CLEAR_ERROR });

    try {
      console.log('🔄 Tentative de chargement du statut de like pour le film:', movieId);
      const response = await likeApi.getLikeStatus(movieId);
      console.log('✅ Réponse reçue du backend:', response.data);
      dispatch({
        type: LIKE_ACTIONS.SET_LIKE_STATUS,
        movieId,
        isLiked: response.data.isLiked,
        movieStats: response.data.movieStats
      });
    } catch (error) {
      console.error('❌ Erreur lors du chargement du statut de like:', error);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      
      // Si le backend n'est pas accessible, on continue sans erreur
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend non accessible, fonctionnement en mode local uniquement');
        dispatch({
          type: LIKE_ACTIONS.SET_LIKE_STATUS,
          movieId,
          isLiked: null,
          movieStats: { likes: 0, dislikes: 0 }
        });
      } else {
        dispatch({
          type: LIKE_ACTIONS.SET_ERROR,
          error: 'Erreur lors du chargement du statut de like',
          movieId
        });
      }
    }
  }, []);

  // Toggle le like d'un film
  const toggleLike = useCallback(async (movieId, movieData = null) => {
    dispatch({ type: LIKE_ACTIONS.SET_LOADING, movieId, loading: true });
    dispatch({ type: LIKE_ACTIONS.CLEAR_ERROR });

    try {
      // Récupérer l'état actuel depuis le state
      const currentLike = state.likes[movieId];
      const currentState = currentLike?.isLiked;
      
      let newState;
      
      // Cycle des états : neutre → aimé → pas aimé → neutre
      if (currentState === null) {
        newState = true; // neutre → aimé
      } else if (currentState === true) {
        newState = false; // aimé → pas aimé
      } else {
        newState = null; // pas aimé → neutre
      }

      // Mettre à jour l'état immédiatement pour le feedback visuel
      dispatch({
        type: LIKE_ACTIONS.SET_LIKE_STATUS,
        movieId,
        isLiked: newState,
        movieStats: currentLike?.movieStats
      });

      if (newState === null) {
        // Supprimer le like/dislike
        console.log('🗑️ Suppression du like pour le film:', movieId);
        await likeApi.unlikeMovie(movieId);
      } else {
        // Ajouter le like ou dislike avec les données du film
        console.log('💾 Sauvegarde du like pour le film:', movieId, 'état:', newState);
        await likeApi.likeMovie(movieId, newState, movieData);
      }

      // Recharger les statistiques
      const response = await likeApi.getLikeStatus(movieId);
      dispatch({
        type: LIKE_ACTIONS.UPDATE_MOVIE_STATS,
        movieId,
        movieStats: response.data.movieStats
      });

      return { success: true, newState, movieStats: response.data.movieStats };
    } catch (error) {
      console.error('Erreur lors du toggle like:', error);
      
      // Si le backend n'est pas accessible, on fonctionne en mode local
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend non accessible, fonctionnement en mode local uniquement');
        dispatch({
          type: LIKE_ACTIONS.UPDATE_MOVIE_STATS,
          movieId,
          movieStats: { likes: 0, dislikes: 0 }
        });
        return { success: false, error: 'Backend non accessible. Les likes ne seront pas sauvegardés.' };
      } else {
        // Revenir à l'état précédent en cas d'erreur
        const currentLike = state.likes[movieId];
        dispatch({
          type: LIKE_ACTIONS.SET_LIKE_STATUS,
          movieId,
          isLiked: currentLike?.isLiked,
          movieStats: currentLike?.movieStats
        });
        dispatch({
          type: LIKE_ACTIONS.SET_ERROR,
          error: 'Erreur lors de l\'enregistrement du like. Vérifiez que le backend est démarré.',
          movieId
        });
        return { success: false, error: 'Erreur lors de l\'enregistrement du like. Vérifiez que le backend est démarré.' };
      }
    }
  }, [state.likes]);

  // Obtenir le statut de like d'un film
  const getLikeStatus = useCallback((movieId) => {
    return state.likes[movieId] || { isLiked: null, movieStats: { likes: 0, dislikes: 0 } };
  }, [state.likes]);

  // Vérifier si un film est en cours de chargement
  const isLoading = useCallback((movieId) => {
    return state.loading[movieId] || false;
  }, [state.loading]);

  // Obtenir l'erreur globale
  const getError = useCallback(() => {
    return state.error;
  }, [state.error]);

  // Nettoyer l'erreur
  const clearError = useCallback(() => {
    dispatch({ type: LIKE_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    // État
    likes: state.likes,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadLikeStatus,
    toggleLike,
    getLikeStatus,
    isLoading,
    getError,
    clearError
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
};

export default LikeContext;
