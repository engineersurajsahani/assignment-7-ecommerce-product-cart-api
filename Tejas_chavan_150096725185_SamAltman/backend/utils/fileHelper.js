// utils/fileHelper.js
// Thin async wrapper around Node's fs/promises for reading & writing
// the JSON "collections" that act as our data store.

const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Read and parse a JSON file from the /data directory.
 * Returns an empty array if the file does not exist or is empty/corrupt,
 * so callers never have to null-check the result.
 * @param {string} filename e.g. "products.json"
 */
const readData = async (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet — treat as an empty collection.
      return [];
    }
    console.error(`[fileHelper] Failed to read ${filename}:`, error.message);
    return [];
  }
};

/**
 * Serialize and persist data to a JSON file in the /data directory.
 * Creates the /data directory if it does not already exist.
 * @param {string} filename e.g. "products.json"
 * @param {any} data serializable data (usually an array of records)
 */
const writeData = async (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[fileHelper] Failed to write ${filename}:`, error.message);
    throw error;
  }
};

module.exports = { readData, writeData };
