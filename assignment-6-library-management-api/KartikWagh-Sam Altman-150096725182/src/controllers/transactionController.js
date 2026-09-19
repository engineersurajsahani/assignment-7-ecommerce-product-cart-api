const {
    getBookById,
    updateBook
} = require("../models/bookModel");

const {
    createTransaction,
    getAllTransactions,
    getTransactionsByUser,
    updateTransaction
} = require("../models/transactionModel");

const borrowBook = async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id;

        const book = await getBookById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Book is not available"
            });
        }

        const userTransactions =
            await getTransactionsByUser(userId);

        const alreadyBorrowed = userTransactions.some(
            (transaction) =>
                transaction.bookId === bookId &&
                transaction.status === "active"
        );

        if (alreadyBorrowed) {
            return res.status(400).json({
                success: false,
                message: "You have already borrowed this book"
            });
        }

        const borrowDate = new Date();

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const transactionData = {
            userId,
            bookId,
            type: "borrow",
            borrowDate,
            returnDate: null,
            dueDate,
            status: "active"
        };

        const transaction =
            await createTransaction(transactionData);

        const newQuantity = book.quantity - 1;

        await updateBook(bookId, {
            quantity: newQuantity,
            status: newQuantity > 0
                ? "available"
                : "borrowed"
        });

        res.status(201).json({
            success: true,
            message: "Book borrowed successfully",
            transaction
        });
    } catch (error) {
        next(error);
    }
};

const returnBook = async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id;

        const book = await getBookById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const userTransactions =
            await getTransactionsByUser(userId);

        const activeTransaction =
            userTransactions.find(
                (transaction) =>
                    transaction.bookId === bookId &&
                    (
                        transaction.status === "active" ||
                        transaction.status === "overdue"
                    )
            );

        if (!activeTransaction) {
            return res.status(400).json({
                success: false,
                message: "No active borrowing transaction found"
            });
        }

        const returnDate = new Date();

        await updateTransaction(
            activeTransaction.id,
            {
                type: "return",
                returnDate,
                status: "returned"
            }
        );

        const newQuantity = book.quantity + 1;

        await updateBook(bookId, {
            quantity: newQuantity,
            status: "available"
        });

        res.json({
            success: true,
            message: "Book returned successfully",
            transactionId: activeTransaction.id
        });
    } catch (error) {
        next(error);
    }
};

const getMyTransactions = async (req, res, next) => {
    try {
        const transactions =
            await getTransactionsByUser(req.user.id);

        const now = new Date();

        const updatedTransactions = transactions.map(
            (transaction) => {
                if (
                    transaction.status === "active" &&
                    transaction.dueDate &&
                    transaction.dueDate.toDate &&
                    transaction.dueDate.toDate() < now
                ) {
                    return {
                        ...transaction,
                        status: "overdue"
                    };
                }

                if (
                    transaction.status === "active" &&
                    transaction.dueDate &&
                    transaction.dueDate < now
                ) {
                    return {
                        ...transaction,
                        status: "overdue"
                    };
                }

                return transaction;
            }
        );

        res.json({
            success: true,
            count: updatedTransactions.length,
            transactions: updatedTransactions
        });
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const transactions =
            await getAllTransactions();

        const now = new Date();

        const updatedTransactions = transactions.map(
            (transaction) => {
                let dueDate = transaction.dueDate;

                if (
                    dueDate &&
                    typeof dueDate.toDate === "function"
                ) {
                    dueDate = dueDate.toDate();
                }

                if (
                    transaction.status === "active" &&
                    dueDate &&
                    dueDate < now
                ) {
                    return {
                        ...transaction,
                        status: "overdue"
                    };
                }

                return transaction;
            }
        );

        res.json({
            success: true,
            count: updatedTransactions.length,
            transactions: updatedTransactions
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    borrowBook,
    returnBook,
    getMyTransactions,
    getTransactions
};