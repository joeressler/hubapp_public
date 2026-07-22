import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (value: string): string | null => {
    if (value.length < 6 || value.length > 20) {
      return 'Password must be between 6 and 20 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one capital letter';
    }
    if (!/[!@#$%^&]/.test(value)) {
      return 'Password must contain at least one special character (!@#$%^&)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      await apiService.register(username, password, email);
      navigate('/login?message=' + encodeURIComponent('Registration successful. Please log in.'));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register');
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Register</h1>
      <div className="form-container">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              autoFocus
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="password-requirements">
            <p>Password must:</p>
            <ul>
              <li>Be between 6 and 20 characters long</li>
              <li>Contain at least 1 capital letter</li>
              <li>Contain at least 1 special character (!@#$%^&amp;)</li>
            </ul>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
