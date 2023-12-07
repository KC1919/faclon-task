const User = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.login = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        const user = await Student.findOne({
            "email": email
        });

        if (user === null) {
            return res.status(400).json({
                message: "User does not exist, please register",
                success: false
            });
        }

        if (bcrypt.compareSync(password, user.password) === true) {

            const token = jwt.sign({
                "userId": user._id,
                "email": email
            }, process.env.SECRET_KEY);

            res.cookie('secret', token, {
                maxAge: 86400000,
                httpOnly: false
            });

            return res.status(200).json({
                message: "User Logged in successfully",
                success: true
            });
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

module.exports.register = async (req, res) => {
    try {

        const user = await Student.findOne({
            email: req.body.email
        });

        if (user !== null) {
            console.log("Student already exists");
            return res.status(400).json({
                message: "Student already exists",
                success: false
            });
        }

        const hashPass = bcrypt.hashSync(req.body.password, 5);

        req.body.password = hashPass;

        const newUser = await Student.create(req.body);

        if (newUser != undefined) {
            return res.status(200).json({
                message: "Student Registered successfully",
                success: true
            });
        } else {
            return res.status(400).json({
                message: "Failed to register user",
                success: false
            });
        }


    } catch (error) {
        console.log("Failed to register student, internal server error", error);
        return res.status(500).json({
            message: "Failed to register student, internal server error",
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