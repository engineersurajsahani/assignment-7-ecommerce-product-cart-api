require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const logger = require("./middleware/logger");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(logger);
app.use(express.json());

// Session data lives in server memory; the browser only holds a signed
// cookie (connect.sid) with the session id. Restarting the server logs
// everyone out -- fine for this assignment.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_only_session_secret",
    resave: false, // don't re-save sessions that did not change
    saveUninitialized: false, // no cookie until the user actually logs in
    cookie: {
      httpOnly: true, // page JavaScript cannot read the cookie
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

// The frontend is served by this same server, so the session cookie just
// works -- no CORS, no cross-site cookie settings.
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Anything that matched no route above.
app.use((request, response) => {
  response.status(404).json({ message: "Route not found" });
});

// Express 5 forwards errors thrown inside async handlers to here.
// Also catches bad JSON bodies from express.json().
app.use((error, request, response, next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Invalid JSON body" });
  }
  console.error(error);
  response.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}!!`);
  console.log(`shop UI at http://localhost:${PORT}`);
});
