const express = require("express");
const { register, login, logout, me } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// no authGuard: logging out twice is harmless, always 200
router.post("/logout", logout);
router.get("/me", me);

module.exports = router;
