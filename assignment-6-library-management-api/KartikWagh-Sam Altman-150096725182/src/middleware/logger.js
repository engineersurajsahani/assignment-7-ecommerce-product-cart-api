const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();

    const user = req.user
        ? req.user.email
        : "Guest";

    console.log(
        `[${timestamp}] ${req.method} ${req.originalUrl} User: ${user}`
    );

    next();
};

module.exports = logger;