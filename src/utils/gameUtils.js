
// mo-kwaze-web/src/utils/gameUtils.js

const DIRECTIONS = [
  { x: 0, y: 1 },   // Horizontal
  { x: 1, y: 0 },   // Vertical
  { x: 1, y: 1 },   // Diagonal (down-right)
  { x: 1, y: -1 },  // Diagonal (up-right)
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getRandomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function canPlaceWord(grid, word, startX, startY, direction) {
  const len = word.length;
  for (let i = 0; i < len; i++) {
    const newX = startX + i * direction.x;
    const newY = startY + i * direction.y;

    if (newX < 0 || newX >= grid.length || newY < 0 || newY >= grid[0].length) {
      return false; // Out of bounds
    }
    if (grid[newX][newY] !== '' && grid[newX][newY] !== word[i]) {
      return false; // Conflict with existing letter
    }
  }
  return true;
}

function placeWord(grid, word, startX, startY, direction) {
  const len = word.length;
  for (let i = 0; i < len; i++) {
    const newX = startX + i * direction.x;
    const newY = startY + i * direction.y;
    grid[newX][newY] = word[i];
  }
}

export function generateGrid(wordsToPlace, gridSize = 10) {
  let grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(''));
  let placedWords = [];

  // Sort words by length in descending order to place longer words first
  const sortedWords = [...wordsToPlace].sort((a, b) => b.word.length - a.word.length);

  for (const wordObj of sortedWords) {
    const word = wordObj.word.toUpperCase();
    let placed = false;
    let attempts = 0;
    const maxAttempts = gridSize * gridSize * 4; // Prevent infinite loops

    while (!placed && attempts < maxAttempts) {
      const startX = Math.floor(Math.random() * gridSize);
      const startY = Math.floor(Math.random() * gridSize);
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

      if (canPlaceWord(grid, word, startX, startY, direction)) {
        placeWord(grid, word, startX, startY, direction);
        placedWords.push({ wordData: wordObj, placement: { startX, startY, direction } });
        placed = true;
      }
      attempts++;
    }
  }

  // Fill empty cells with random letters
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = getRandomLetter();
      }
    }
  }

  return { grid, placedWords };
}
