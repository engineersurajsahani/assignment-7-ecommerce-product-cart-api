require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const logger = require("./src/middleware/logger");
const rateLimiter = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/authRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const userRoutes = require("./src/routes/userRoutes");

require("./src/config/firebase");

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Request logger
app.use(logger);

// Rate limiter
app.use(rateLimiter);

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Library Management API is running"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

// Swagger documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});