
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/VictoryPage.css';

const VictoryPage = () => {
  return (
    <div className="victory-container">
      <h1 className="victory-title">Bravo!</h1>
      <p className="victory-subtitle">Ou jwenn tout pawòl yo!</p>
      <div className="button-group">
        <Link to="/category" className="button">Pwochen nivo</Link>
        <Link to="/" className="button">Rejwe</Link>
        <Link to="/" className="button">Home</Link>
      </div>
    </div>
  );
};

export default VictoryPage;
