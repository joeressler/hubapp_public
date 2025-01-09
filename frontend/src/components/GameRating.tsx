import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiService, Game } from '../services/api';

const GameRating: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameInfo, setGameInfo] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    rating: 0,
    fullclear: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const getGameInfo = async () => {
      if (!gameId) return;
      try {
        setIsLoading(true);
        const response = await apiService.getGame(parseInt(gameId));
        setGameInfo(response);
      } catch (error) {
        console.error('Failed to fetch game info:', error);
        setError('Failed to fetch game information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getGameInfo();
  }, [gameId]);

  // Prompt user when trying to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await apiService.rateGame(
        parseInt(gameId),
        formData.rating,
        formData.fullclear
      );
      navigate('/games');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setError('Failed to submit rating. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <h2 className="page-title">Loading Game...</h2>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!gameInfo) {
    return (
      <div className="page-container">
        <div className="form-container crystal-card">
          <h2 className="page-title">Error Loading Game</h2>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Unable to load game information.
          </p>
          <Link to="/games" className="ratingButton" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Return to Game List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Rate {gameInfo.name}</h2>
      <div className="form-container crystal-card">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Rating (1-10): <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="rating"
              min="1"
              max="10"
              value={formData.rating}
              onChange={handleInputChange}
              required
              className="form-control"
              style={{ width: '100%' }}
              autoFocus
              disabled={isSubmitting}
            />
            {formData.rating < 1 || formData.rating > 10 ? (
              <small style={{ color: '#ef4444' }}>Please enter a rating between 1 and 10</small>
            ) : null}
          </div>
          <div className="form-check" style={{ marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              name="fullclear"
              checked={formData.fullclear}
              onChange={handleInputChange}
              className="form-check-input"
              id="fullclear"
              style={{ 
                marginRight: '0.5rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            />
            <label 
              className="form-check-label" 
              htmlFor="fullclear"
              style={{ 
                color: '#e2e8f0',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textShadow: '0 0 5px rgba(56, 189, 248, 0.2)'
              }}
            >
              Full Clear
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="ratingButton" 
              style={{ 
                width: '100%',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting || formData.rating < 1 || formData.rating > 10}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
            <Link 
              to="/games" 
              className="ratingButton" 
              style={{ 
                width: '100%', 
                textAlign: 'center',
                textDecoration: 'none',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onClick={(e) => {
                if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  e.preventDefault();
                }
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameRating; 