const express = require("express");

const router = express.Router();

const {
    register,
    login,
    getProfile,
    updateProfile
} = require("../controllers/authController");

const auth = require("../middleware/auth");

const validate = require("../middleware/validator");

const {
    registerValidation,
    loginValidation,
    profileValidation
} = require("../utils/validation");

router.post(
    "/register",
    registerValidation,
    validate,
    register
);

router.post(
    "/login",
    loginValidation,
    validate,
    login
);

router.get(
    "/profile",
    auth,
    getProfile
);

router.put(
    "/profile",
    auth,
    profileValidation,
    validate,
    updateProfile
);

module.exports = router;