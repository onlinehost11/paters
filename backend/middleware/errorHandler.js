export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.errors
        });
    }

    if (err.name === 'MongoError') {
        return res.status(400).json({
            message: 'Database error',
            error: err.message
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}