const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

const readData = async (filename) => {
  const filePath = path.join(dataDir, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeData = async (filename, data) => {
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readData, writeData };
