
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import wordsData from '../data/words.json';
import { generateGrid } from '../utils/gameUtils';
import '../styles/GamePage.css';

import FoundWordLine from '../components/FoundWordLine';

const GamePage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [wordsToFind, setWordsToFind] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWordCells, setFoundWordCells] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(30); //unlimited hints; FIX IT AFTER
  const [hintedCell, setHintedCell] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false); // For drag-and-drop
  const [showWordList, setShowWordList] = useState(true); // For word list visibility
  const touchStartY = useRef(0);

  useEffect(() => {
    const preventPullToRefresh = (e) => {
      // Only prevent if at the top of the scroll area and trying to scroll down
      if (e.targetTouches[0].clientY > touchStartY.current && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.targetTouches[0].clientY;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  useEffect(() => {
    const category = wordsData.categories.find(cat => cat.name === categoryName);
    if (category) {
      const { grid: generatedGrid, placedWords } = generateGrid(category.words, 10);
      setGrid(generatedGrid);
      setWordsToFind(placedWords);
      console.log('Generated Grid:', generatedGrid);
      console.log('Placed Words:', placedWords);
      setFoundWords([]);
      setSelectedCells([]);
      setFoundWordCells([]);
      setHintsRemaining(30);  //unlimited hints; FIX IT AFTER
      setHintedCell(null);
      setSelectionDirection(null); // Reset direction on category change
    }
  }, [categoryName]);

  useEffect(() => {
    if (wordsToFind.length > 0 && foundWords.length === wordsToFind.length) {
      navigate(`/victory/${categoryName}`);
    }
  }, [foundWords, wordsToFind, navigate, categoryName]);

  const handleSelectionChange = useCallback((rowIndex, colIndex) => {
    if (!isSelecting || !selectedCells.length) return;

    const startCell = selectedCells[0];
    const endCell = { row: rowIndex, col: colIndex };

    const dx = endCell.col - startCell.col;
    const dy = endCell.row - startCell.row;

    let newSelectedCells = [startCell];

    if (dx === 0 && dy === 0) {
      // Same cell, do nothing more
    } else if (dx === 0) {
      // Vertical selection
      const step = dy > 0 ? 1 : -1;
      for (let i = step; Math.abs(i) <= Math.abs(dy); i += step) {
        newSelectedCells.push({ row: startCell.row + i, col: startCell.col });
      }
    } else if (dy === 0) {
      // Horizontal selection
      const step = dx > 0 ? 1 : -1;
      for (let i = step; Math.abs(i) <= Math.abs(dx); i += step) {
        newSelectedCells.push({ row: startCell.row, col: startCell.col + i });
      }
    } else if (Math.abs(dx) === Math.abs(dy)) {
      // Diagonal selection
      const xStep = dx > 0 ? 1 : -1;
      const yStep = dy > 0 ? 1 : -1;
      for (let i = 1; i <= Math.abs(dx); i++) {
        newSelectedCells.push({ row: startCell.row + i * yStep, col: startCell.col + i * xStep });
      }
    }

    setSelectedCells(newSelectedCells);
  }, [isSelecting, selectedCells]);

  const handleMouseEnter = useCallback((rowIndex, colIndex) => {
    handleSelectionChange(rowIndex, colIndex);
  }, [handleSelectionChange]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setSelectionDirection(null); // Clear direction after selection ends
    if (selectedCells.length > 1 && grid.length > 0 && grid[0].length > 0) { // Add grid.length and grid[0].length check
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

  const gridRef = useRef(null);

  const getCellCoordinatesFromEvent = useCallback((event) => {
    if (!gridRef.current) return null;

    const gridRect = gridRef.current.getBoundingClientRect();
    // Defensive check for grid[0] before accessing its length
    const cellSize = grid.length > 0 && grid[0].length > 0 ? gridRect.width / grid[0].length : 0;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const colIndex = Math.floor((clientX - gridRect.left) / cellSize);
    const rowIndex = Math.floor((clientY - gridRect.top) / cellSize);

    // Ensure coordinates are within grid bounds
    if (rowIndex >= 0 && rowIndex < grid.length && colIndex >= 0 && colIndex < grid[0].length) {
      return { row: rowIndex, col: colIndex };
    }
    return null;
  }, [grid]);

  const handleTouchStart = useCallback((event) => {
    event.preventDefault(); // Prevent scrolling
    const coords = getCellCoordinatesFromEvent(event);
    if (coords) {
      setIsSelecting(true);
      setSelectedCells([coords]);
      setSelectionDirection(null); // Reset direction on new selection
    }
  }, [getCellCoordinatesFromEvent]);

  const handleTouchMove = useCallback((event) => {
    if (!isSelecting) return;
    event.preventDefault(); // Prevent scrolling

    const coords = getCellCoordinatesFromEvent(event);
    if (coords) {
      handleSelectionChange(coords.row, coords.col);
    }
  }, [isSelecting, getCellCoordinatesFromEvent, handleSelectionChange]);

  const handleTouchEnd = useCallback(() => {
    setIsSelecting(false);
    setSelectionDirection(null); // Clear direction after selection ends
    if (selectedCells.length > 1 && grid.length > 0 && grid[0].length > 0) { // Add grid.length and grid[0].length check
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

  return (
    <div className="game-container" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchEnd={handleTouchEnd}>
      <div className="game-header">
        <button onClick={() => navigate('/category')} className="back-button">🔙</button>
        <h1 className="category-title">{categoryName}</h1>
        <div className="hints-display">
          Hints: {hintsRemaining}
        </div>
        <div className="word-list-toggle">
          <button onClick={() => setShowWordList(!showWordList)} className="toggle-button">
            {showWordList ? '🙈' : '👁️'}
          </button>
        </div>
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

      <div 
        className="word-search-grid"
        ref={gridRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <FoundWordLine gridRef={gridRef} foundWordCells={foundWordCells} gridSize={grid.length} />
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''} ${hintedCell && hintedCell.row === rowIndex && hintedCell.col === colIndex ? 'hinted' : ''}`}}
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
