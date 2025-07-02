import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import GamePage from './pages/GamePage';
import VictoryPage from './pages/VictoryPage';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/game/:categoryName" element={<GamePage />} />
        <Route path="/victory" element={<VictoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;