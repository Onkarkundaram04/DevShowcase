const mongoose = require('mongoose');

async function connect_db() {

    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log(`Successfully Connected to Mongo DB`);
    }
    catch (error) {

        console.log(`Error Connecting to DB : ${error.message}`);

        throw error;

    }
}

module.exports = connect_db;