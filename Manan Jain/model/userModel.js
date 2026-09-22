const { readData, writeData } = require("../config/db");

const USERS_FILE = "users.json";

const getAllUsers = async () => {
  return await readData(USERS_FILE);
};

const findUserByEmail = async (email) => {
  const users = await getAllUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

const findUserById = async (id) => {
  const users = await getAllUsers();
  return users.find((user) => user.id === id);
};

const createUser = async (newUser) => {
  const users = await getAllUsers();
  users.push(newUser);
  await writeData(USERS_FILE, users);
  return newUser;
};

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  createUser
};
