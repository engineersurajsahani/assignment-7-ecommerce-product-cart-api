const { db } = require("../config/firebase");

const transactionsCollection = db.collection("transactions");

const createTransaction = async (transactionData) => {
    const docRef = await transactionsCollection.add(transactionData);

    return {
        id: docRef.id,
        ...transactionData
    };
};

const getTransactionById = async (id) => {
    const doc = await transactionsCollection.doc(id).get();

    if (!doc.exists) {
        return null;
    }

    return {
        id: doc.id,
        ...doc.data()
    };
};

const getAllTransactions = async () => {
    const snapshot = await transactionsCollection.get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
};

const getTransactionsByUser = async (userId) => {
    const snapshot = await transactionsCollection
        .where("userId", "==", userId)
        .get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
};

const updateTransaction = async (id, data) => {
    await transactionsCollection.doc(id).update(data);

    return getTransactionById(id);
};

module.exports = {
    createTransaction,
    getTransactionById,
    getAllTransactions,
    getTransactionsByUser,
    updateTransaction
};