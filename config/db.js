const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//Attempt to connect to mongodb database, if error, exit process with failure
const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
