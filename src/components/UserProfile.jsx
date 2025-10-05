import React, { useState, useEffect } from 'react';
import { likeApi } from '../services/likeApi';
import { getImageUrl } from '../services/movieApi';

const UserProfile = ({ isOpen, onClose }) => {
  const [userStats, setUserStats] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);
  const [userGenres, setUserGenres] = useState([]);
  const [commonGenres, setCommonGenres] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques utilisateur
      const userStatsResponse = await likeApi.getUserStats();
      console.log('Statistiques utilisateur:', userStatsResponse.data);
      setUserStats(userStatsResponse.data);
      
      // Charger les films aimés et les genres
      const likedMoviesResponse = await likeApi.getLikedMovies(20, 0);
      console.log('Films aimés:', likedMoviesResponse.data);
      setLikedMovies(likedMoviesResponse.data.movies);
      setUserGenres(likedMoviesResponse.data.genres || []);
      setCommonGenres(likedMoviesResponse.data.commonGenres || []);
      
      // Charger les statistiques globales
      const globalStatsResponse = await likeApi.getGlobalStats();
      console.log('Statistiques globales:', globalStatsResponse.data);
      setGlobalStats(globalStatsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="user-profile-backdrop" onClick={handleBackdropClick}>
      <div className="user-profile-modal">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <div className="user-profile-header">
          <h2>👤 Mon Profil Netflim</h2>
        </div>

        <div className="user-profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiques
          </button>
          <button 
            className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            ❤️ Films Aimés
          </button>
          <button 
            className={`tab-button ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={() => setActiveTab('genres')}
          >
            🎭 Genres
          </button>
          <button 
            className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            🌍 Global
          </button>
        </div>

        <div className="user-profile-content">
          {loading && (
            <div className="loading">
              <p>Chargement de vos données...</p>
            </div>
          )}

          {!loading && activeTab === 'stats' && userStats && (
            <div className="stats-section">
              <h3>Mes Statistiques</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-value">{userStats.likedMovies}</div>
                  <div className="stat-label">Films aimés</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💔</div>
                  <div className="stat-value">{userStats.dislikedMovies}</div>
                  <div className="stat-label">Films non aimés</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{userStats.totalLikes}</div>
                  <div className="stat-label">Total interactions</div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'liked' && (
            <div className="liked-movies-section">
              <h3>Mes Films Aimés</h3>
              {likedMovies.length === 0 ? (
                <div className="no-movies">
                  <p>Vous n'avez pas encore aimé de films.</p>
                  <p>Commencez à explorer et à liker vos films préférés !</p>
                </div>
              ) : (
                <div className="liked-movies-grid">
                  {likedMovies.map((movie) => (
                    <div key={movie.id} className="liked-movie-card">
                      <img
                        src={getImageUrl(movie.poster_path, 'w185')}
                        alt={movie.title}
                        className="liked-movie-poster"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="liked-movie-info">
                        <h4 className="liked-movie-title">{movie.title}</h4>
                        <p className="liked-movie-date">
                          {new Date(movie.liked_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'genres' && (
            <div className="genres-section">
              <div className="user-genres-section">
                <h3>🎭 Mes Genres Préférés</h3>
                {userGenres.length === 0 ? (
                  <div className="no-genres">
                    <p>Vous n'avez pas encore de genres préférés.</p>
                    <p>Likez des films pour découvrir vos genres favoris !</p>
                  </div>
                ) : (
                  <div className="genres-grid">
                    {userGenres.map((genre, index) => (
                      <div key={genre.name} className="genre-card">
                        <div className="genre-rank">#{index + 1}</div>
                        <div className="genre-name">{genre.name}</div>
                        <div className="genre-count">{genre.count} film{genre.count > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="common-genres-section">
                <h3>🌍 Genres les Plus Populaires</h3>
                {commonGenres.length === 0 ? (
                  <div className="no-genres">
                    <p>Aucune donnée disponible pour les genres populaires.</p>
                  </div>
                ) : (
                  <div className="common-genres-grid">
                    {commonGenres.map((genre, index) => (
                      <div key={genre.name} className="common-genre-card">
                        <div className="genre-rank">#{index + 1}</div>
                        <div className="genre-name">{genre.name}</div>
                        <div className="genre-count">{genre.count} like{genre.count > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === 'global' && globalStats && (
            <div className="global-stats-section">
              <h3>Statistiques Globales</h3>
              <div className="global-stats-grid">
                <div className="global-stat-card">
                  <div className="global-stat-icon">👥</div>
                  <div className="global-stat-value">{globalStats.uniqueUsers}</div>
                  <div className="global-stat-label">Utilisateurs actifs</div>
                </div>
                <div className="global-stat-card">
                  <div className="global-stat-icon">🎬</div>
                  <div className="global-stat-value">{globalStats.uniqueMovies}</div>
                  <div className="global-stat-label">Films évalués</div>
                </div>
                <div className="global-stat-card">
                  <div className="global-stat-icon">❤️</div>
                  <div className="global-stat-value">{globalStats.totalLikes}</div>
                  <div className="global-stat-label">Likes totaux</div>
                </div>
                <div className="global-stat-card">
                  <div className="global-stat-icon">💔</div>
                  <div className="global-stat-value">{globalStats.totalDislikes}</div>
                  <div className="global-stat-label">Dislikes totaux</div>
                </div>
                <div className="global-stat-card">
                  <div className="global-stat-icon">📊</div>
                  <div className="global-stat-value">{globalStats.totalInteractions}</div>
                  <div className="global-stat-label">Interactions totales</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
