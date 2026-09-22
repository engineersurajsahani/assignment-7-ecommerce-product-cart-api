const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const readData = async (filename) => {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file is missing or corrupted, return an empty array
    // so the rest of the application can keep working safely.
    return [];
  }
};

const writeData = async (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = {
  readData,
  writeData,
};