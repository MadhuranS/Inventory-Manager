const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const Item = require("../models/Item");
const upload = require("../helpers/upload");
const { uploadImage, deleteImage } = require("../services/image");
const logger = require("../logs/logger")

// @route POST api/items
// @desc Create an item
router.post(
    "/",
    upload.single("image"),
    [
        check(
            "name",
            "Name must exist and be a string of at least length 1"
        ).notEmpty(),
        check(
            "description",
            "If description is passed, it must be a string of at least length 1"
        ).custom((value, { req }) => {
            if (value != null && value.length < 1) {
                return false;
            }
            return true;
        }),
        check(
            "quantity",
            "quantity must exist and be an integer value"
        ).isInt(),
        check(
            "quantity",
            "You must submit a quantity property with a positive integer value"
        ).custom((value, { req }) => {
            if (value < 0) {
                return false;
            }
            return true;
        }),
    ],
    async (req, res) => {
        try {
            //validate for correct inputs
            logger("Info", {message: "Validating request body"})
            let errors = validationResult(req).array();
            if (
                !req.hasOwnProperty("file") ||
                !req.file.mimetype.startsWith("image/")
            ) {
                errors.push({
                    msg: "You must submit a valid image file",
                    param: "image",
                });
            }
            if (errors.length > 0) {
                logger("Error", {error: "incorrect request body, middleware validation failed"})
                return res.status(400).json({ errors: errors })
            }

            //upload image to cloudinary and check if upload is successful
            logger("Info", {message: "Uploading image to cloudinary"})
            const uploadResponse = await uploadImage(req.file);
            if (uploadResponse.errors.length > 0) {
                logger("Error", {error: "Cloudinary image upload failed"})
                return res.status(502).json({ errors: uploadResponse.errors });
            }

            //Save request data to new item
            logger("Info", {message: "Saving new item to mongoDB"})
            const newItem = new Item({
                name: req.body.name,
                description: req.body.description,
                thumbnail: {
                    url: uploadResponse.data.url,
                    public_id: uploadResponse.data.public_id,
                },
                quantity: req.body.quantity,
            });
            const item = await newItem.save();
            logger("Create", {id: item._id})
            //respond with json item data
            res.json(item);
        } catch (err) {
            //respond with internal server error
            logger("Error", {error: err.message})
            res.status(500).send("Internal server error");
        }
    }
);

// @route GET api/items
// @desc Route to fetch all items
router.get("/", async (req, res) => {
    try {
        //get all items from mongodb
        logger("Info", {message: "Retrieving all items"})
        const items = await Item.find();

        //respond with items
        logger("Read", {})
        res.json(items);
    } catch (err) {
        logger("Error", {error: err.message})
        res.status(500).send("Internal server error");
    }
});

// @route GET api/items/:id
// @desc Route to fetch one item
router.get("/:id", async (req, res) => {
    try {
        //find item with given id
        logger("Info", {message: "Finding requested item"})
        const item = await Item.findById(req.params.id);
        if (!item) {
            logger("Error", {error: "Item not found"})
            return res.status(404).json({ msg: "Item not found" });
        }

        //respond with item
        logger("Read", {id: item._id})
        res.json(item);
    } catch (err) {
        logger("Error", {error: err.message})
        res.status(500).send("Internal server error");
    }
});

// @route PATCH api/items/:id
// @desc Update an item
router.patch(
    "/:id",
    upload.single("image"),
    [
        check(
            "name",
            "If name is passed, it must be a string of at least length 1"
        ).custom((value, { req }) => {
            if (value != null && value.length < 1) {
                return false;
            }
            return true;
        }),
        check(
            "description",
            "If description is passed, it must be a string of at least length 1"
        ).custom((value, { req }) => {
            if (value != null && value.length < 1) {
                return false;
            }
            return true;
        }),
        check(
            "quantity",
            "If quantity is passed, it must be a positive integer"
        ).custom((value, { req }) => {
            if (value != null && (value.length < 1 || isNaN(value) || value < 0)) {
                return false;
            }
            return true;
        }),
    ],
    async (req, res) => {
        try {
            //validate for correct input values
            logger("Info", {message: "Validating request body"})
            let errors = validationResult(req).array();
            if (
                req.hasOwnProperty("file") &&
                !req.file.mimetype.startsWith("image/")
            ) {
                errors.push({
                    msg: "If an image is passed, it must be an image file ty[e",
                    param: "file",
                });
            }
            if (errors.length > 0) {
                logger("Error", {error: "Invalid request body"})
                return res.status(400).json({ errors: errors });
            }

            //find item with given id
            logger("Info", {message: "Finding requested item"})
            const item = await Item.findById(req.params.id);
            if (!item) {
                logger("Error", {error: "Item not found"})
                return res.status(404).json({ msg: "Item not found" });
            }

            logger("Info", {message: "Updating all fields"})
            //replace text properties with updated values
            for (const element in req.body) {
                item[element] = req.body[element];
            }

            //if file is passed, replace thumbnail
            if (req.hasOwnProperty("file")) {
                //delete old image from cloudinary
                logger("Info", {message: "Deleting old image"})
                if (item.thumbnail && item.thumbnail.public_id) {
                    const deleteErrors = await deleteImage(
                        item.thumbnail.public_id
                    );
                    if (deleteErrors.length > 0) {
                        logger("Error", {error: "Cloudinary image failed to delete"})
                        return res.status(502).json({ errors: deleteErrors });
                    }
                }

                //upload new image to cloudinary
                logger("Info", {message: "Uploading new image"})
                const uploadResponse = await uploadImage(req.file);
                if (uploadResponse.errors.length > 0) {
                    logger("Error", {error: "Cloudinary image upload failed"})
                    return res
                        .status(502)
                        .json({ errors: uploadResponse.errors });
                }
                item["thumbnail"]["url"] = uploadResponse.data.url;
                item["thumbnail"]["public_id"] = uploadResponse.data.public_id;
            } 

            //save and return updated item
            logger("Info", {message: "Saving item to mongoDB"})
            await item.save()
            logger("Update", {id: item._id})
            res.json(item);
        } catch (err) {
            //return error
            logger("Error", {error: err.message})
            res.status(500).send("Internal server error");
        }
    }
);

// @route DELETE api/items/:id
// @desc Delete an item
router.delete("/:id", async (req, res) => {
    try {
        //check if item exists with that id
        logger("Info", {message: "Find item to delete"})
        const item = await Item.findById(req.params.id);
        if (!item) {
            logger("Error", {error: "Item not found"})
            return res.status(404).json({ msg: "Item not found" });
        }

        //delete image from cloudinary
        if (item.thumbnail && item.thumbnail.public_id) {
            logger("Info", {message: "Deleting image from cloudinary"})
            const deleteErrors = await deleteImage(item.thumbnail.public_id);
            if (deleteErrors.length > 0) {
                logger("Error", {error: "Cloudinary image delete failed"})
                return res.status(502).json({ errors: deleteErrors });
            }
        }
        logger("Info", {message: "Saving delete in mongodb"})
        //delete item from mongodb
        await item.remove();
        logger("Delete", {id: item._id})

        //send successful response
        res.json({ msg: "Item removed" });
    } catch (err) {
        //respond with error
        logger("Error", {error: err.message})
        res.status(500).send("Server error");
    }
});

module.exports = router;
