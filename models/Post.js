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
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;