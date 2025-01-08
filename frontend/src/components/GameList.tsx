import React, { useEffect, useState } from 'react';
import { apiService, Game } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isJoe = user?.username === 'joe';

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const gamesData = await apiService.getGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleRateClick = (gameId: number) => {
    if (!user) {
      navigate('/login', { state: { returnURL: `/games/${gameId}/rate` } });
      return;
    }
    navigate(`/games/${gameId}/rate`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Game Ratings</h1>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Game Ratings</h1>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <caption style={{ 
              color: '#e2e8f0',
              textAlign: 'center',
              captionSide: 'top',
              marginBottom: '1rem',
              textShadow: '0 0 5px rgba(56, 189, 248, 0.2)'
            }}>
              Here is a list of games I have rated along with my 100% status for them and the game's average user rating.
            </caption>
            <thead>
              <tr>
                <th></th>
                <th>Game Name</th>
                <th>{isJoe ? "My Score" : "Joe's Score"}</th>
                <th>{isJoe ? "Have I fullcleared?" : "Has Joe fullcleared?"}</th>
                <th>Average User Score</th>
                <th>Number of user Fullclears</th>
                <th>User Ratings</th>
                <th>Developer</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => (
                <tr key={game.id} style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                  <td>
                    <button 
                      className="ratingButton"
                      onClick={() => handleRateClick(game.id)}
                    >
                      Rate this game
                    </button>
                  </td>
                  <td>{game.name}</td>
                  <td>{game.score || 'Not rated'}</td>
                  <td>{game.fullclear ? "Yes" : "No"}</td>
                  <td>{game.avgScore?.toFixed(1) || "No ratings"}</td>
                  <td>{game.fullclearCount}</td>
                  <td>{game.ratingCount}</td>
                  <td>{game.developer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GameList;