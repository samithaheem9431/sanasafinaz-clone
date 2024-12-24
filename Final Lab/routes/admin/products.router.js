const mongoose = require("mongoose")

const express = require("express");
let router = express.Router();
let multer=require("multer");

const bcrypt = require("bcrypt");
const Admin = require("../../model/login.model");

let Product = require("../../model/products.models");
let Category = require("../../model/category.model");
// multer
const storage = multer.diskStorage({
    destination: function(req , file , cb){
        cb(null,"./uploads")
    },
    filename: function(req , file , cb){
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });

//dashboard
router.get("/admin/dashboard", async (req, res) => {
    try {
        const products = await Product.find();
        const Order = require("../../model/order.model");
        
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Items per page
        const skip = (page - 1) * limit;
        
        // Fetch complete order data
        const orders = await Order.find()
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        // Enhanced order sanitization
        const sanitizedOrders = orders.map(order => {
            // Calculate subtotal from items first
            const subtotal = (order.items || []).reduce((sum, item) => 
                sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
            const shippingCharge = order.shippingCharge || 190;
            const orderTotal = subtotal + shippingCharge; // Calculate total by adding shipping to subtotal

            return {
                _id: order._id,
                total: orderTotal,
                subtotal: subtotal, // Add subtotal explicitly
                shippingCharge: shippingCharge,
                orderDate: order.orderDate || new Date(),
                status: ['Pending', 'Completed', 'Cancelled'].includes(order.status) ? order.status : 'Pending',
                shippingAddress: {
                    name: order.shippingAddress?.name || 'Customer',
                    address: order.shippingAddress?.address || 'N/A',
                    city: order.shippingAddress?.city || 'N/A',
                    phone: order.shippingAddress?.phone || 'N/A'
                },
                items: (order.items || []).map(item => ({
                    productId: item.productId || '',
                    title: item.title || 'Product',
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1
                }))
            };
        });

        // Calculate revenue including recalculated totals
        const totalRevenue = sanitizedOrders.reduce((sum, order) => sum + order.total, 0);
        
        const completedOrders = await Order.countDocuments({ status: 'Completed' });
        const completedPercentage = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

        res.render("pages/Admin_Pages/dashboard", {
            layout: "admin-layout.ejs",
            products,
            orders: sanitizedOrders,
            pagination: {
                page,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            stats: {
                totalRevenue,
                totalOrders,
                completedPercentage
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).send("Error loading dashboard");
    }
});
//analytics
router.get("/admin/analytics",(req,res)=>{
    res.render("pages/Admin_Pages/analytics",{layout: "admin-layout.ejs"});
})

// for products 
    



router.get("/admin/products", async (req, res) => {
    try {
        const sort = req.query.sort === "desc" ? -1 : 1;
        const categoryId = req.query.category;
        const search = req.query.search;

        // Build query
        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }
        if (search) {
            // Make search more precise by using word boundaries
            const searchRegex = new RegExp(`\\b${search}\\b`, 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        // Fetch products with filter, search and sort
        let products = await Product.find(query)
            .populate('category')
            .sort({ price: sort });

        // Fetch categories for the dropdown
        const categories = await Category.find();

        // Ensure each product has an ID
        products = products.map(product => {
            const productObj = product.toObject();
            productObj._id = productObj._id || product.title;
            return productObj;
        });

        res.render("pages/Admin_Pages/products", { 
            layout: "admin-layout.ejs", 
            products,
            categories,
            currentCategory: categoryId,
            currentSort: req.query.sort,
            search: search
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching products");
    }
});

/*router.get("/admin/products",async(req,res)=>{
    let products = await Product.find()
    res.render("pages/Admin_Pages/products",{layout: "admin-layout.ejs",products});
})
*/
router.get("/admin/products/create", async (req, res) => {
    try {
        // Fetch all categories
        const categories = await Category.find();
        res.render("pages/Admin_Pages/create", {
            layout: "admin-layout.ejs",
            categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send("Error loading create form");
    }
});

router.post("/admin/products/create", upload.single("file"), async (req, res) => {
    try {
        // Create new product with mongoose ObjectId
        let product = new Product({
            _id: new mongoose.Types.ObjectId(),
            ...req.body
        });

        if (req.file) {
            product.picture = req.file.filename;
        }
        product.isFeatured = Boolean(req.body.isFeatured);
        product.category = req.body.category;

        await product.save();
        res.redirect("/admin/products");
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send("Error creating product");
    }
});

router.get("/admin/products/edit/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        let product;

        try {
            // First try to find by MongoDB ObjectId
            if (mongoose.Types.ObjectId.isValid(productId)) {
                product = await Product.findById(productId).populate('category');
            }
            
            // If not found, try to find by any other criteria
            if (!product) {
                product = await Product.findOne({ title: productId }).populate('category');
            }
        } catch (err) {
            console.error('Product lookup error:', err);
        }

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const categories = await Category.find();
        
        res.render("pages/Admin_Pages/editform", {
            layout: "admin-layout.ejs",
            product,
            categories
        });
    } catch (error) {
        console.error('Edit error:', error);
        res.status(500).send('Error loading product');
    }
});

router.post("/admin/products/edit/:id", upload.single("file"), async (req, res) => {
    try {
        const productId = req.params.id;
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Update fields
        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.category = req.body.category;
        product.isFeatured = Boolean(req.body.isFeatured);

        // Update picture only if new file is uploaded
        if (req.file) {
            product.picture = req.file.filename;
        }

        await product.save();
        res.redirect("/admin/products");
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send('Error updating product');
    }
});

router.get("/admin/products/delete/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        let result;

        try {
            // First try to delete by MongoDB ObjectId
            if (mongoose.Types.ObjectId.isValid(productId)) {
                result = await Product.findByIdAndDelete(productId);
            }
            
            // If not found, try to delete by any other criteria
            if (!result) {
                result = await Product.findOneAndDelete({ title: productId });
            }
        } catch (err) {
            console.error('Product delete error:', err);
        }

        if (!result) {
            return res.status(404).send('Product not found');
        }

        res.redirect("/admin/products");
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).send('Error deleting product');
    }
});

// for catagory 

router.get("/admin/viewcatagories",async(req,res)=>{
    let category= await Category.find()
    res.render("pages/Admin_Pages/category",{layout: "admin-layout.ejs",category});
})


router.post("/admin/products/createCategory",async (req,res)=>{
    let category= new Category(req.body);
    await category.save()
    res.redirect("/admin/viewcatagories")
 })

 router.get("/admin/categories/delete/:id",async(req,res)=>{
    await Category.findByIdAndDelete(req.params.id)
    return res.redirect("/admin/viewcatagories")
})

router.get("/admin/categories/edit/:id", async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Category not found");
        }
        res.render("pages/Admin_Pages/editCategory", {
            layout: "admin-layout.ejs",
            category
        });
    } catch (error) {
        console.error('Edit Category Error:', error);
        res.status(500).send("Error loading category");
    }
});

router.post("/admin/categories/edit/:id", async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Category not found");
        }
        
        category.categoryName = req.body.categoryName;
        await category.save();
        
        return res.redirect("/admin/viewcatagories");
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).send("Error updating category");
    }
});

router.get("/admin/products/createCategory", (req,res)=>{
    res.render("pages/Admin_Pages/createCategory",{layout: "admin-layout.ejs"});
})



router.get("/admin/login", (req,res)=>{
    res.render("pages/Admin_Pages/admin-login",{layout:false});
})


// for login page 
router.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).send("Invalid username or password!");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid username or password!");
        }

        // Redirect to dashboard
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.status(500).send("Error logging in admin!");
    }
});

// for registration

router.post("/admin/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).send("Admin already exists!");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({ username, password: hashedPassword });
        await newAdmin.save();

        res.redirect("/admin/login");
    } catch (error) {
        res.status(500).send("Error registering admin!");
    }
});

router.get("/secondpage", async (req, res) => {
    try {
        const sort = req.query.sort;
        let products;

        switch(sort) {
            case 'asc':
                // Sort by price low to high
                products = await Product.find().sort({ price: 1 });
                break;
            case 'desc':
                // Sort by price high to low
                products = await Product.find().sort({ price: -1 });
                break;
            case 'name':
                // Sort by name alphabetically
                products = await Product.find().sort({ title: 1 });
                break;
            case 'price':
                // Default price sorting (low to high)
                products = await Product.find().sort({ price: 1 });
                break;
            default:
                // No sorting
                products = await Product.find();
        }

        // Convert price strings to numbers for proper sorting
        products = products.map(product => ({
            ...product._doc,
            price: Number(product.price)
        }));

        res.render("pages/Main_Site_pages/secondpage", { 
            product: products,
            currentSort: sort // Pass the current sort to the template
        });
    } catch (error) {
        console.error('Sorting Error:', error);
        res.status(500).send("Error fetching products");
    }
});

module.exports = router;