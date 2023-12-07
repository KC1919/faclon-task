const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

// user schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name!']
    },
    username: {
        type: String,
        required: [true, 'User must have a username!'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'User must have an email!'],
        unique: true,
        validate: [validator.isEmail, 'Please provide an valid email!']
    },
    password: {
        type: String,
        required: [true, 'User must have a password!'],
        minLength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User must provide a confirm password!'],
        minLength: 8,
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Password and Confirm Password do not match!'
        }
    },
    friends: [{
        username: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: 'pending'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// hashing the user password before saving the user to the database
userSchema.pre('save', async function (next) {

    // this works oly if the password field is modified, if not we move to the next fucntion
    if (!this.isModified('password')) return next();

    // else we hash the password
    const hashPass = await bcrypt.hash(this.password, 5);
    this.password = hashPass;
    this.passwordConfirm = undefined;
    next();
})

//Modelling the user schema into a user model 
const User = mongoose.model('User', userSchema);

module.exports = User;