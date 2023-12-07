const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');
const verify = require('../middlewares/verifyUser');

router
    .post('/login', authController.login)
    .post('/signup', authController.register)
    .post('/logout', verify, authController.logout)

module.exports=router;
