import React, { useState } from 'react';
import { getImageUrl } from '../services/movieApi';
import LikeButton from './LikeButton';

const MovieCard = ({ movie, onExpand }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleFirstClick = (e) => {
    e.stopPropagation();
    if (isRevealed) {
      // Si déjà révélé, revenir à l'état initial
      setIsRevealed(false);
    } else {
      // Sinon, révéler les informations
      setIsRevealed(true);
    }
  };

  const handleSecondClick = (e) => {
    e.stopPropagation();
    onExpand(movie);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  return (
    <div className={`movie-card ${isRevealed ? 'revealed' : 'hidden'}`}>
      <div className="movie-poster-container" onClick={handleFirstClick}>
        {getImageUrl(movie.poster_path) ? (
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="movie-poster"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="movie-poster movie-poster-placeholder">
            <span className="placeholder-text">🎬</span>
          </div>
        )}
      </div>
      
      {isRevealed && (
        <div className="movie-info" onClick={handleSecondClick}>
          <div className="movie-header">
            <h3 className="movie-title">{movie.title}</h3>
          </div>
          
          <p className="movie-overview">{movie.overview}</p>
          
          <div className="movie-meta">
            <span>{formatDate(movie.release_date)}</span>
            <span className="rating">
              ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
            </span>
          </div>
          
          <LikeButton 
            movieId={movie.id} 
            movieData={movie}
            onLikeChange={(movieId, isLiked, stats) => {
              // Optionnel: gérer les changements de like au niveau parent
              console.log(`Film ${movieId} ${isLiked ? 'aimé' : isLiked === false ? 'non aimé' : 'neutre'}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MovieCard;
