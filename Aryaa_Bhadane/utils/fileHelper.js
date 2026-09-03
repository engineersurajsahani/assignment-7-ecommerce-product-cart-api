const fs = require('fs/promises');
const path = require('path');

const dataPath = (filename) => path.join(__dirname, '../data', filename);
let mutationQueue = Promise.resolve();

const readData = async (filename) => {
  try {
    const data = await fs.readFile(dataPath(filename), 'utf8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw new Error(`Could not read ${filename}: ${error.message}`);
  }
};

const writeData = async (filename, data) => {
  try {
    await fs.writeFile(dataPath(filename), JSON.stringify(data, null, 2) + '\n', 'utf8');
  } catch (error) {
    throw new Error(`Could not write ${filename}: ${error.message}`);
  }
};

// Serializes every read-modify-write operation, including operations spanning files.
const withDataLock = (operation) => {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.catch(() => undefined);
  return result;
};

module.exports = { readData, writeData, withDataLock };
