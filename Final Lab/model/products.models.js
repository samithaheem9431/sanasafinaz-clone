const mongoose = require("mongoose")

let productschema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true  // This ensures consistent ID format
    },
    title: String,
    source: String,
    description: String,
    picture: String,
    price: Number,
    isFeatured: { type: Boolean, default: false },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

let Product = mongoose.model("Product", productschema);
module.exports = Product;