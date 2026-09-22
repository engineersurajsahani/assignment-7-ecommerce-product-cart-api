const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
};

const readData = async (filename) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeData(filename, []);
      return [];
    }
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read data from ${filename}`);
  }
};

const writeData = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    throw new Error(`Failed to write data to ${filename}`);
  }
};

module.exports = {
  readData,
  writeData
};
