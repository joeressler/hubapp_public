import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface User {
  username: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user] = useState<User | null>(null);

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
            <li className="nav-item dropdown">
              <NavLink className="nav-link" to="/games">Game List</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/chat">GPT3.5 RAGLLM Bots</NavLink>
            </li>
          </ul>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text">Logged in as: {user.username}</span>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/logout">Log Out</NavLink>
                </li>
              </>
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