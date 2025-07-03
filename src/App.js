import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import GamePage from './pages/GamePage';
import VictoryPage from './pages/VictoryPage';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';

function App() {
  const [loading, setLoading] = useState(true);

  const handleSplashFinish = () => {
    setLoading(false);
  };

  if (loading) {
    return <SplashScreen onFinished={handleSplashFinish} />;
  }

  return (
    <Router basename="/mokwaze">
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/game/:categoryName" element={<GamePage />} />
        <Route path="/victory" element={<VictoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
