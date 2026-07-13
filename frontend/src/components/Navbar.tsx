import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg" role="navigation" data-bs-theme="dark">
      <div className="container-fluid">
        <button
          type="button"
          className="navbar-toggler d-block d-lg-none d-xl-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <span className="navbar-toggle-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
        </button>

        <div id="mobile-navigation" className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/games">Game List</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/digimon-dex">Digimon Dex</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/chat">Game Help Bot</NavLink>
            </li>
          </ul>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {user ? (
              <li className="nav-item user-dropdown">
                <span className="nav-link" style={{ 
                  color: '#38bdf8',
                  textShadow: '0 0 5px rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer'
                }}>
                  {user.username}
                </span>
                <div className="user-dropdown-content">
                  <button 
                    onClick={handleLogout}
                    className="user-dropdown-button"
                  >
                    Log Out
                  </button>
                </div>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">Log In</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 