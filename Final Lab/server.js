const express  = require("express");
const cookieParser = require('cookie-parser');
const cartRouter = require('./routes/cart.router');
const wishlistRouter = require('./routes/wishlist.router');
const userRouter = require('./routes/user.router');
let app = express();

var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

app.use(express.static("public"));
app.use(express.static("uploads"))

app.set("view engine",'ejs');

app.use(express.urlencoded())

app.use(cookieParser());
app.use(express.json());

let productsRouter = require("./routes/admin/products.router");
app.use(productsRouter);

const mongoose = require("mongoose");
let connectionstring =  "mongodb://127.0.0.1:27017/Sana-Safinaz"
mongoose.connect(connectionstring)

.then(()=>{
    console.log(`Connected to ${connectionstring} `)
})
.catch(()=>{
    console.log("error")
})

app.get("/",(req,res)=>{
    res.render("pages/Main_Site_pages/landingPage");
})

app.get("/secondpage",async(req,res)=>{
    let Products =require("./model/products.models")
    let product = await Products.find();
    res.render("pages/Main_Site_pages/secondpage",{product});
})

app.use(cartRouter);
app.use(wishlistRouter);
app.use(userRouter);

app.listen(5000, ()=>{
    console.log("Server started at location : 5000");
});