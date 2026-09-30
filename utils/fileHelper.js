const fs = require("fs").promises;

const readJSON = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJSON = async (filePath, data) => {
  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2)
  );
};

module.exports = {
  readJSON,
  writeJSON,
};