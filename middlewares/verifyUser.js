const jwt = require('jsonwebtoken');

// function to verify JWT token with every request to the protected routes
const verify = async (req, res, next) => {
    try {
        const token = req.cookies['secret'];
        const payload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = payload.userId;
        req.email = payload.email;

        next();
    } catch (error) {
        console.log("Failed to verify user. Please login!", error);
        res.status(500).json({
            message: 'Failed to verify user, server error!',
            status: false,
            error: error
        })
    }
}

module.exports=verify;