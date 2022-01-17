const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const Item = require("../models/Item");
const upload = require("../helpers/upload");
const { uploadImage, deleteImage } = require("../services/image");

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
            "Description must exist and be a string of at least length 1"
        ).notEmpty(),
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
            if (errors.length > 0)
                return res.status(400).json({ errors: errors });

            //upload image to cloudinary and check if upload is successful
            const uploadResponse = await uploadImage(req.file);
            if (uploadResponse.errors.length > 0)
                return res.status(502).json({ errors: uploadResponse.errors });

            //Save request data to new item
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

            //respond with json item data
            res.json(item);
        } catch (err) {
            //respond with internal server error
            console.error("Server error", err.message);
            res.status(500).send("Internal server error");
        }
    }
);

// @route GET api/items
// @desc Route to fetch all items
router.get("/", async (req, res) => {
    try {
        //get all items from mongodb
        const items = await Item.find();

        //respond with items
        res.json(items);
    } catch (err) {
        console.error("Server error", err.message);
        res.status(500).send("Internal server error");
    }
});

// @route GET api/items/:id
// @desc Route to fetch one item
router.get("/:id", async (req, res) => {
    try {
        //find item with given id
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "Item not found" });
        }

        //respond with item
        res.json(item);
    } catch (err) {
        console.error("Server error", err.message);
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
            if (value != null && (isNaN(value) || value < 0)) {
                return false;
            }
            return true;
        }),
    ],
    async (req, res) => {
        try {
            //validate for correct input values
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
            if (errors.length > 0)
                return res.status(400).json({ errors: errors });

            //find item with given id
            const item = await Item.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ msg: "Item not found" });
            }

            //if file is passed, update the file value, otherwise ignore
            let updatedItem = {};
            if (req.hasOwnProperty("file")) {
                //delete old image from cloudinary
                if (item.thumbnail && item.thumbnail.public_id) {
                    const deleteErrors = await deleteImage(
                        item.thumbnail.public_id
                    );
                    if (deleteErrors.length > 0) {
                        return res.status(502).json({ errors: deleteErrors });
                    }
                }

                //upload new image to cloudinary
                const uploadResponse = await uploadImage(req.file);
                if (uploadResponse.errors.length > 0) {
                    return res
                        .status(502)
                        .json({ errors: uploadResponse.errors });
                }
                updatedItem = {
                    name: req.body.name,
                    description: req.body.description,
                    thumbnail: {
                        url: uploadResponse.data.url,
                        public_id: uploadResponse.data.public_id,
                    },
                    quantity: req.body.quantity,
                };
            } else {
                updatedItem = {
                    name: req.body.name,
                    description: req.body.description,
                    quantity: req.body.quantity,
                };
            }

            //update item on mongodb
            await item.updateOne(updatedItem);

            //return json response
            res.json({
                msg: "Updated document",
                bodyUpdates: req.body,
                fileUpdates: req.file ? true : false,
            });
        } catch (err) {
            //return error
            console.error(err.message);
            res.status(500).send("Internal server error");
        }
    }
);

// @route DELETE api/items/:id
// @desc Delete an item
router.delete("/:id", async (req, res) => {
    try {
        //check if item exists with that id
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "Item not found" });
        }

        //delete image from cloudinary
        if (item.thumbnail && item.thumbnail.public_id) {
            const deleteErrors = await deleteImage(item.thumbnail.public_id);
            if (deleteErrors.length > 0) {
                return res.status(502).json({ errors: deleteErrors });
            }
        }

        //delete item from mongodb
        await item.remove();

        //send successful response
        res.json({ msg: "Item removed" });
    } catch (err) {
        //respond with error
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Item not found" });
        }
        res.status(500).send("Server error");
    }
});

module.exports = router;
