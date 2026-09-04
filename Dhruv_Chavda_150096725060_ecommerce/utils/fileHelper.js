const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

/**
 * Reads and parses JSON data from a file in the data directory.
 * Returns an empty array if the file doesn't exist or on parse failure.
 * @param {string} filename
 * @returns {Promise<Array|Object>}
 */
const readData = async (filename) => {
  const filePath = path.join(dataDir, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

/**
 * Writes data as formatted JSON to a file in the data directory.
 * @param {string} filename
 * @param {Array|Object} data
 * @returns {Promise<void>}
 */
const writeData = async (filename, data) => {
  const filePath = path.join(dataDir, filename);
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    throw error;
  }
};

module.exports = { readData, writeData };
