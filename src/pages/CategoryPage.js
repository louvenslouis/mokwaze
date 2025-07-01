
import React from 'react';
import { Link } from 'react-router-dom';
import words from '../data/words.json';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  return (
    <div className="category-container">
      <div className="card-grid">
        {words.categories.map(category => (
          <Link key={category.name} to={`/game/${category.name}`} className="card">
            <div className="card-content">
              <h2 className="card-title">{category.name}</h2>
              <p className="progress">0/{category.words.length}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
