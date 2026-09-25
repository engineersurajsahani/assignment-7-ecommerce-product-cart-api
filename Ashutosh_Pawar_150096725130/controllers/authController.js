const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { readData, writeData, withLock } = require("../utils/fileHelper");

const USERS_FILE = "users.json";

// Strip the password hash before a user object ever leaves the API.
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

async function register(request, response) {
  try {
    const username = String(request.body.username ?? "").trim();
    // normalize so "A@x.com" and "a@x.com" are the same account
    const email = String(request.body.email ?? "").toLowerCase().trim();
    const password = String(request.body.password ?? "");

    if (!username || !email || !password) {
      return response
        .status(400)
        .json({ message: "username, email and password are required" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return response.status(400).json({ message: "email is not valid" });
    }

    if (password.length < 6) {
      return response
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }

    // 10 salt rounds. bcrypt stores the salt inside the hash.
    // Hashing is slow on purpose, so do it BEFORE taking the file lock.
    const hashed = await bcrypt.hash(password, 10);

    const user = await withLock(async () => {
      const users = await readData(USERS_FILE);
      if (users.some((u) => u.email === email)) {
        return null;
      }
      const newUser = {
        id: `usr_${uuidv4().slice(0, 8)}`,
        username,
        email,
        password: hashed,
        role: "customer", // admins are seeded in data/users.json, not self-made
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await writeData(USERS_FILE, users);
      return newUser;
    });

    if (!user) {
      return response.status(400).json({ message: "Email already registered" });
    }

    return response
      .status(201)
      .json({ message: "User registered", user: publicUser(user) });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

async function login(request, response) {
  try {
    const email = String(request.body.email ?? "").toLowerCase().trim();
    const password = String(request.body.password ?? "");

    if (!email || !password) {
      return response
        .status(400)
        .json({ message: "email and password are required" });
    }

    const users = await readData(USERS_FILE);
    const user = users.find((u) => u.email === email);

    // same message for "no such email" and "wrong password", so the API
    // does not reveal which emails are registered
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ message: "Invalid credentials" });
    }

    // New session id on login, so an id someone planted before login
    // (session fixation) is useless afterwards.
    request.session.regenerate((error) => {
      if (error) {
        return response.status(500).json({ message: error.message });
      }
      request.session.user = publicUser(user);
      return response
        .status(200)
        .json({ message: "Login successful", user: publicUser(user) });
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

function logout(request, response) {
  request.session.destroy((error) => {
    if (error) {
      return response.status(500).json({ message: error.message });
    }
    response.clearCookie("connect.sid");
    return response.status(200).json({ message: "Logged out" });
  });
}

// who is logged in right now (frontend uses it to build the nav)
function me(request, response) {
  return response.status(200).json({ user: request.session.user || null });
}

module.exports = { register, login, logout, me };
