const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        minLength: 5
    },
    description: {
        type: String,
        required: true,
        minLength: 10
    },
    comments: [
        {
            user: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;