import React, { useEffect, useState } from 'react';
import { apiService, Game } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
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
      // Match Flask's behavior of redirecting to login
      navigate('/login', { state: { returnURL: `/games/${gameId}/rate` } });
      return;
    }
    navigate(`/games/${gameId}/rate`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid" id="bootstrap_override">
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="table table-striped table-hover table-dark">
          <caption style={{ backgroundColor: 'rgba(50,50,50,0.25)' }}>
            Here is a list of games I have rated along with my 100% status in them and the game's average user rating.
          </caption>
          <thead className="table-dark">
            <tr>
              <th></th>
              <th>Game Name</th>
              <th>Joseph's Score</th>
              <th>Has Joseph fullcleared?</th>
              <th>Average User Score</th>
              <th>Number of user Fullclears</th>
              <th>User Ratings</th>
              <th>Developer</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>
                  <button 
                    className="ratingButton" 
                    onClick={() => handleRateClick(game.id)}
                  >
                    Rate this game
                  </button>
                </td>
                <td>{game.name}</td>
                <td>{game.score}</td>
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
  );
};

export default GameList; 