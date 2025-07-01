
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TabBar.css';

const TabBar = () => {
  return (
    <div className="tab-bar">
      <Link to="/category" className="tab-button">Jwe</Link>
      <Link to="/" className="tab-button">Koleksyon</Link>
      <Link to="/" className="tab-button">Paramèt</Link>
      <Link to="/" className="tab-button">Apropo</Link>
    </div>
  );
};

export default TabBar;
