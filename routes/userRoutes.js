const express=require('express');
const router=express.Router();

router
    .patch('/update/:id')
    .delete('/delete/:id')

module.exports=router;
