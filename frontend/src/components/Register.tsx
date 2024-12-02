import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password: string): string | null => {
    if (password.length < 6 || password.length > 20) {
      return 'Password must be between 6 and 20 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one capital letter';
    }
    if (!/[!@#$%^&]/.test(password)) {
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
      navigate('/login', { 
        state: { message: 'Registration successful. Please log in.' }
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register');
      }
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            style={{ height: '2.5ch', width: '30ch' }}
          />
        </div>
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
        <div className="password-requirements">
          <p>Password must:</p>
          <ul>
            <li>Be between 6 and 20 characters long</li>
            <li>Contain at least 1 capital letter</li>
            <li>Contain at least 1 special character (!@#$%^&)</li>
          </ul>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default Register; 