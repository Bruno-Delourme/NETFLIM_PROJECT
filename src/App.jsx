import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import ExpandedMovieCard from './components/ExpandedMovieCard';
import UserProfile from './components/UserProfile';
import { LikeProvider } from './contexts/LikeContext';
import { movieApi } from './services/movieApi';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMovie, setExpandedMovie] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Charger les films populaires au démarrage
  useEffect(() => {
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movieApi.getPopularMovies();
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
      setSearchQuery('');
    } catch (err) {
      setError('Erreur lors du chargement des films populaires');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadPopularMovies();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      const data = await movieApi.searchMovies(query);
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (currentPage >= totalPages || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      let data;

      if (searchQuery) {
        data = await movieApi.searchMovies(searchQuery, nextPage);
      } else {
        data = await movieApi.getPopularMovies(nextPage);
      }

      setMovies(prevMovies => [...prevMovies, ...data.results]);
      setCurrentPage(nextPage);
    } catch (err) {
      setError('Erreur lors du chargement des films supplémentaires');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandMovie = (movie) => {
    setExpandedMovie(movie);
  };

  const handleCloseExpanded = () => {
    setExpandedMovie(null);
  };

  return (
    <LikeProvider>
      <div className="App">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="header-title">
                <h1>🎬 Netflim</h1>
              </div>
              
              <div className="header-search">
                <SearchBar onSearch={handleSearch} loading={loading} />
              </div>
              
              <button 
                className="profile-button"
                onClick={() => setShowUserProfile(true)}
                title="Mon Profil"
              >
                👤 Profil
              </button>
            </div>
          </div>
        </header>

        <Routes>
          <Route 
            path="/" 
            element={
              <div className="container">
                <MovieList 
                  movies={movies} 
                  loading={loading} 
                  error={error} 
                  onExpand={handleExpandMovie}
                />
                
                {movies.length > 0 && currentPage < totalPages && (
                  <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <button 
                      onClick={loadMoreMovies}
                      className="search-button"
                      disabled={loading}
                    >
                      {loading ? 'Chargement...' : 'Charger plus de films'}
                    </button>
                  </div>
                )}
              </div>
            } 
          />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
        
        {/* Modal d'expansion */}
        {expandedMovie && (
          <ExpandedMovieCard 
            movie={expandedMovie} 
            onClose={handleCloseExpanded}
          />
        )}
        
        {/* Modal de profil utilisateur */}
        <UserProfile 
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
        />
      </div>
    </LikeProvider>
  );
}

export default App;
