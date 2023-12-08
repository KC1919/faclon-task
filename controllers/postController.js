const Post = require('../models/Post');

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

