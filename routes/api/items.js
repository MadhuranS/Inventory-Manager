const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const Item = require("../../models/Item");

// @route POST api/items
// @desc Create an item
router.post(
    "/",
    [check("name", "Name is required").not().isEmpty()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const newItem = new Item({
                name: req.body.name,
                description: req.body.description,
            });

            const item = await newItem.save();
            res.json(item);
        } catch (err) {
            console.error("Server error", err.message);
            res.status(500).send("Internal server error");
        }
    }
);

// @route GET api/items
// @desc Route to fetch all items
router.get("/", async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        console.error("Server error", err.message);
        res.status(500).send("Internal server error");
    }
});

// @route PATCH api/items/:id
// @desc Update an item
router.patch("/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ msg: "Item not found" });
        }

        await item.updateOne({
            name: req.body.name,
            description: req.body.description,
        });

        res.json({msg: "Updated document", updates: req.body});
    } catch (err) {
        console.error("Server error", err.message);
        res.status(500).send("Internal server error");
    }
});

// @route DELETE api/items/:id
// @desc Delete an item
router.delete("/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ msg: "Item not found" });
        }

        await item.remove();
        res.json({ msg: "Item removed" });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Item not found" });
        }
        res.status(500).send("Server error");
    }
});

module.exports = router;