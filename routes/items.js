const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const Item = require("../models/Item");
const upload = require("../helpers/upload");
const { uploadImage, deleteImage } = require("../services/image");
const logger = require("../logs/logger")

/**
 * Posts a new inventory item to the database
 * @param {FormData} item - Multipart object with item properties and image
 *
 * @return {Object} newItem - The new item
 *
 *
 * @swagger
 * /api/items:
 *  post:
 *    tags: ["Items"]
 *    description: Given item properties and an image, the server will post a new inventory item to the server
 *    summary: Post a new inventory item
 *    consumes:
 *    - "multipart/form-data"
 *    produces:
 *    - "application.json"
 *    parameters:
 *    - in: "req"
 *      name: "Form data"
 *      required: true
 *      default: {"name": "something", "description": "something2", "image": "image type file", "quantity": 0}
 *      schema:
 *        $ref: "#/definitions/Item"
 *    responses:
 *      '200':
 *        description: Sucessfully added new inventory item
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/definitions/Item"
 *      '400':
 *        description: Request body missing fields or invalid values
 *      '502':
 *        description: Failed to upload image
 *      '500':
 *          description: internal server error
 *
 */
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

/**
 *
 * GET all stored items
 *
 * @return {[Object]} items - Array with all items stored as objects
 *
 * @swagger
 * /api/items:
 *  get:
 *    description: Get all items
 *    summary: Get all items
 *    tags: ["Items"]
 *    responses:
 *      '200':
 *        description: A successful response
 *      '500':
 *        description: Internal server error
 */
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

/**
 *
 * GET item at specified id
 *
 * @return {Object} item - Item object 
 *
 * @swagger
 * /api/items/:id:
 *  get:
 *    description: Get item at specified id
 *    summary: Get an item
 *    tags: ["Items"]
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: Item is not found
 *      '500':
 *        description: Internal server error
 */
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

/**
 * Patches an inventory item with updated fields
 * @param {FormData} item - Multipart object with item properties and image
 *
 * @return {Object} updatedItem - The updated item
 *
 *
 * @swagger
 * /api/items/:id:
 *  patch:
 *    tags: ["Items"]
 *    description: Given item properties, item and an image, the server will update the item at that id with the new properties
 *    summary: Updates new inventory item
 *    consumes:
 *    - "multipart/form-data"
 *    produces:
 *    - "application.json"
 *    parameters:
 *    - in: "req"
 *      name: "Form data"
 *      required: false
 *      default: {"name": "something", "description": "something2", "image": "image type file", "quantity": 0}
 *      schema:
 *        $ref: "#/definitions/Item"
 *    responses:
 *      '200':
 *        description: Sucessfully added new inventory item
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/definitions/Item"
 *      '400':
 *        description: Request body missing fields or invalid values
 *      '404':
 *        description: Item not found
 *      '502':
 *        description: Failed to upload image or delete image
 *      '500':
 *          description: internal server error
 *
 */
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

/**
 * Deletes an item based using the passed id
 *
 * @return {Object} Object containing message the item is deleted
 *
 *
 * @swagger
 * /api/items/{id}:
 *  delete:
 *    tags: ['Items']
 *    description: Delete an item by using a specified id
 *    summary: Delete an item
 *    produces:
 *      "application/json"
 *    parameters:
 *    - in: "path"
 *      name: "id"
 *      description: "**ID** (unique identifier) of the inventory item"
 *      required: true
 *    responses:
 *      '200':
 *        description: Sucessfully deleted inventory item with `{id}`
 *      '404':
 *        description: Invalid request URL
 *      '502':
 *        description: Failed to delete image
 *      '500':
 *        description: Internal server error
 *
 */
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
