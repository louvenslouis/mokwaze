import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <h1 className="logo">MO KWAZE</h1>
      <Link to="/category" className="button">
        Jwe
      </Link>
    </div>
  );
};

export default HomePage;