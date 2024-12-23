const mongoose = require("mongoose")

let productschema = new mongoose.Schema({
    title : String,
    picture: String,
    description : String,
    price : Number,
    isFeatured : {type: Boolean, default: false},
    quantities: {
        small: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        large: { type: Number, default: 0 }
    },
    categoryid: String
})
let Product = mongoose.model("Product",productschema);
module.exports = Product