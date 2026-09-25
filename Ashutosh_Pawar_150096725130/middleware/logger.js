// Logs every request: time, method, path, status code and how long it took.
function logger(request, response, next) {
  const start = Date.now();

  // "finish" fires once the response is sent, so the status code is known.
  response.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.originalUrl} ${response.statusCode} - ${ms}ms`,
    );
  });

  next();
}

module.exports = logger;
