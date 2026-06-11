import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import {
  GameList,
  Chat,
  Login,
  ProtectedRoute,
  GameRating
} from './components';
import Register from './components/Register';
import DigimonDex from './components/DigimonDex';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="games" element={<GameList />} />
            <Route path="digimon-dex" element={<DigimonDex />} />
            <Route path="digimon-dex/:name" element={<DigimonDex />} />
            <Route path="chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="games/:gameId/rate" element={
              <ProtectedRoute>
                <GameRating />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App; 