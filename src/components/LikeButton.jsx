import React, { useEffect } from 'react';
import { useLikeContext } from '../contexts/LikeContext';

const LikeButton = ({ movieId, movieData, onLikeChange }) => {
  const { 
    loadLikeStatus, 
    toggleLike, 
    getLikeStatus, 
    isLoading, 
    getError, 
    clearError 
  } = useLikeContext();

  // Charger le statut de like au montage du composant
  useEffect(() => {
    loadLikeStatus(movieId);
  }, [movieId, loadLikeStatus]);

  // Obtenir l'état actuel du like
  const { isLiked: likeState, movieStats } = getLikeStatus(movieId);
  const loading = isLoading(movieId);

  const handleToggleLike = async () => {
    if (loading) return;
    
    console.log('🔄 Toggle like - État actuel:', likeState);
    
    const result = await toggleLike(movieId, movieData);
    
    if (result.success) {
      console.log('✅ État mis à jour avec succès:', result.newState);
      
      // Notifier le parent du changement
      if (onLikeChange) {
        onLikeChange(movieId, result.newState, result.movieStats);
      }
    } else {
      console.error('❌ Erreur lors du toggle like:', result.error);
      if (result.error) {
        alert(result.error);
      }
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
