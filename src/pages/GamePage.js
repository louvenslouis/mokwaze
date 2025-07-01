
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import wordsData from '../data/words.json';
import { generateGrid } from '../utils/gameUtils';
import '../styles/GamePage.css';

const GamePage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [wordsToFind, setWordsToFind] = useState([]); // This will now store objects with wordData and placement
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWordCells, setFoundWordCells] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintedCell, setHintedCell] = useState(null);

  useEffect(() => {
    const category = wordsData.categories.find(cat => cat.name === categoryName);
    if (category) {
      const { grid: generatedGrid, placedWords } = generateGrid(category.words, 10);
      setGrid(generatedGrid);
      setWordsToFind(placedWords);
      setFoundWords([]);
      setSelectedCells([]);
      setFoundWordCells([]);
      setHintsRemaining(3);
      setHintedCell(null);
    }
  }, [categoryName]);

  useEffect(() => {
    if (wordsToFind.length > 0 && foundWords.length === wordsToFind.length) {
      navigate('/victory');
    }
  }, [foundWords, wordsToFind, navigate]);

  const isAdjacent = (cell1, cell2) => {
    return (
      (Math.abs(cell1.row - cell2.row) <= 1 && Math.abs(cell1.col - cell2.col) <= 1) &&
      !(cell1.row === cell2.row && cell1.col === cell2.col)
    );
  };

  const handleCellClick = useCallback((rowIndex, colIndex) => {
    const clickedCell = { row: rowIndex, col: colIndex };
    const isAlreadySelected = selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);

    if (isAlreadySelected) {
      const index = selectedCells.findIndex(cell => cell.row === rowIndex && cell.col === colIndex);
      setSelectedCells(selectedCells.slice(0, index));
    } else {
      if (selectedCells.length === 0) {
        setSelectedCells([clickedCell]);
      } else {
        const lastCell = selectedCells[selectedCells.length - 1];
        if (isAdjacent(lastCell, clickedCell)) {
          setSelectedCells(prevSelectedCells => [...prevSelectedCells, clickedCell]);
        } else {
          setSelectedCells([clickedCell]);
        }
      }
    }
  }, [selectedCells]);

  const checkWord = useCallback(() => {
    if (selectedCells.length > 1) {
      const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
      const reversedSelectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).reverse().join('');

      const foundWordObj = wordsToFind.find(
        wordObj => wordObj.wordData.word.toUpperCase() === selectedWord || wordObj.wordData.word.toUpperCase() === reversedSelectedWord
      );

      if (foundWordObj && !foundWords.includes(foundWordObj.wordData.word.toUpperCase())) {
        setFoundWords(prevFoundWords => [...prevFoundWords, foundWordObj.wordData.word.toUpperCase()]);
        setFoundWordCells(prevFoundWordCells => [...prevFoundWordCells, selectedCells]);
      }
    }
    setSelectedCells([]);
  }, [selectedCells, grid, wordsToFind, foundWords]);

  const isGridCellFound = useCallback((rowIndex, colIndex) => {
    return foundWordCells.some(wordCells => 
      wordCells.some(cell => cell.row === rowIndex && cell.col === colIndex)
    );
  }, [foundWordCells]);

  const handleWordDoubleClick = useCallback((wordObj) => {
    if (hintsRemaining > 0 && !foundWords.includes(wordObj.wordData.word.toUpperCase())) {
      setHintsRemaining(prev => prev - 1);

      const { startX, startY, direction } = wordObj.placement;
      setHintedCell({ row: startX, col: startY });
      setTimeout(() => setHintedCell(null), 1000); // Clear hint after 1 second
    }
  }, [hintsRemaining, foundWords]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        checkWord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkWord]);

  const isCellSelected = useCallback((rowIndex, colIndex) => {
    return selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
  }, [selectedCells]);

  const isWordFound = useCallback((word) => {
    return foundWords.includes(word.toUpperCase());
  }, [foundWords]);

  return (
    <div className="game-container">
      <h1 className="category-title">{categoryName}</h1>
      <div className="hints-display">
        Hints Remaining: {hintsRemaining}
      </div>
      <div className="word-search-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''} ${isGridCellFound(rowIndex, colIndex) ? 'found' : ''} ${hintedCell && hintedCell.row === rowIndex && hintedCell.col === colIndex ? 'hinted' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="words-to-find">
        <h2>Mo pou jwenn:</h2>
        <ul>
          {wordsToFind.map((wordObj) => (
            <li 
              key={wordObj.wordData.id} 
              className={isWordFound(wordObj.wordData.word) ? 'found' : ''}
              onDoubleClick={() => handleWordDoubleClick(wordObj)}
            >
              {wordObj.wordData.word.toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GamePage;
