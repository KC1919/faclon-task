const User = require('../models/User');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoError } = require('mongodb')
// const {client}=require('../config/db')
// const client=app.get(client);

// console.log(client);

const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
    maxCommitTimeMS: 1000
};

module.exports.makeFriendRequest = async (req, res, next) => {

    const conn = await mongoose.connect(process.env.DB_URL)
    const client = conn.connection.client;
    const session = client.startSession();

    try {

        session.startTransaction(transactionOptions);

        const {
            username
        } = req.body;

        // get user details
        const user = await User.findOne({
            email: req.email,
        }, null, { session });

        // find frienduser whether it exist or not
        const frienduser = await User.findOne({
            'username': username,
        }, null, { session });

        // if does not exists
        if (frienduser === null) {
            return res.status(400).json({
                message: 'User does not exist!',
                status: false,
            });
        }

        // check if frienduser is already present in user's friend list
        const checkFriendUser = await User.findOne({
            email: req.email,
            'friends': {
                $elemMatch: {
                    'username': username,
                },
            },
        }, null, { session });

        if (checkFriendUser !== null) {
            return res.status(400).json({
                message: 'Already a friend!',
                status: false,
            });
        }

        // Check if request has already been made to the frienduser

        const checkRequest = await User.findOne({
            email: req.email,
            'requestSent': {
                $elemMatch: {
                    'username': username,
                },
            },
        }, null, { session });

        if (checkRequest !== null) {
            return res.status(400).json({
                message: 'Friend request already sent!',
                status: false,
            });
        }

        // Make friend request

        // Adding friend username to the user's list of sent requests
        await User.updateOne({
            email: req.email,
        }, {
            $push: {
                'requestSent': {
                    username,
                },
            },
        }, {
            upsert: true,
        }, { session })

        // Adding sender username to the frienduser's list of received requests

        await User.updateOne({
            'username': username,
        }, {
            $push: {
                'requestReceived': {
                    username: user.username,
                },
            },
        }, {
            upsert: true,
        }, { session });

        await session.commitTransaction();
        res.status(200).json({ 'message': 'Friend request sent successfully!', success: true })

    } catch (error) {
        if (error instanceof MongoError && error.hasErrorLabel('UnknownTransactionCommitResult')) {
            // add your logic to retry or handle the error
            console.log('UnknownTransactionCommitResult');
        }

        else if (error instanceof MongoError && error.hasErrorLabel('TransientTransactionError')) {
            // add your logic to retry or handle the error
            console.log('TransientTransactionError');
        } else {
            console.log('An error occured in the transaction, performing a data rollback:' + error);
        }
        await session.abortTransaction();

        console.log('Failed to send friend request, server error!', error);
        return res.status(500).json({
            message: 'Failed to send friend request, server error!',
            success: false,
        });
    }
};

module.exports.acceptFriendRequest = async (req, res, next) => {

    const conn = await mongoose.connect(process.env.DB_URL)
    const client = conn.connection.client;
    const session = client.startSession();

    try {

        session.startTransaction(transactionOptions);

        const username = req.params.username;

        // get user details
        const user = await User.findOne({
            'email': req.email,
        }, {}, { session });

        // check if username exist in request user's received list
        const checkUser = await User.findOne({
            'email': req.email,
            'requestReceived': {
                $elemMatch: {
                    'username': username,
                },
            },
        }, {}, { session });

        // if username does not exist
        if (checkUser === null) {
            return res.status(400).json({
                message: 'Friend request not received from this user!',
                success: false,
            });
        }

        // check if user who sent the request exists
        const friendUser = await User.findOne({
            'username': username,
        }, {}, { session });

        // if user does not exist
        if (friendUser === null) {
            return res.status(400).json({
                message: 'User who sent the request does not exist!',
                success: false,
            });
        }

        // ------else accept the request------

        // remove the request from the receiver-user list
        await User.updateOne({
            'email': req.email,
            'requestReceived': {
                $elemMatch: {
                    'username': username,
                },
            },
        }, {
            $pull: {
                'requestReceived':{'username': username},
            },
        }, { session })

        // remove the request from sender-user list
        await User.updateOne({
            'username': username,
            'requestSent': {
                $elemMatch: {
                    'username': user.username,
                },
            },
        }, {
            $pull: {
                'requestSent':{'username': user.username },
            },
        }, { session })

        // add frienduser to the current user friend list
        await User.updateOne({
            'email': req.email,
        }, {
            $push: {
                'friends':{'username': username}
            },
        }, { session })

        // add current user in the frienduser friend list
        await User.updateOne({
            'username': username,
        }, {
            $push: {
                'friends':{'username': user.username},
            },
        }, { session })

        await session.commitTransaction();
        return res.status(200).json({ message: 'Friend Request Accepted', success: true });

    } catch (error) {
        if (error instanceof MongoError && error.hasErrorLabel('UnknownTransactionCommitResult')) {
            // add your logic to retry or handle the error
            console.log('UnknownTransactionCommitResult');
        }

        else if (error instanceof MongoError && error.hasErrorLabel('TransientTransactionError')) {
            // add your logic to retry or handle the error
            console.log('TransientTransactionError');
        } else {
            console.log('An error occured in the transaction, performing a data rollback:' + error);
        }
        await session.abortTransaction();

        console.log('Failed to accept friend request, server error!', error);
        return res.status(500).json({
            message: 'Failed to accept friend request, server error!',
            success: false,
        });
    }
};

module.exports.rejectFriendRequest = async () => {
    try { } catch (error) { }
};