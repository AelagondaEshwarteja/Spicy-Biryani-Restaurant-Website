// Runs when no route matched the URL
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Some addresses only accept one method, e.g. PATCH to change an order's status.
// Opening them in the browser sends GET, so instead of a confusing "Route not found"
// we answer 405 (Method Not Allowed) and explain how to use them.
function onlyAllow(method, hint) {
  return (req, res) => {
    res.set('Allow', method);
    res.status(405).json({
      message: `This address only accepts ${method} requests, so it can't be opened in the browser. ${hint}`,
    });
  };
}

// One place that turns every error into a clean JSON response.
// Controllers just call next(error) and this function does the rest.
function errorHandler(err, req, res, next) {
  let statusCode = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Something went wrong';

  // Wrong MongoDB id format, e.g. /api/menu/abc
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Item not found';
  }

  // Schema rules failed, e.g. a required field is missing
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Unique field already exists, e.g. same menu item name
  if (err.code === 11000) {
    statusCode = 400;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  }

  // Body is not valid JSON
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    // Show the stack trace only while developing
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler, onlyAllow };
