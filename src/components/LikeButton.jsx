import React, { useState, useEffect } from 'react';
import { likeApi } from '../services/likeApi';

const LikeButton = ({ movieId, movieData, onLikeChange }) => {
  const [likeState, setLikeState] = useState(null); // null = neutre, true = aimé, false = pas aimé
  const [loading, setLoading] = useState(false);
  const [movieStats, setMovieStats] = useState({ likes: 0, dislikes: 0 });

  // Charger le statut de like au montage du composant
  useEffect(() => {
    loadLikeStatus();
  }, [movieId]);

  const loadLikeStatus = async () => {
    try {
      const response = await likeApi.getLikeStatus(movieId);
      setLikeState(response.data.isLiked);
      setMovieStats(response.data.movieStats);
    } catch (error) {
      console.error('Erreur lors du chargement du statut de like:', error);
      
      // Si le backend n'est pas accessible, on continue sans erreur
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend non accessible, fonctionnement en mode local uniquement');
        setLikeState(null);
        setMovieStats({ likes: 0, dislikes: 0 });
      }
    }
  };

  const handleToggleLike = async () => {
    if (loading) return;
    
    console.log('🔄 Toggle like - État actuel:', likeState);
    
    try {
      setLoading(true);
      let newState;
      
      // Cycle des états : neutre → aimé → pas aimé → neutre
      if (likeState === null) {
        newState = true; // neutre → aimé
      } else if (likeState === true) {
        newState = false; // aimé → pas aimé
      } else {
        newState = null; // pas aimé → neutre
      }
      
      console.log('🎯 Nouvel état:', newState);
      console.log('🖼️ Image qui sera affichée:', getButtonImage());
      
      // Mettre à jour l'état immédiatement pour le feedback visuel
      setLikeState(newState);
      
      if (newState === null) {
        // Supprimer le like/dislike
        await likeApi.unlikeMovie(movieId);
      } else {
        // Ajouter le like ou dislike avec les données du film
        await likeApi.likeMovie(movieId, newState, movieData);
      }
      
      // Recharger les statistiques
      const response = await likeApi.getLikeStatus(movieId);
      setMovieStats(response.data.movieStats);
      
      // Notifier le parent du changement
      if (onLikeChange) {
        onLikeChange(movieId, newState, response.data.movieStats);
      }
      
      console.log('✅ État mis à jour avec succès:', newState);
    } catch (error) {
      console.error('Erreur lors du toggle like:', error);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      
      // Si le backend n'est pas accessible, on fonctionne en mode local
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend non accessible, fonctionnement en mode local uniquement');
        // L'état a déjà été mis à jour visuellement
        setMovieStats({ likes: 0, dislikes: 0 });
        alert('Backend non accessible. Les likes ne seront pas sauvegardés.');
      } else {
        // Revenir à l'état précédent en cas d'erreur
        setLikeState(likeState);
        alert('Erreur lors de l\'enregistrement du like. Vérifiez que le backend est démarré.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getButtonState = () => {
    if (likeState === true) return 'liked';
    if (likeState === false) return 'disliked';
    return 'neutral';
  };

  const getButtonImage = () => {
    let imagePath;
    if (likeState === true) {
      imagePath = '/likeButtonGreen.png';
    } else if (likeState === false) {
      imagePath = '/likeButtonRed.png';
    } else {
      imagePath = '/likeButton.png';
    }
    console.log('🖼️ Image sélectionnée:', imagePath, 'pour l\'état:', likeState);
    return imagePath;
  };

  const getButtonTitle = () => {
    if (likeState === true) return 'Cliquez pour ne pas aimer';
    if (likeState === false) return 'Cliquez pour retirer votre avis';
    return 'Cliquez pour aimer';
  };

  return (
    <div className="like-container">
      <button
        className={`custom-like-button ${getButtonState()}`}
        onClick={handleToggleLike}
        disabled={loading}
        title={getButtonTitle()}
      >
        {loading ? (
          <span className="loading-spinner">⏳</span>
        ) : (
          <>
            <img 
              src={getButtonImage()} 
              alt="Like button" 
              className="like-button-image"
              onLoad={(e) => {
                console.log('✅ Image chargée avec succès:', e.target.src);
              }}
              onError={(e) => {
                console.error('❌ Erreur de chargement de l\'image:', e.target.src);
                // Fallback si l'image n'est pas trouvée
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="like-button-fallback" style={{ display: 'none' }}>
              {likeState === true ? '👍' : likeState === false ? '👎' : '👍'}
            </div>
          </>
        )}
      </button>

    </div>
  );
};

export default LikeButton;
