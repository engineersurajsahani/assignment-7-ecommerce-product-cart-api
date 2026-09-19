const { body, param, query } = require("express-validator");

const registerValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("role")
        .optional()
        .isIn(["student", "librarian"])
        .withMessage("Role must be student or librarian")
];

const loginValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

const profileValidation = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail()
];

const bookValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),

    body("author")
        .trim()
        .notEmpty()
        .withMessage("Author is required"),

    body("isbn")
        .trim()
        .notEmpty()
        .withMessage("ISBN is required"),

    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),

    body("quantity")
        .isInt({ min: 0 })
        .withMessage("Quantity must be a non-negative integer")
];

const bookIdValidation = [
    param("id")
        .notEmpty()
        .withMessage("Book ID is required")
];

const roleValidation = [
    param("id")
        .notEmpty()
        .withMessage("User ID is required"),

    body("role")
        .isIn(["student", "librarian"])
        .withMessage("Role must be student or librarian")
];

const userIdValidation = [
    param("id")
        .notEmpty()
        .withMessage("User ID is required")
];

const searchValidation = [
    query("title")
        .optional()
        .trim(),

    query("author")
        .optional()
        .trim(),

    query("category")
        .optional()
        .trim(),

    query("status")
        .optional()
        .isIn(["available", "borrowed"])
        .withMessage("Status must be available or borrowed")
];

module.exports = {
    registerValidation,
    loginValidation,
    profileValidation,
    bookValidation,
    bookIdValidation,
    roleValidation,
    userIdValidation,
    searchValidation
};