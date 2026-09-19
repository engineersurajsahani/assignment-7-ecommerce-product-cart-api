const { db } = require("../config/firebase");

const booksCollection = db.collection("books");

const createBook = async (bookData) => {
    const docRef = await booksCollection.add(bookData);

    return {
        id: docRef.id,
        ...bookData
    };
};

const getBookById = async (id) => {
    const doc = await booksCollection.doc(id).get();

    if (!doc.exists) {
        return null;
    }

    return {
        id: doc.id,
        ...doc.data()
    };
};

const getAllBooks = async () => {
    const snapshot = await booksCollection.get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
};

const updateBook = async (id, data) => {
    await booksCollection.doc(id).update(data);

    return getBookById(id);
};

const deleteBook = async (id) => {
    await booksCollection.doc(id).delete();
};

module.exports = {
    createBook,
    getBookById,
    getAllBooks,
    updateBook,
    deleteBook
};