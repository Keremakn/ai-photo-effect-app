function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500
    ? "Something went wrong."
    : error.message || "Something went wrong.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { details: error.details } : {}),
  });
}

module.exports = errorMiddleware;
