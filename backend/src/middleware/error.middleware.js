function errorMiddleware(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
  });
}

module.exports = { errorMiddleware };

