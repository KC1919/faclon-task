const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signToken = async (payload) => {
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY)
    return token;
}

const createSendToken = async (user, statusCode, res) => {

    const token = await signToken({userId:user._id, email:user.email});
    const cookieOptions = {
        maxAge: Date.now() + 24 * 60 * 60 * 1000,
        httpOnly: false
    }

    res.cookie('secret', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    })
}

module.exports.login = async (req, res, next) => {
    try {

        const {
            email,
            password
        } = req.body;

        // Checking if the user exist
        const user = await User.findOne({
            "email": email
        });

        // if user not exist
        if (user === null) {
            return res.status(400).json({
                message: "User does not exist, please register",
                success: false
            });
        }

        // checking if the user provided password matches the saved password in db
        const checkPassword = await user.checkPassword(password, user.password);

        // if password is correct, we return a JWT token back to the user
        if (checkPassword === true) {
            createSendToken(user, 200, res);
        } else {
            return res.status(401).json({
                message: "Authentication failed!",
                success: false
            });
        }

    } catch (error) {
        console.log("Failed to login user,internal server error", error);
        res.status(500).json({
            message: "Failed to login user, internal server error",
            success: false,
            error: error.message
        });
    }
}

module.exports.register = async (req, res, next) => {
    try {

        // checking if user with this email already exist
        const user = await User.findOne({
            email: req.body.email
        });

        // if does email exists
        if (user !== null) {
            console.log("User already exists");
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }

        // else, we create a new user with the provided user details
        const newUser = await User.create(req.body);

        // we check if the user is created successfully
        if (newUser != undefined) {
            // we generate a JWT token
            const token = await signToken({ userId: newUser._id, email: newUser.email })

            // we make password as undefined so that it is not visible in the user data
            // sent back to the client side
            newUser.password = undefined;

            return res.status(200).json({
                message: "User Registered successfully",
                success: true,
                token,
                data: {
                    newUser
                }
            });
        } else {
            return res.status(400).json({
                message: "Failed to register user",
                success: false
            });
        }
    } catch (error) {
        console.log("Failed to register User, internal server error", error);
        return res.status(500).json({
            message: "Failed to register User, internal server error",
            success: false,
            error: error.message
        });
    }
}

module.exports.logout = (req, res) => {
    try {
        res.cookie('secret', {
            maxAge: Date.now()
        });

        return res.status(200).json({
            message: "Logged out successfully!",
            success: true
        });
    } catch (error) {
        console.log("Failed to logout, server error", error);
        return res.status(500).json({
            message: "Failed to logout, server error",
            success: false,
            error: error.message
        });
    }
}