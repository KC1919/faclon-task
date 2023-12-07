const User = require('../models/User');

module.exports.makeFriendRequest = async (req, res, next) => {
    try {
        const {
            username
        } = req.body;

        // get user details
        const user = await User.findOne({
            email: req.email,
        });

        // find frienduser whether it exist or not
        const frienduser = await User.findOne({
            username: username,
        });

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
            friends: {
                $elemMatch: {
                    username: username,
                },
            },
        });

        if (checkFriendUser !== null) {
            return res.status(400).json({
                message: 'Already a friend!',
                status: false,
            });
        }

        // Check if request has already been made to the frienduser

        const checkRequest = await User.findOne({
            email: req.email,
            requestSent: {
                $elemMatch: {
                    username: username,
                },
            },
        });

        if (checkRequest !== null) {
            return res.status(400).json({
                message: 'Friend request already sent!',
                status: false,
            });
        }

        // Make friend request

        // Adding friend username to the user's list of sent requests
        User.updateOne({
                email: req.email,
            }, {
                $push: {
                    requestSent: {
                        username,
                    },
                },
            }, {
                upsert: true,
            })
            .then((result) => {
                if (result.modifiedCount > 0) {
                    // Adding sender username to the frienduser's list of received requests
                    User.updateOne({
                            username: username,
                        }, {
                            $push: {
                                requestReceived: {
                                    username: user.username,
                                },
                            },
                        }, {
                            upsert: true,
                        })
                        .then((result) => {
                            if (result.modifiedCount > 0) {
                                return res.status(200).json({
                                    message: 'Friend Request Sent!',
                                    success: true,
                                });
                            } else {
                                return res.status(400).json({
                                    message: 'Failed to send friend request!',
                                    success: false,
                                });
                            }
                        })
                        .catch((err) => {
                            console.log('Failed to send friend request!', err);
                        });
                }
            })
            .catch((err) => {
                console.log('Failed to send request!!!', err);
            });
    } catch (error) {
        console.log('Failed to send request, server error!', error);
        return res.status(500).json({
            message: 'Failed to send friend request, server error!',
            success: false,
        });
    }
};

module.exports.acceptFriendRequest = async (req, res, next) => {
    try {
        const username = req.params.username;

        // get user details
        const user = await User.findOne({
            email: req.email,
        });

        // check if username exist in request user's received list
        const checkUser = await User.findOne({
            email: req.email,
            requestReceived: {
                $elemMatch: {
                    username: username,
                },
            },
        });

        // if username does not exist
        if (checkUser === null) {
            return res.status(400).json({
                message: 'Friend request not received from this user!',
                success: false,
            });
        }

        // check if user who sent the request exists
        const friendUser = await User.findOne({
            username: username,
        });

        // if user does not exist
        if (friendUser === null) {
            return res.status(400).json({
                message: 'User who sent the request does not exist!',
                success: false,
            });
        }

        // else accept the request
        // remove the request from the receiver-user list
        User.updateOne({
                email: req.email,
                requestReceived: {
                    $elemMatch: {
                        username: username,
                    },
                },
            }, {
                $pull: {
                    requestReceived: username,
                },
            })
            .then((result) => {
                if (result.modifiedCount > 0) {
                    // remove the request from sender-user list
                    User.updateOne({
                            username: username,
                            requestSent: {
                                $elemMatch: {
                                    username: user.username,
                                },
                            },
                        }, {
                            $pull: {
                                requestSent: user.username,
                            },
                        })
                        .then((result) => {
                            if (result.modifiedCount > 0) {
                                // add frienduser to the current user friend list
                                User.updateOne({
                                        email: req.email,
                                    }, {
                                        $push: {
                                            username: username,
                                        },
                                    })
                                    .then((result) => {
                                        if (result.matchedCount > 0) {
                                            // add current user in the frienduser friend list
                                            User.updateOne({
                                                    username: username,
                                                }, {
                                                    $push: {
                                                        username: user.username,
                                                    },
                                                })
                                                .then((result) => {
                                                    if (
                                                        result.modifiedCount > 0
                                                    ) {
                                                        return res
                                                            .status(200)
                                                            .json({
                                                                message: 'Friend Request Accepted',
                                                                success: true,
                                                            });
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.log(
                                                        'Failed to accept friend request, mongo error!!',
                                                        error
                                                    );
                                                    return res
                                                        .status(500)
                                                        .json({
                                                            message: 'Failed to accept request, mongo error!',
                                                            success: false,
                                                            error: error.message,
                                                        });
                                                });
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(
                                            'Failed to add current user to the frienduser friend list',
                                            error
                                        );
                                        return res.status(500).json({
                                            message: 'Failed to accept request, mongo error!',
                                            success: false,
                                            error: error.message,
                                        });
                                    })
                            }
                        }).catch((error) => {
                            console.log(
                                'Failed to add frienduser to the current user friend list',
                                error
                            );
                            return res.status(500).json({
                                message: 'Failed to accept request, mongo error!',
                                success: false,
                                error: error.message,
                            });
                        });
                }
            })
            .catch((error) => {
                console.log(
                    'Failed to remove the request from sender-user list',
                    error
                );
                return res.status(500).json({
                    message: 'Failed to accept request, mongo error!',
                    success: false,
                    error: error.message,
                });
            });
    } catch (error) {
        console.log('Failed to accept friend request, server error!', error);
        return res.status(500).json({
            message: 'Failed to accept friend request, server error!',
            success: false,
        });
    }
};

module.exports.rejectFriendRequest = async () => {
    try {} catch (error) {}
};