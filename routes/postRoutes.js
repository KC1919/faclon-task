const express = require('express');
const verify = require('../middlewares/verifyUser');
const router = express.Router();
const postController=require('../controllers/postController');

router
    .get('/', verify, postController.getAllPosts)
    .get('/:postId', verify, postController.getPost)
    .post('/createPost', verify, postController.createPost)
    .patch('/update/:postId', verify, postController.updatePost)
    .delete('/delete/:postId', verify, postController.deletePost)

module.exports = router;