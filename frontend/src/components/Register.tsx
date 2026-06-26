import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Recaptcha from './Recaptcha';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

const requiresRecaptcha = Boolean(process.env.REACT_APP_RECAPTCHA_PUBLIC_KEY);

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
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

    if (!USERNAME_PATTERN.test(username)) {
      setError('Username must be 3-30 alphanumeric characters or underscores');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (requiresRecaptcha && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      await apiService.register(username, password, email, recaptchaToken ?? undefined);
      navigate('/login', {
        state: { message: 'Registration successful. Please log in.' },
      });
    } catch (err: unknown) {
      if (axiosIsError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register');
      }
    }
  };

  return (
    <div className="register-container crystal-card">
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
            autoFocus
            required
            maxLength={254}
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
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]{3,30}"
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
            required
            minLength={6}
            maxLength={20}
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
        <Recaptcha
          onVerify={(token) => setRecaptchaToken(token)}
          onExpire={() => setRecaptchaToken(null)}
        />
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

function axiosIsError(
  err: unknown
): err is { response?: { data?: { error?: string } } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

export default Register;
