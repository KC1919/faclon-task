const { MongoClient } = require('mongodb');
let client;
const mongoose = require('mongoose');

exports.connectDb = async () => {
    try {

        // console.log(process.env.DB_URL);

        // const conn = await client.connect();

        const conn = await mongoose.connect(process.env.DB_URL);

        if (conn !== null) {
            client = conn.connection.client;
            // app.set('client',client);
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
