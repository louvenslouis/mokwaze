import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/category');
  }, [navigate]);

  return (
    <div className="home-container">
      <h1 className="logo">MO KWAZE</h1>
      <Link to="/category" className="button">Jwe</Link>
      <Link to="/" className="button">Koleksyon</Link>
      <Link to="/" className="button">Paramèt</Link>
      <Link to="/" className="button">A pwopo</Link>
    </div>
  );
};

export default HomePage;
