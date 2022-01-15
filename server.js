const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
require("dotenv").config({ path: ".env" });

const app = express();

//Connect Database
connectDB();

// Connect to Cloudinary repository
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Setting up middleware
app.use(express.json({ extended: false })); //needed to get data in req.body
app.use(bodyParser.urlencoded({ extended: true }));

//Define routes
app.use("/api/items", require("./routes/items"));

//Serve static assets in production
if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static("client/build"));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port  ${PORT}`));
