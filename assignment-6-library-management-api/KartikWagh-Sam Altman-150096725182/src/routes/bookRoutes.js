const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const validate = require("../middleware/validator");

const {
    bookValidation,
    bookIdValidation,
    searchValidation
} = require("../utils/validation");

const {
    getBooks,
    searchBooks,
    getBook,
    addBook,
    updateBookDetails,
    removeBook
} = require("../controllers/bookController");

const {
    borrowBook,
    returnBook
} = require("../controllers/transactionController");

router.get(
    "/search",
    auth,
    searchValidation,
    validate,
    searchBooks
);

router.get(
    "/",
    auth,
    searchValidation,
    validate,
    getBooks
);

router.get(
    "/:id",
    auth,
    bookIdValidation,
    validate,
    getBook
);

router.post(
    "/",
    auth,
    role("librarian"),
    bookValidation,
    validate,
    addBook
);

router.put(
    "/:id",
    auth,
    role("librarian"),
    bookIdValidation,
    bookValidation,
    validate,
    updateBookDetails
);

router.delete(
    "/:id",
    auth,
    role("librarian"),
    bookIdValidation,
    validate,
    removeBook
);

router.post(
    "/:id/borrow",
    auth,
    role("student"),
    bookIdValidation,
    validate,
    borrowBook
);

router.post(
    "/:id/return",
    auth,
    role("student"),
    bookIdValidation,
    validate,
    returnBook
);

module.exports = router;