// JSON files in ./data act as the database. There is no "update one row":
// every change reads the WHOLE array, edits it in memory, writes it all back.
const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

async function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const text = await fs.readFile(filePath, "utf-8");
    return JSON.parse(text);
  } catch (error) {
    // Missing file = empty collection. Any OTHER error (e.g. broken JSON) is
    // thrown on purpose -- returning [] there would let the next write wipe
    // every record in the file.
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  // Write to a temp file, then rename over the real one. rename is atomic, so
  // a crash mid-write can never leave a half-written (corrupt) JSON file.
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempPath, filePath);
}

// Two requests doing read -> change -> write at the same moment would both
// read the old array, and the second write would erase the first one's
// change. Every read-modify-write goes through this lock, so they run one
// at a time, in order.
let queue = Promise.resolve();

function withLock(task) {
  const result = queue.then(task);
  // keep the chain alive even if this task throws
  queue = result.catch(() => {});
  return result;
}

module.exports = { readData, writeData, withLock };
