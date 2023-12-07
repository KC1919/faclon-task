const jwt = require('jsonwebtoken');

const verify = async (req, res, next) => {
    try {
        const token = req.cookies['secret'];
        const payload = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = payload.userId;
        req.email = payload.email;

        next();
    } catch (error) {
        console.log("Failed to verify user!", error);
        res.status(500).json({
            message: 'Failed to verify user, server error!',
            status: false,
            error: error.message
        })
    }
}

module.exports=verify;