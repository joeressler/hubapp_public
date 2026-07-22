import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="site-nav" role="navigation" aria-label="Primary">
      <div className="site-nav-inner">
        <NavLink className="site-nav-brand" to="/" onClick={closeMenu}>
          Joseph <span>Ressler</span>
        </NavLink>

        <button
          type="button"
          className="site-nav-toggle"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            {isOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div
          id="primary-navigation"
          className={`site-nav-menu${isOpen ? ' is-open' : ''}`}
        >
          <ul className="site-nav-links">
            <li>
              <NavLink to="/" end onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/games" onClick={closeMenu}>
                Game List
              </NavLink>
            </li>
            <li>
              <NavLink to="/digimon-dex" onClick={closeMenu}>
                Digimon Dex
              </NavLink>
            </li>
            <li>
              <NavLink to="/chat" onClick={closeMenu}>
                Game Help Bot
              </NavLink>
            </li>
          </ul>

          <ul className="site-nav-auth">
            {user ? (
              <>
                <li>
                  <span className="site-nav-user">{user.username}</span>
                </li>
                <li>
                  <button type="button" className="site-nav-logout" onClick={handleLogout}>
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink to="/login" onClick={closeMenu}>
                  Log In
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
