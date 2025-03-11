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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="games" element={<GameList />} />
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
    </Router>
  );
};

export default App; 