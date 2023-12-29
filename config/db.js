const { MongoClient } = require('mongodb');
let client;
const mongoose = require('mongoose');

exports.connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL);

        if (conn !== null) {
            client = conn.connection.client;
            console.log('Connected to database');
            return client;
        }
        else {
            console.log("Failed to connect to database!");
        }

    } catch (error) {
        console.log('Failed to connect to database!', error);
    }
}
