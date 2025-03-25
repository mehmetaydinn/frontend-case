/**
 * LocalStorage service for data persistence
 * Provides methods for getting, setting, and removing items from localStorage
 */
const localStorageService = {
  /**
   * Retrieve an item from localStorage
   * @param {string} key - The key to retrieve
   * @returns {any} - The parsed value or null if not found
   */
  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      
      if (value) {
        const parsedValue = JSON.parse(value);
        return parsedValue;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Store an item in localStorage
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store (will be JSON stringified)
   * @returns {boolean} - True if successful
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successful
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Clear all items from localStorage
   * @returns {boolean} - True if successful
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Check if localStorage has a key
   * @param {string} key - The key to check
   * @returns {boolean} - True if the key exists
   */
  hasKey(key) {
    try {
      const value = localStorage.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }
};

export default localStorageService; 