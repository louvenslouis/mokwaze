// src/utils/progressUtils.js

const PROGRESS_KEY = 'moKwazeProgress';

/**
 * Gets the highest level unlocked by the player.
 * @returns {number} The highest unlocked level number (defaults to 1).
 */
export const getUnlockedLevel = () => {
  const progress = localStorage.getItem(PROGRESS_KEY);
  if (!progress) {
    return 1; // By default, only level 1 is unlocked
  }
  return parseInt(progress, 10);
};

/**
 * Unlocks the next level if the completed level was the latest one.
 * @param {string} completedCategoryName - The name of the category just completed.
 * @param {Array<object>} allCategories - The array of all category objects from words.json.
 */
export const unlockNextLevel = (completedCategoryName, allCategories) => {
  const currentUnlockedLevel = getUnlockedLevel();
  const completedLevelIndex = allCategories.findIndex(cat => cat.name === completedCategoryName);
  const completedLevelNumber = completedLevelIndex + 1;

  // Only unlock the next level if the player just beat their highest unlocked level
  if (completedLevelNumber === currentUnlockedLevel) {
    const nextLevel = currentUnlockedLevel + 1;
    if (nextLevel <= allCategories.length) {
      localStorage.setItem(PROGRESS_KEY, nextLevel.toString());
    }
  }
};
