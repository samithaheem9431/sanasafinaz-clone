const express  = require("express");
let app = express();

var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

app.use(express.static("public"));
app.set("view engine",'ejs');

app.use(express.urlencoded())

let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);

const mongoose = require("mongoose");
let connectionstring = "mongodb://127.0.0.1:27017/SanaSafinaz"
mongoose.connect(connectionstring)

.then(()=>{
    console.log(`Connected to ${connectionstring}`)
})
.catch(()=>{
    console.log("error")
})

app.get("/",(req,res)=>{
    res.render("pages/Main_Site_pages/landingPage");
})
app.get("/women",async (req,res)=>{
    let Products = require("./model/products.models");
    let product = await Products.find();
    res.render("pages/Main_Site_pages/women",{ product });
})

app.listen(5001, ()=>{ 
    console.log("Server started at location : 5000");
});