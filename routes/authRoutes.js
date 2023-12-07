const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');

router
    .post('/login', authController.login)
    .post('/signup', authController.register)
    .patch('/update/:id')
    .delete('/delete/:id')

module.exports=router;
