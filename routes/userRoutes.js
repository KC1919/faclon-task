const express = require('express');
const router = express.Router();
const verify = require('../middlewares/verifyUser');
const userController = require('../controllers/userController');

router
    .post('/sendrequest', verify, userController.makeFriendRequest)
    .post('/acceptrequest/:username', verify, userController.acceptFriendRequest)
    .patch('/update', verify)
    .delete('/delete/:id', verify);

module.exports = router;
