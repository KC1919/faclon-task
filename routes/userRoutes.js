const express = require('express');
const router = express.Router();
const verify = require('../middlewares/verifyUser');
const userController = require('../controllers/userController');

router
    .post('/sendrequest', verify, userController.makeFriendRequest)
    .post('/acceptrequest/:username', verify, userController.acceptFriendRequest)
    .post('/rejectrequest/:username', verify, userController.rejectFriendRequest)
    .patch('/update', verify, userController.updateUserDetails)
    .patch('/updatePassword', verify, userController.updateUserPassword)
    .delete('/deleteAccount/', verify, userController.deleteUserAccount);

module.exports = router;
