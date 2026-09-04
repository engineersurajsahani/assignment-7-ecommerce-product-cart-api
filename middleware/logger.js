const logger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = logger;
