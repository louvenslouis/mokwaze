// src/components/FoundWordLine.js
import React from 'react';
import '../styles/FoundWordLine.css';

const FoundWordLine = ({ gridRef, foundWordCells, gridSize }) => {
  if (!gridRef.current) return null;

  const gridRect = gridRef.current.getBoundingClientRect();
  const cellSize = gridRect.width / gridSize;

  return (
    <svg className="line-container">
      {foundWordCells.map((word, index) => {
        const startCell = word[0];
        const endCell = word[word.length - 1];

        const startX = startCell.col * cellSize + cellSize / 2;
        const startY = startCell.row * cellSize + cellSize / 2;
        const endX = endCell.col * cellSize + cellSize / 2;
        const endY = endCell.row * cellSize + cellSize / 2;

        return (
          <line
            key={index}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            className="found-word-line"
          />
        );
      })}
    </svg>
  );
};

export default FoundWordLine;
