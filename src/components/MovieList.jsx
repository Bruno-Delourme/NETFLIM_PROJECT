import React from 'react';
import MovieCard from './MovieCard';

const MovieList = ({ movies, loading, error, onExpand }) => {
  if (loading) {
    return <div className="loading">Chargement des films...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Erreur lors du chargement</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="no-results">
        <h3>Aucun film trouvé</h3>
        <p>Essayez avec d'autres mots-clés</p>
      </div>
    );
  }

  return (
    <div className="movies-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onExpand={onExpand} />
      ))}
    </div>
  );
};

export default MovieList;
