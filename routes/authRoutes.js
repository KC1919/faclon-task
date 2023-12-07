const express=require('express');
const router=express.Router();

router
    .post('/login')
    .post('/signup')
    .patch('/update/:id')
    .delete('/delete/:id')

module.exports=router;
