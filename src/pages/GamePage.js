
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import wordsData from '../data/words.json';
import { generateGrid } from '../utils/gameUtils';
import '../styles/GamePage.css';

const GamePage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [wordsToFind, setWordsToFind] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWordCells, setFoundWordCells] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintedCell, setHintedCell] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false); // For drag-and-drop
  const [showWordList, setShowWordList] = useState(true); // For word list visibility

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

  // Drag-and-drop handlers
  const handleMouseDown = useCallback((rowIndex, colIndex) => {
    setIsSelecting(true);
    setSelectedCells([{ row: rowIndex, col: colIndex }]);
  }, []);

  const handleMouseEnter = useCallback((rowIndex, colIndex) => {
    if (!isSelecting) return;

    const newSelectedCells = [...selectedCells];
    const lastCell = newSelectedCells[newSelectedCells.length - 1];

    // Only allow selection of adjacent cells (horizontal, vertical, diagonal)
    const isAdjacent = (
      (Math.abs(rowIndex - lastCell.row) <= 1 && Math.abs(colIndex - lastCell.col) <= 1) &&
      !(rowIndex === lastCell.row && colIndex === lastCell.col)
    );

    if (isAdjacent) {
      // Prevent adding the same cell multiple times if dragging back and forth
      const isAlreadySelected = newSelectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
      if (!isAlreadySelected) {
        newSelectedCells.push({ row: rowIndex, col: colIndex });
        setSelectedCells(newSelectedCells);
      }
    }
  }, [isSelecting, selectedCells]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
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
    setSelectedCells([]); // Clear selection after mouse up
  }, [selectedCells, grid, wordsToFind, foundWords]);

  const isGridCellFound = useCallback((rowIndex, colIndex) => {
    return foundWordCells.some(wordCells => 
      wordCells.some(cell => cell.row === rowIndex && cell.col === colIndex)
    );
  }, [foundWordCells]);

  const handleWordDoubleClick = useCallback((wordObj) => {
    if (hintsRemaining > 0 && !foundWords.includes(wordObj.wordData.word.toUpperCase())) {
      setHintsRemaining(prev => prev - 1);

      const { startX, startY } = wordObj.placement;
      setHintedCell({ row: startX, col: startY });
      setTimeout(() => setHintedCell(null), 1000); // Clear hint after 1 second
    }
  }, [hintsRemaining, foundWords]);

  const isCellSelected = useCallback((rowIndex, colIndex) => {
    return selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
  }, [selectedCells]);

  const isWordFound = useCallback((word) => {
    return foundWords.includes(word.toUpperCase());
  }, [foundWords]);

  return (
    <div className="game-container" onMouseLeave={handleMouseUp}> {/* Clear selection if mouse leaves grid */}
      <h1 className="category-title">{categoryName}</h1>
      <div className="hints-display">
        Hints Remaining: {hintsRemaining}
      </div>

      <div className="word-list-toggle">
        <button onClick={() => setShowWordList(!showWordList)} className="toggle-button">
          {showWordList ? '👁️' : '🙈'} {/* Eye icon for show/hide */}
        </button>
      </div>

      <div className={`words-to-find ${showWordList ? '' : 'hidden'}`}>
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

      <div className="word-search-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''} ${isGridCellFound(rowIndex, colIndex) ? 'found' : ''} ${hintedCell && hintedCell.row === rowIndex && hintedCell.col === colIndex ? 'hinted' : ''}`}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePage;
