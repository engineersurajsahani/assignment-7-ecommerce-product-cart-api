const fs = require('fs/promises');
const path = require('path');

/**
 * Reads JSON data from a file inside the data directory
 * @param {string} filename - e.g. 'products.json', 'users.json', 'carts.json'
 * @returns {Promise<Array|Object>} Parsed JSON content or empty array if file does not exist / error
 */
const readData = async (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty/corrupt, return default empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    return [];
  }
};

/**
 * Writes data as formatted JSON to a file inside the data directory
 * @param {string} filename - e.g. 'products.json', 'users.json', 'carts.json'
 * @param {Array|Object} data - Data to serialize and save
 */
const writeData = async (filename, data) => {
  const filePath = path.join(__dirname, '../data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { readData, writeData };
