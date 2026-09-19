const {
    createBook,
    getBookById,
    getAllBooks,
    updateBook,
    deleteBook
} = require("../models/bookModel");

const getBooks = async (req, res, next) => {
    try {
        let books = await getAllBooks();

        const {
            category,
            status,
            author
        } = req.query;

        if (category) {
            books = books.filter(
                (book) =>
                    book.category &&
                    book.category.toLowerCase() ===
                    category.toLowerCase()
            );
        }

        if (status) {
            books = books.filter(
                (book) =>
                    book.status &&
                    book.status.toLowerCase() ===
                    status.toLowerCase()
            );
        }

        if (author) {
            books = books.filter(
                (book) =>
                    book.author &&
                    book.author
                        .toLowerCase()
                        .includes(author.toLowerCase())
            );
        }

        res.json({
            success: true,
            count: books.length,
            books
        });
    } catch (error) {
        next(error);
    }
};

const searchBooks = async (req, res, next) => {
    try {
        const books = await getAllBooks();

        const {
            title,
            author
        } = req.query;

        let results = books;

        if (!title && !author) {
            return res.status(400).json({
                success: false,
                message: "Provide title or author to search"
            });
        }

        if (title) {
            results = results.filter(
                (book) =>
                    book.title &&
                    book.title
                        .toLowerCase()
                        .includes(title.toLowerCase())
            );
        }

        if (author) {
            results = results.filter(
                (book) =>
                    book.author &&
                    book.author
                        .toLowerCase()
                        .includes(author.toLowerCase())
            );
        }

        res.json({
            success: true,
            count: results.length,
            books: results
        });
    } catch (error) {
        next(error);
    }
};

const getBook = async (req, res, next) => {
    try {
        const book = await getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.json({
            success: true,
            book
        });
    } catch (error) {
        next(error);
    }
};

const addBook = async (req, res, next) => {
    try {
        const {
            title,
            author,
            isbn,
            category,
            quantity
        } = req.body;

        const bookData = {
            title,
            author,
            isbn,
            category,
            quantity: Number(quantity),
            status: Number(quantity) > 0
                ? "available"
                : "borrowed",
            createdAt: new Date()
        };

        const book = await createBook(bookData);

        res.status(201).json({
            success: true,
            message: "Book added successfully",
            book
        });
    } catch (error) {
        next(error);
    }
};

const updateBookDetails = async (req, res, next) => {
    try {
        const book = await getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const updateData = {};

        const allowedFields = [
            "title",
            "author",
            "isbn",
            "category",
            "quantity"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (updateData.quantity !== undefined) {
            updateData.quantity = Number(updateData.quantity);

            updateData.status =
                updateData.quantity > 0
                    ? "available"
                    : "borrowed";
        }

        const updatedBook = await updateBook(
            req.params.id,
            updateData
        );

        res.json({
            success: true,
            message: "Book updated successfully",
            book: updatedBook
        });
    } catch (error) {
        next(error);
    }
};

const removeBook = async (req, res, next) => {
    try {
        const book = await getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        await deleteBook(req.params.id);

        res.json({
            success: true,
            message: "Book deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBooks,
    searchBooks,
    getBook,
    addBook,
    updateBookDetails,
    removeBook
};