import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    const getGameInfo = async () => {
      if (!gameId) return;
      try {
        const response = await apiService.getGame(parseInt(gameId));
        setGameInfo(response);
      } catch (error) {
        console.error('Failed to fetch game info:', error);
        setError('Failed to fetch game information');
      }
    };

    getGameInfo();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    
    try {
      await apiService.rateGame(
        parseInt(gameId),
        formData.rating,
        formData.fullclear
      );
      navigate('/games');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setError('Failed to submit rating');
    }
  };

  if (!gameInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rating-container">
      <h2>Rate {gameInfo.name}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.rating}
            onChange={(e) => setFormData({
              ...formData,
              rating: parseInt(e.target.value)
            })}
            required
            className="form-control"
          />
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            checked={formData.fullclear}
            onChange={(e) => setFormData({
              ...formData,
              fullclear: e.target.checked
            })}
            className="form-check-input"
            id="fullclear"
          />
          <label className="form-check-label" htmlFor="fullclear">
            Full Clear
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit Rating
        </button>
      </form>
    </div>
  );
};

export default GameRating; 