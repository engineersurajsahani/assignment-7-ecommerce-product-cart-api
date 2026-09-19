const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

const readData = async (filename) => {
  const filePath = path.join(dataDir, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeData = async (filename, data) => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {}
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { readData, writeData };
