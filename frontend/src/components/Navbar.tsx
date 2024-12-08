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
          className="navbar-toggler d-block d-lg-none d-xl-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M0 1.5A.5.5 0 0 1 .5 1h15a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 1.5zM0 7.5A.5.5 0 0 1 .5 7h15a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 7.5zM.5 13a.5.5 0 0 1 0-1h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0 0z"/>
            </svg>
          </span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/games">Game List</NavLink>
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