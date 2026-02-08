const errorHandler = (err, req, res, next) => {
    // Log the error
    console.error(err.stack || err.message);

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Send JSON response
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;