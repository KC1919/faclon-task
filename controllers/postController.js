const Post = require('../models/Post');
const User = require('../models/User')
const mongoose = require('mongoose');
const { MongoError } = require('mongodb')

const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
    maxCommitTimeMS: 1000
};

//function to handle new post creation
module.exports.createPost = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        //creating new post data object
        const newPostData = {
            user: req.userId,
            title,
            description
        }

        //creating the post and saving in the database
        const newPost = await Post.create(newPostData);

        if (newPost !== null) {
            return res.status(201).json({
                message: 'Post created successfully!', success: true, status: 'success', data: {
                    newPost
                }
            })
        }
    } catch (error) {
        console.log('Failed to create post, server error!', error);
        return res.status(500).json({ message: 'Failed to create post, server error!', success: false, status: 'fail', error: error })
    }
}

//function to fetch all the posts of a user
module.exports.getAllPosts = async (req, res, next) => {
    try {
        //fetching all the posts
        const allPosts = await Post.find({ 'user': req.userId });
        // console.log(allPosts);

        if (allPosts !== null && allPosts.length === 0) {
            return res.status(200).json({
                message: 'No posts found!', success: true, status: 'success', data: {
                    allPosts
                }
            });
        }
        else {
            return res.status(200).json({
                success: true, status: 'success', data: {
                    allPosts
                }
            });
        }
    } catch (error) {
        console.log('Failed to fetch user posts, server error!', error);
        return res.status(500).json({ message: 'Failed to fetch user posts, server error!', success: false, status: 'fail', error: error });
    }
}

//fetch a single post of a user
module.exports.getPost = async (req, res, next) => {
    try {

        //extracting postId from request parameter
        const postId = req.params.postId;

        // console.log(postId);

        //fetching a single post by postId
        const post = await Post.findById({ _id: postId });

        if (post !== null) {
            return res.status(200).json({
                success: true, status: 'success', data: {
                    post
                }
            });
        }
    } catch (error) {
        console.log('Failed to fetch user post, server error!', error);
        return res.status(500).json({ message: 'Failed to fetch user post, server error!', success: false, status: 'fail', error: error });
    }
}

// fucntion to update post
module.exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const { title, description } = req.body;

        //check if title or description both are not empty
        if (title !== null && title.length != 0 && description !== null && description.length != 0) {

            //if not empty then update the post with new post data
            const updatedPost = await Post.updateOne({ _id: postId }, {
                $set: {
                    'title': title,
                    'description': description
                }
            });
            return res.status(203).json({
                message: 'Post updated!', success: true, status: 'success', data: {
                    updatedPost
                }
            });
        }
        //else return error
        else {
            return res.status(400).json({ message: 'Title and description cannot be empty!', success: false, status: 'fail' })
        }

    } catch (error) {
        console.log('Failed to update user post, server error!', error);
        return res.status(500).json({ message: 'Failed to update user post, server error!', success: false, status: 'fail', error: error });
    }
}

// function to delete post
module.exports.deletePost = async (req, res, next) => {
    try {

        //getting the postId
        const postId = req.params.postId;

        //deleting the post
        await Post.findByIdAndDelete({ _id: postId });

        return res.status(204).json({ message: 'Post deleted!', success: true, status: 'success' });
    } catch (error) {
        console.log('Failed to delete user post, server error!', error);
        return res.status(500).json({ message: 'Failed to delete user post, server error!', success: false, status: 'fail', error: error });
    }
}

module.exports.addComment = async (req, res, next) => {

    const conn = await mongoose.connect(process.env.DB_URL);
    const client = conn.connection.client;
    const session = client.startSession();

    try {

        session.startTransaction(transactionOptions);

        const { postId, comment } = req.body;

        // check if user exist or not
        // const user = await User.findOne({ 'username': username }, {}, { session });

        // if user does not exist
        // if (user === null) {
        //     return res.status(400).json({ message: 'User not found!', success: false, status: 'fail' });
        // }

        // check if post exist
        const post = await Post.findOne({ _id: postId }, {}, { session });

        // if post does not exist
        if (post === null) {
            return res.status(400).json({ message: 'Post not found!', success: false, status: 'fail' });
        }

        const commentData = {
            'user': req.username,
            'comment': comment
        }

        // add comment to the post
        const updatedPost = await Post.findOneAndUpdate({ _id: postId }, {
            $push: { 'comments': commentData }
        }, { session });

        await session.commitTransaction();
        await client.close();

        return res.status(201).json({
            'message': 'Comment added successfully!',
            succes: true,
            status: 'success',
            data: {
                updatedPost
            }
        });
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

        console.log('Failed to add comment, server error!', error);
        return res.status(500).json({
            message: 'Failed to add comment, server error!',
            success: false,
            status: 'fail'
        });
    }
}

module.exports.deleteComment = async (req, res, next) => {
    try {
        const { commentId, postId } = req.body;

        // check if the post exist
        const post = await Post.findById({ _id: postId });

        // if post does not exist
        if (post === null) {
            return res.status(400).json({
                'message': 'Post does not exist!',
                success: false,
                status: 'fail'
            });
        }

        // check if the comment exist and
        // comment being deleted was added by the logged in user
        // return an array
        let comment = post.comments.filter((el, idx) => {
            return el._id.equals(commentId) && el.user === req.username;
        })

        // extract comment from 1st index, if present
        comment = comment[0];

        // if comment does not exist
        if (comment === null || comment===undefined) {
            return res.status(400).json({
                'message': 'Comment does not exist!',
                success: false,
                status: 'fail'
            });
        }


        // delete comment from the array of post comments
        const commentUpdate = await Post.updateOne({
            _id: postId,
            'comments': {
                $elemMatch: { _id: comment._id }
            }
        }, {
            $pull: {
                'comments': { _id: comment._id }
            }
        });

        // if comment deleted successfull
        if (commentUpdate.modifiedCount > 0) {
            return res.status(204).json({
                message: 'Comment deleted successfully!',
                success: true,
                status: 'success'
            });
        }

        // if failed to delete comment
        else {
            return res.status(400).json({
                message: 'Failed to delete comment!',
                success: false,
                status: 'fail'
            });
        }

    } catch (error) {
        console.log('Failed to delete comment, server error!', error);
        return res.status(500).json({
            message: 'Failed to delete comment, server error',
            success: false,
            status: 'fail'
        });
    }
}

