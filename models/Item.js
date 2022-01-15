const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    thumbnail: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            reuired: true
        }
    },
    quantity: {
        type: Number,
        required: true
        

    }
});

module.exports = Item = mongoose.model("item", ItemSchema);