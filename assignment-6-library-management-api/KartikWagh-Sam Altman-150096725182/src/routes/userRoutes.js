const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const validate = require("../middleware/validator");

const {
    roleValidation,
    userIdValidation
} = require("../utils/validation");

const {
    getUsers,
    getUser,
    updateUserRole,
    removeUser
} = require("../controllers/userController");

router.get(
    "/",
    auth,
    role("librarian"),
    getUsers
);

router.get(
    "/:id",
    auth,
    role("librarian"),
    userIdValidation,
    validate,
    getUser
);

router.put(
    "/:id/role",
    auth,
    role("librarian"),
    roleValidation,
    validate,
    updateUserRole
);

router.delete(
    "/:id",
    auth,
    role("librarian"),
    userIdValidation,
    validate,
    removeUser
);

module.exports = router;