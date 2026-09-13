const fs = require('fs/promises');
const path = require('path');

const readData = async (filename) => {
  const filePath = path.join(__dirname, '../data', filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return [];
  }
};

const writeData = async (filename, data) => {
  const filePath = path.join(__dirname, '../data', filename);

  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
};

module.exports = {
  readData,
  writeData
};
