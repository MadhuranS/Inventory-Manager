const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit')
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
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
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	max: 500, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
// Apply the rate limiting middleware to all requests
app.use(limiter)

//Define routes
app.use("/api/items", require("./routes/items"));
const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "Shopify developer challenge - inventory manager",
        description:
          "Documentation for inventory manager application",
        contact: {
          name: "Madhu Sivapragasam",
        },
      },
      definitions: {
        Item: {
          type: "object",
          properties: {
            name: {
              required: true,
              type: "string",
            },
            description: {
              type: "string",
            },
            thumbnail: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        required: true
                    },
                    public_id: {
                        type: "string",
                        required: true
                    }
                }
              },
            quantity: {
              required: true,
              type: "integer",
              format: "int64",
            },
          },
        },
      },
    },
    apis: ["./routes/items.js"],
  };
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
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
