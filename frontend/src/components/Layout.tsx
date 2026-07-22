import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const FLUSH_ROUTES = ['/', '/digimon-dex'];

const Layout: React.FC = () => {
  const location = useLocation();
  const isFlush =
    FLUSH_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith('/digimon-dex/');

  return (
    <div className="app-shell">
      <Navbar />
      <main className={isFlush ? 'app-main app-main--flush' : 'app-main'}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>&copy; 2026 Joseph A. Ressler</p>
          <p>
            <a href="/Ressler_Joseph_Resume.pdf" target="_blank" rel="noopener noreferrer">
              Download resume
            </a>
          </p>
          <p>
            <a href="https://www.linkedin.com/in/joseph-ressler/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            {' · '}
            <a href="https://github.com/joeressler?tab=repositories" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' · '}
            <a href="https://github.com/joeressler/hubapp_public" target="_blank" rel="noopener noreferrer">
              This repository
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
