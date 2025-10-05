import React, { useState, useEffect } from 'react';
import { movieApi, getImageUrl, formatDate } from '../services/movieApi';
import LikeButton from './LikeButton';

const ExpandedMovieCard = ({ movie, onClose }) => {
  const [credits, setCredits] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les détails du film et le casting en parallèle
        const [creditsData, detailsData] = await Promise.all([
          movieApi.getMovieCredits(movie.id),
          movieApi.getMovieDetails(movie.id)
        ]);
        
        setCredits(creditsData);
        setMovieDetails(detailsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movie.id]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="expanded-movie-backdrop" onClick={handleBackdropClick}>
      <div className="expanded-movie-card">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <div className="expanded-movie-content">
          <div className="expanded-movie-header">
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="expanded-movie-poster"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
            <div className="expanded-movie-info">
              <h2 className="expanded-movie-title">{movie.title}</h2>
              <p className="expanded-movie-date">📅 {formatDate(movie.release_date)}</p>
              <p className="expanded-movie-rating">⭐ {movie.vote_average?.toFixed(1)}/10 ({movie.vote_count} votes)</p>
              
              {movieDetails?.genres && movieDetails.genres.length > 0 && (
                <div className="expanded-movie-genres">
                  <h4>Genres :</h4>
                  <div className="genres-list">
                    {movieDetails.genres.map((genre) => (
                      <span key={genre.id} className="genre-tag">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="expanded-movie-details">
            <div className="synopsis-section">
              <h3>Synopsis</h3>
              <p className="expanded-synopsis">
                {movieDetails?.overview || movie.overview || 'Aucun synopsis disponible pour ce film.'}
              </p>
            </div>

            <div className="like-section">
              <LikeButton 
                movieId={movie.id} 
                movieData={movieDetails || movie}
                onLikeChange={(movieId, isLiked, stats) => {
                  console.log(`Film ${movieId} ${isLiked ? 'aimé' : isLiked === false ? 'non aimé' : 'neutre'} dans la modal`);
                }}
              />
            </div>

            <div className="casting-section">
              <h3>Casting</h3>
              {loading && <p className="loading-cast">Chargement du casting...</p>}
              {error && <p className="error-cast">Erreur lors du chargement du casting</p>}
              {credits && !loading && (
                <div className="cast-grid">
                  {credits.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="cast-member">
                      <img
                        src={getImageUrl(actor.profile_path, 'w185')}
                        alt={actor.name}
                        className="cast-photo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="cast-info">
                        <p className="cast-name">{actor.name}</p>
                        <p className="cast-character">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedMovieCard;
