const { db } = require("../config/firebase");

const usersCollection = db.collection("users");

const createUser = async (userData) => {
    const docRef = await usersCollection.add(userData);

    return {
        id: docRef.id,
        ...userData
    };
};

const getUserById = async (id) => {
    const doc = await usersCollection.doc(id).get();

    if (!doc.exists) {
        return null;
    }

    return {
        id: doc.id,
        ...doc.data()
    };
};

const getUserByEmail = async (email) => {
    const snapshot = await usersCollection
        .where("email", "==", email)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];

    return {
        id: doc.id,
        ...doc.data()
    };
};

const getAllUsers = async () => {
    const snapshot = await usersCollection.get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
};

const updateUser = async (id, data) => {
    await usersCollection.doc(id).update({
        ...data,
        updatedAt: new Date()
    });

    return getUserById(id);
};

const deleteUser = async (id) => {
    await usersCollection.doc(id).delete();
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser
};