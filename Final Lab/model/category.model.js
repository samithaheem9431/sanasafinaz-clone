const mongoose = require("mongoose")

let Categoryschema = new mongoose.Schema({
    categoryName : String,
})

let Category = mongoose.model("Category",Categoryschema);
module.exports = Category