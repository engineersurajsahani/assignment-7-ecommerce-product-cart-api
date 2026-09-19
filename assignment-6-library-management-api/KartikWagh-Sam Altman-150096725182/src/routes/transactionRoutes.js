const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
    getTransactions,
    getMyTransactions
} = require("../controllers/transactionController");

router.get(
    "/",
    auth,
    role("librarian"),
    getTransactions
);

router.get(
    "/my",
    auth,
    getMyTransactions
);

module.exports = router;