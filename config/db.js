const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const conn=await mongoose.connect(process.env.DB_URL)

        if(conn!==null) console.log('Connected to database');
    
    } catch (error) {
        console.log('Failed to connect to database!', error);
    }
}

module.exports = connectDb;