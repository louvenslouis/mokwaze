
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { unlockNextLevel } from '../utils/progressUtils';
import words from '../data/words.json';
import '../styles/VictoryPage.css';

const VictoryPage = () => {
  const { categoryName } = useParams();
  const allCategories = words.categories;
  const isLastCategory = allCategories.findIndex(cat => cat.name === categoryName) === allCategories.length - 1;

  useEffect(() => {
    unlockNextLevel(categoryName, allCategories);
  }, [categoryName, allCategories]);

  return (
    <div className="victory-container">
      {isLastCategory ? (
        <>
          <h1 className="victory-title">Felisitasyon!</h1>
          <p className="victory-subtitle">Ou fini tout nivo yo! Ou se yon chanpyon Mo Kwaze!</p>
          <div className="button-group">
            <Link to="/" className="button">Paj Akèy</Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="victory-title">Bravo!</h1>
          <p className="victory-subtitle">Ou jwenn tout pawòl yo!</p>
          <div className="button-group">
            <Link to="/category" className="button">Pwochen Nivo</Link>
            <Link to={`/game/${categoryName}`} className="button">Rejwe</Link>
            <Link to="/" className="button">Paj Akèy</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default VictoryPage;
