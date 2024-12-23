const express  = require("express");
let app = express();

var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use('/uploads', express.static('uploads'));
app.set("view engine",'ejs');

app.use(express.urlencoded())
app.use(express.json());

const session = require('express-session');
const cookieParser = require('cookie-parser');
let Products = require("./model/products.models");
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 15000 // 15 seconds in milliseconds
    },
    unset: 'destroy'
}));

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
// app.get("/women",async (req,res)=>{
//     let Products = require("./model/products.models");
//     let product = await Products.find();
//     res.render("pages/Main_Site_pages/women",{ product });
// })

// app.get("/Stiched",async (req,res)=>{
//     res.render("pages/Main_Site_pages/Stiched");
// })

app.get("/:Category", async (req, res) => {
    try {
        let products = await Products.find({ categoryid: req.params.Category });
        res.render("pages/Main_Site_pages/categorypages", { product: products });
    } catch (error) {
        console.error("Error fetching category products:", error);
        res.status(500).send("Error loading products");
}
});

app.listen(5000, ()=>{ 
    console.log("Server started at location : 5000");
});