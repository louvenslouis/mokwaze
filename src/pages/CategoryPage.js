
import React from 'react';
import { Link } from 'react-router-dom';
import words from '../data/words.json';
import { getUnlockedLevel } from '../utils/progressUtils';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const unlockedLevel = getUnlockedLevel();

  return (
    <div className="category-container">
      <div className="card-grid">
        {words.categories.map((category, index) => {
          const level = index + 1;
          const isLocked = level > unlockedLevel;

          return (
            <Link
              key={category.name}
              to={isLocked ? '#' : `/game/${category.name}`}
              className={`card ${isLocked ? 'locked' : ''}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <div className="card-content">
                <h2 className="card-title">
                  {isLocked && <span role="img" aria-label="locked">🔒 </span>}
                  {category.name}
                </h2>
                <p className="progress">0/{category.words.length}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPage;
