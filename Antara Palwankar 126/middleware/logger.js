/**
 * Custom request logger middleware
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;
  
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${method} ${originalUrl} -> Status: ${res.statusCode} (${duration}ms) - IP: ${ip}`);
  });

  next();
};

module.exports = logger;
