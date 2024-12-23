const express = require("express");
let router = express.Router();

let Product = require("../../model/products.models");
let Category = require("../../model/category.model");
const mongoose = require('mongoose');


router.get("/admin/products",async(req,res)=>{
    const page = parseInt(req.query.page) || 1; // Get page from query or default to 1
    const limit = 3; // Items per page
    const skip = (page - 1) * limit;
    
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    
    let products = await Product.find()
        .skip(skip)
        .limit(limit);
    
    res.render("pages/Admin_Pages/products", {
        layout: "admin-layout.ejs",
        products,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    });
})



router.get("/admin/categories",async(req,res)=>{
    let category= await Category.find()
    res.render("pages/Admin_Pages/category",{layout: "admin-layout.ejs",category});
})

router.post("/admin/products/createCategory",async (req,res)=>{
    let category= new Category(req.body);
    await category.save()
    res.redirect("/admin/categories")
 })

 router.post("/admin/products/create", async (req, res) => {
    try {
        // Check and handle undefined quantities
        const quantities = req.body.quantities || {};

        const product = new Product({
            ...req.body,
            quantities: {
                small: quantities.small || 0,
                medium: quantities.medium || 0,
                large: quantities.large || 0,
            }
        });

        product.isFeatured = Boolean(req.body.isFeatured);

        // Save product to the database
        await product.save();
        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(400).send("Bad Request: Invalid input");
    }
});


router.get("/admin/categories/delete/:id",async(req,res)=>{
    await Category.findByIdAndDelete(req.params.id)
    return res.redirect("/admin/categories")
})

router.get("/admin/categories/edit/:id",async (req,res)=>{
    let category = await Category.findById(req.params.id)
    res.render("pages/Admin_Pages/editCatetory",{layout: "admin-layout.ejs",category})
})

router.post("/admin/categories/edit/:id",async (req,res)=>{
    let category = await Category.findById(req.params.id)
    category.categoryName = req.body.categoryName
    await category.save()
    return res.redirect("/admin/categories")
})

router.get("/admin/products/edit/:id",async (req,res)=>{
    let product = await Product.findById(req.params.id)
    res.render("pages/Admin_Pages/editform",{layout: "admin-layout.ejs",product})
})

router.post("/admin/products/edit/:id", async (req, res) => {
    let product = await Product.findById(req.params.id);
    product.title = req.body.title;
    product.description = req.body.description;
    product.price = req.body.price;
    product.quantities = {
        small: req.body.quantities.small || 0,
        medium: req.body.quantities.medium || 0,
        large: req.body.quantities.large || 0
    };
    product.isFeatured = Boolean(req.body.isFeatured);
    await product.save();
    return res.redirect("/admin/products");
});


router.get("/admin/products/delete/:id",async(req,res)=>{
    await Product.findByIdAndDelete(req.params.id)
    return res.redirect("/admin/products")
})


router.get("/admin/dashboard",async (req,res)=>{
    let products = await Product.find();
    res.render("pages/Admin_Pages/dashboard",{layout: "admin-layout.ejs", products});
})

router.get("/admin/products/create",(req,res)=>{
    res.render("pages/Admin_Pages/create",{layout: "admin-layout.ejs"});
})

router.get("/admin/products/createCategory", (req,res)=>{
    res.render("pages/Admin_Pages/createCategory",{layout: "admin-layout.ejs"});
})


router.get("/admin/login", (req,res)=>{
    res.render("pages/Admin_Pages/admin-login",{layout:false});
})

module.exports = router;