
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [selectionDirection, setSelectionDirection] = useState(null); // New state for selection direction

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
      setSelectionDirection(null); // Reset direction on category change
    }
  }, [categoryName]);

  useEffect(() => {
    if (wordsToFind.length > 0 && foundWords.length === wordsToFind.length) {
      navigate('/victory');
    }
  }, [foundWords, wordsToFind, navigate]);

  // Helper to check if a cell is a valid next step in a given direction
  const isValidNextCell = useCallback((lastCell, nextCell, currentDirection) => {
    const dx = nextCell.row - lastCell.row;
    const dy = nextCell.col - lastCell.col;

    // Must be a single step
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;

    // Must be adjacent (not the same cell)
    if (dx === 0 && dy === 0) return false;

    if (currentDirection) {
      // If a direction is established, ensure the new cell follows it
      // Check if the new step maintains the same direction ratio
      if (currentDirection.dx === 0 && dx !== 0) return false; // Was vertical, now horizontal
      if (currentDirection.dy === 0 && dy !== 0) return false; // Was horizontal, now vertical
      if (currentDirection.dx !== 0 && currentDirection.dy !== 0) { // Was diagonal
        if (Math.abs(dx) !== Math.abs(dy)) return false; // Not diagonal anymore
        if (dx / currentDirection.dx !== dy / currentDirection.dy) return false; // Changed diagonal direction
      }
    }
    return true;
  }, []);

  // Drag-and-drop handlers
  const handleMouseDown = useCallback((rowIndex, colIndex) => {
    setIsSelecting(true);
    setSelectedCells([{ row: rowIndex, col: colIndex }]);
    setSelectionDirection(null); // Reset direction on new selection
  }, []);

  const handleMouseEnter = useCallback((rowIndex, colIndex) => {
    if (!isSelecting) return;

    const newSelectedCells = [...selectedCells];
    const lastCell = newSelectedCells[newSelectedCells.length - 1];
    const currentCell = { row: rowIndex, col: colIndex };

    if (selectedCells.length === 1) {
      // If it's the second cell, establish direction
      const dx = currentCell.row - lastCell.row;
      const dy = currentCell.col - lastCell.col;
      if (dx === 0 && dy === 0) return; // Same cell
      setSelectionDirection({ dx, dy });
      newSelectedCells.push(currentCell);
      setSelectedCells(newSelectedCells);
    } else if (selectedCells.length > 1) {
      // For subsequent cells, check if it follows the established direction
      if (isValidNextCell(lastCell, currentCell, selectionDirection)) {
        const isAlreadySelected = newSelectedCells.some(cell => cell.row === currentCell.row && cell.col === currentCell.col);
        if (!isAlreadySelected) {
          newSelectedCells.push(currentCell);
          setSelectedCells(newSelectedCells);
        }
      }
    }
  }, [isSelecting, selectedCells, selectionDirection, isValidNextCell]);

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
      const newSelectedCells = [...selectedCells];
      const lastCell = newSelectedCells[newSelectedCells.length - 1];

      if (selectedCells.length === 1) {
        // If it's the second cell, establish direction
        const dx = coords.row - lastCell.row;
        const dy = coords.col - lastCell.col;
        if (dx === 0 && dy === 0) return; // Same cell
        setSelectionDirection({ dx, dy });
        newSelectedCells.push(coords);
        setSelectedCells(newSelectedCells);
      } else if (selectedCells.length > 1) {
        // For subsequent cells, check if it follows the established direction
        if (isValidNextCell(lastCell, coords, selectionDirection)) {
          const isAlreadySelected = newSelectedCells.some(cell => cell.row === coords.row && cell.col === coords.col);
          if (!isAlreadySelected) {
            newSelectedCells.push(coords);
            setSelectedCells(newSelectedCells);
          }
        }
      }
    }
  }, [isSelecting, selectedCells, selectionDirection, isValidNextCell, getCellCoordinatesFromEvent]);

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
        <h1 className="category-title">{categoryName}</h1>
        <div className="hints-display">
          Hints: {hintsRemaining}
        </div>
        <div className="word-list-toggle">
          <button onClick={() => setShowWordList(!showWordList)} className="toggle-button">
            {showWordList ? '👁️' : '🙈'}
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
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''} ${isGridCellFound(rowIndex, colIndex) ? 'found' : ''} ${hintedCell && hintedCell.row === rowIndex && hintedCell.col === colIndex ? 'hinted' : ''}`}
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
