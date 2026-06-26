import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Recaptcha from './Recaptcha';

const requiresRecaptcha = Boolean(process.env.REACT_APP_RECAPTCHA_PUBLIC_KEY);

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
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

    if (requiresRecaptcha && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      await login(username, password, recaptchaToken ?? undefined);
      const returnURL = (location.state as { returnURL?: string })?.returnURL || '/';
      navigate(returnURL);
    } catch (err: unknown) {
      if (axiosIsError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to log in');
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Log In</h1>
      <div className="form-container crystal-card">
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
              style={{ width: '100%' }}
              autoFocus
              required
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
              maxLength={20}
            />
          </div>
          <Recaptcha
            onVerify={(token) => setRecaptchaToken(token)}
            onExpire={() => setRecaptchaToken(null)}
          />
          <button type="submit" className="ratingButton" style={{ width: '100%' }}>
            Log In
          </button>
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            <span style={{ color: '#e2e8f0', textShadow: '0 0 5px rgba(56, 189, 248, 0.2)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#38bdf8',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                className="hover:text-sky-400 hover:underline"
              >
                Register here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

function axiosIsError(
  err: unknown
): err is { response?: { data?: { error?: string } } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

export default Login;
