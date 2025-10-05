import React, { useState } from 'react';

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-section">
      <form onSubmit={handleSubmit} className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Rechercher un film..."
            className="search-input"
            disabled={loading}
          />
          <button 
            type="button" 
            className="search-button-embedded"
            onClick={handleButtonClick}
            disabled={loading}
            title="Rechercher"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
