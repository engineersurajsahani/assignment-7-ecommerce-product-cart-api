const fs = require('fs/promises');
const path = require('path');

const dataDirectory = path.join(__dirname, '../data');

const readData = async (filename) => {
  const filePath = path.join(dataDirectory, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeData(filename, []);
      return [];
    }
    throw error;
  }
};

const writeData = async (filename, data) => {
  const filePath = path.join(dataDirectory, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { readData, writeData };
