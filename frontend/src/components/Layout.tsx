import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <footer>
        <div className="footer">
          <p>&copy; 2024 Joseph A. Ressler</p>
          <p><a href="/static/Ressler_Joseph_Resume.pdf">Download my Resume</a></p>
          <p><a href="https://www.linkedin.com/in/joseph-ressler/" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
          <p><a href="https://github.com/joeressler?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub</a></p>
          <p><a href="https://github.com/joeressler/hubapp_public" target="_blank" rel="noopener noreferrer">Repository for this Website</a></p>
        </div>
      </footer>
    </>
  );
};

export default Layout; 