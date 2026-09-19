const bcrypt = require("bcrypt");

const {
    createUser,
    getUserByEmail,
    getUserById,
    updateUser
} = require("../models/userModel");

const { generateToken } = require("../utils/jwt");

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || "student",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const user = await createUser(userData);

        const token = generateToken(user);

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: safeUser,
            token
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            message: "Login successful",
            user: safeUser,
            token
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            user: safeUser
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        if (email) {
            const existingUser = await getUserByEmail(email);

            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already in use"
                });
            }
        }

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        const updatedUser = await updateUser(
            req.user.id,
            updateData
        );

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};