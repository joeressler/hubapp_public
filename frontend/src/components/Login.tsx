import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
    if (message) {
      setFlashMessage(message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      const returnURL = (location.state as any)?.returnURL || '/';
      navigate(returnURL);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to log in');
      }
    }
  };

  return (
    <div className="login-container">
      <h1>Log In</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {flashMessage && (
        <div className="alert alert-info">
          {flashMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
            style={{ height: '2.5ch', width: '30ch' }}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            style={{ height: '2.5ch', width: '30ch' }}
          />
        </div>
        <button type="submit" className="btn btn-primary">Log In</button>
        <p>&nbsp;</p>
        <p>Register <Link to="/register">here</Link> if you don't already have an account.</p>
      </form>
    </div>
  );
};

export default Login; 