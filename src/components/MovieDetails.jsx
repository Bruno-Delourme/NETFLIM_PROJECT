import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieApi, getImageUrl, formatDate, formatRuntime } from '../services/movieApi';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const movieData = await movieApi.getMovieDetails(id);
        setMovie(movieData);
      } catch (err) {
        setError('Erreur lors du chargement des détails du film');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="loading">Chargement des détails du film...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Erreur</h3>
        <p>{error}</p>
        <button onClick={handleBack} className="back-button">
          Retour
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="no-results">
        <h3>Film non trouvé</h3>
        <button onClick={handleBack} className="back-button">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={handleBack} className="back-button">
        ← Retour
      </button>
      
      <div className="movie-details">
        <div className="movie-details-header">
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="movie-details-poster"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450/333/fff?text=Image+non+disponible';
            }}
          />
          <div className="movie-details-info">
            <h2>{movie.title}</h2>
            <p><strong>Date de sortie:</strong> {formatDate(movie.release_date)}</p>
            <p><strong>Durée:</strong> {formatRuntime(movie.runtime)}</p>
            <p><strong>Note:</strong> ⭐ {movie.vote_average?.toFixed(1)}/10 ({movie.vote_count} votes)</p>
            <p><strong>Genres:</strong> {movie.genres?.map(genre => genre.name).join(', ')}</p>
            <p><strong>Budget:</strong> {movie.budget ? `$${movie.budget.toLocaleString()}` : 'Non communiqué'}</p>
            <p><strong>Recettes:</strong> {movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Non communiqué'}</p>
            <p><strong>Statut:</strong> {movie.status}</p>
            {movie.homepage && (
              <p>
                <strong>Site officiel:</strong>{' '}
                <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
                  {movie.homepage}
                </a>
              </p>
            )}
          </div>
        </div>
        
        <div className="movie-details-content">
          <h3>Synopsis</h3>
          <p>{movie.overview || 'Aucun synopsis disponible.'}</p>
          
          {movie.production_companies && movie.production_companies.length > 0 && (
            <div>
              <h3>Sociétés de production</h3>
              <p>{movie.production_companies.map(company => company.name).join(', ')}</p>
            </div>
          )}
          
          {movie.production_countries && movie.production_countries.length > 0 && (
            <div>
              <h3>Pays de production</h3>
              <p>{movie.production_countries.map(country => country.name).join(', ')}</p>
            </div>
          )}
          
          {movie.spoken_languages && movie.spoken_languages.length > 0 && (
            <div>
              <h3>Langues</h3>
              <p>{movie.spoken_languages.map(lang => lang.name).join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
