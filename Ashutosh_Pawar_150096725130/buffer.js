// =====================================================================
// buffer.js -- scratch demo of JSON-file storage + express-session.
// Topic is a tiny "notes" app on purpose, so it is NOT the assignment.
//
// Run:     node buffer.js          (port 5050, separate from the real app)
// Delete this file (and buffer-notes.json) before committing.
// =====================================================================

const express = require("express");
const session = require("express-session");
const fs = require("fs/promises"); // promise version: use with await, no callbacks
const path = require("path");

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------
// PART 1: JSON FILE AS A DATABASE
// ---------------------------------------------------------------------
// A .json file is just text. To use it as storage:
//   read text  -> JSON.parse     -> JS array   (now you can find/filter/push)
//   JS array   -> JSON.stringify -> write text
// There is no "update one row". You always read the WHOLE array,
// change it in memory, and write the WHOLE array back.

// __dirname = folder this file lives in. path.join builds the path safely,
// so it works no matter which folder you ran `node` from.
const NOTES_FILE = path.join(__dirname, "buffer-notes.json");

async function readNotes() {
  try {
    const text = await fs.readFile(NOTES_FILE, "utf-8"); // string, not an object yet
    return JSON.parse(text); // string -> array
  } catch (error) {
    // First run: file does not exist yet (error.code === "ENOENT").
    // Treat that as "no notes" instead of crashing.
    return [];
  }
}

async function writeNotes(notes) {
  // null, 2 = pretty print with 2-space indent, so the file stays readable.
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

// ---------------------------------------------------------------------
// PART 2: EXPRESS-SESSION
// ---------------------------------------------------------------------
// JWT (what you used before): server gives the client a token and forgets.
//   Client must send "Authorization: Bearer <token>" every time.
//
// Session: server REMEMBERS the user.
//   1. On first use, server creates a session object and an id for it.
//   2. It sends the id to the client in a cookie named "connect.sid".
//   3. Client sends that cookie back automatically on every request.
//   4. express-session looks up the id and puts the data on request.session.
// Whatever you put on request.session is still there on the next request.

app.use(
  session({
    secret: "demo-secret", // signs the cookie so it can't be forged (real app: .env)
    resave: false, // don't re-save the session if nothing changed
    saveUninitialized: false, // don't create a session until you store something
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour, in milliseconds
  })
);

// Fake user list so this demo stays about sessions, not bcrypt.
const users = [{ id: "u1", email: "alex@demo.com", password: "pass123" }];

app.post("/login", (request, response) => {
  const { email, password } = request.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return response.status(401).json({ message: "Invalid credentials" });
  }

  // THIS is "logging in" with sessions: store the user on the session.
  // Never store the password here.
  request.session.user = { id: user.id, email: user.email };

  return response.status(200).json({ message: "Logged in" });
});

// Guard middleware: same idea as your verifyToken, but checks the session.
function requireLogin(request, response, next) {
  if (!request.session.user) {
    return response.status(401).json({ message: "Please log in" });
  }
  next();
}

app.get("/me", requireLogin, (request, response) => {
  // Session data survives between requests. Counter proves it.
  request.session.visits = (request.session.visits || 0) + 1;

  return response.status(200).json({
    user: request.session.user,
    visits: request.session.visits,
  });
});

app.post("/logout", (request, response) => {
  // destroy() deletes the session on the server. The old cookie now points
  // at nothing, so the next /me returns 401.
  request.session.destroy((error) => {
    if (error) {
      return response.status(500).json({ message: "Logout failed" });
    }
    response.clearCookie("connect.sid");
    return response.status(200).json({ message: "Logged out" });
  });
});

// ---------------------------------------------------------------------
// PART 3: BOTH TOGETHER -- per-user data saved in the JSON file
// ---------------------------------------------------------------------
// The session tells us WHO is asking. The file holds everyone's data,
// so we filter by request.session.user.id.

app.get("/notes", requireLogin, async (request, response) => {
  const notes = await readNotes();
  const mine = notes.filter((n) => n.userId === request.session.user.id);
  return response.status(200).json(mine);
});

app.post("/notes", requireLogin, async (request, response) => {
  const { text } = request.body;
  if (!text) {
    return response.status(400).json({ message: "text is required" });
  }

  const notes = await readNotes(); // 1. read everything
  const note = {
    id: Date.now().toString(),
    userId: request.session.user.id,
    text,
    createdAt: new Date().toISOString(),
  };
  notes.push(note); // 2. change in memory
  await writeNotes(notes); // 3. write everything back

  return response.status(201).json(note);
});

app.delete("/notes/:id", requireLogin, async (request, response) => {
  const notes = await readNotes();
  const index = notes.findIndex(
    (n) => n.id === request.params.id && n.userId === request.session.user.id
  );

  if (index === -1) {
    return response.status(404).json({ message: "Note not found" });
  }

  const [removed] = notes.splice(index, 1); // splice mutates the array
  await writeNotes(notes);

  return response.status(200).json({ message: "Deleted", note: removed });
});

app.listen(5050, () => {
  console.log("buffer demo on port 5050");
});

// ---------------------------------------------------------------------
// GOTCHAS you WILL hit in the assignment
// ---------------------------------------------------------------------
// 1. Sessions live in server memory by default. Restart the server ->
//    everyone is logged out. Normal for this assignment.
//
// 2. nodemon restarts when any .js OR .json file changes. Your API writes
//    data/*.json -> nodemon restarts -> sessions wiped -> logged out after
//    every write. Fix in package.json:
//      "dev": "nodemon --ignore data/ server.js"
//
// 3. The cookie must reach the server. Browsers do it automatically.
//    curl needs a cookie jar:
//      curl -c jar.txt -b jar.txt -X POST localhost:5050/login \
//        -H "Content-Type: application/json" \
//        -d '{"email":"alex@demo.com","password":"pass123"}'
//      curl -c jar.txt -b jar.txt localhost:5050/me
//    If /me says "Please log in" right after a login, the cookie
//    was not sent.
//
// 4. request.query values are always strings, and a missing file read
//    returns [] thanks to the try/catch above -- but a file containing
//    broken JSON also returns [], and your next write would overwrite it.
//    Keep the seed files valid.
