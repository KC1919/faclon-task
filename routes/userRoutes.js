const express = require('express');
const router = express.Router();
const verify = require('../middlewares/verifyUser');
const userController = require('../controllers/userController');

router
    .post('/request', verify, userController.makeFriendRequest)
    .patch('/update', verify)
    .delete('/delete/:id', verify);

module.exports = router;
