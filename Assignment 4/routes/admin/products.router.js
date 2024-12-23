const express = require("express");
let router = express.Router();
const bcrypt = require("bcrypt");
let multer  = require("multer");
const { checkAuth, checkSessionTimeout } = require('../../middleware/auth');
const { generateOrderPDF } = require('../../utils/pdfGenerator');
const { sendOrderConfirmation } = require('../../utils/emailConfig');

const Admin = require("../../model/login.model");

let Product = require("../../model/products.models");
let Category = require("../../model/category.model");
const mongoose = require('mongoose');
const Order = require("../../model/order.model");
const Settings = require("../../model/settings.model");
const settingsRouter = require('./settings.router');




const storage = multer.diskStorage({
    destination: function(req , file , cb){
        cb(null,"./uploads")
    },
    filename: function(req , file , cb){
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });

router.get("/admin/products", checkAuth, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sort || 'default';
        const selectedCategory = req.query.category || '';
        
        // Build query based on category filter
        let query = {};
        if (selectedCategory) {
            query.categoryid = selectedCategory;
        }
        
        let productQuery = Product.find(query);
        
        // Apply sorting if specified
        if (sortBy === 'price_asc') {
            productQuery = productQuery.sort({ price: 1 });
        }
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Get categories for the dropdown
        const categories = await Category.find();
        
        // Execute query with pagination
        const products = await productQuery
            .skip(skip)
            .limit(limit);
        
        res.render("pages/Admin_Pages/products", {
            layout: "admin-layout.ejs",
            products,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            currentSort: sortBy,
            categories,
            selectedCategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



router.get("/admin/categories", checkAuth, async(req,res)=>{
    let category= await Category.find()
    res.render("pages/Admin_Pages/category",{layout: "admin-layout.ejs",category});
})

router.post("/admin/products/createCategory", checkAuth, async (req,res)=>{
    let category= new Category(req.body);
    await category.save()
    res.redirect("/admin/categories")
 })

 router.post("/admin/products/create", checkAuth, upload.single("file"), async (req, res) => {
    let product = new Product({
        ...req.body,
        quantities: {
            small: req.body.quantities.small || 0,
            medium: req.body.quantities.medium || 0,
            large: req.body.quantities.large || 0
        }
    });
    if (req.file) product.picture = req.file.filename;
    product.isFeatured = Boolean(req.body.isFeatured);
    await product.save();
    res.redirect("/admin/products");
});

router.get("/admin/categories/delete/:id", checkAuth, async(req,res)=>{
    await Category.findByIdAndDelete(req.params.id)
    return res.redirect("/admin/categories")
})

router.get("/admin/categories/edit/:id", checkAuth, async (req,res)=>{
    let category = await Category.findById(req.params.id)
    res.render("pages/Admin_Pages/editCatetory",{layout: "admin-layout.ejs",category})
})

router.post("/admin/categories/edit/:id", checkAuth, async (req,res)=>{
    let category = await Category.findById(req.params.id)
    category.categoryName = req.body.categoryName
    await category.save()
    return res.redirect("/admin/categories")
})

router.get("/admin/products/edit/:id", checkAuth, async (req,res)=>{
    let category = await Category.find();
    let product = await Product.findById(req.params.id)
    res.render("pages/Admin_Pages/editform",{layout: "admin-layout.ejs",product,category})
})

router.post("/admin/products/edit/:id", checkAuth, async (req, res) => {
    let product = await Product.findById(req.params.id);
    product.title = req.body.title;
    product.description = req.body.description;
    product.price = req.body.price;
    product.quantities = {
        small: req.body.quantities.small || 0,
        medium: req.body.quantities.medium || 0,
        large: req.body.quantities.large || 0
    };
    product.categoryid = req.body.categoryid;
    product.isFeatured = Boolean(req.body.isFeatured);
    await product.save();
    return res.redirect("/admin/products");
});


router.get("/admin/products/delete/:id", checkAuth, async(req,res)=>{
    await Product.findByIdAndDelete(req.params.id)
    return res.redirect("/admin/products")
})


router.get("/admin/dashboard", checkAuth, async (req, res) => {
    try {
        const products = await Product.find();
        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        
        // Add this to fetch tax settings
        const settings = await Settings.findOne();
        
        // Get date range from query parameters or use default (last 3 days)
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (!req.query.startDate) {
            startDate.setDate(startDate.getDate() - 3); // Default to last 3 days
        }

        const allOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                    },
                    totalSales: { $sum: "$billing.total" },
                    totalProfit: { $sum: "$billing.profit" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Calculate totals
        const totalRevenue = orders.reduce((sum, order) => 
            sum + (order.billing?.total || 0), 0);

        // Prepare chart data
        const labels = [];
        const salesData = [];
        const profitData = [];
        let periodTotalSales = 0;
        let periodTotalProfit = 0;

        allOrders.forEach(order => {
            const date = new Date(order._id.date);
            labels.push(date.toLocaleDateString());
            salesData.push(order.totalSales);
            profitData.push(order.totalProfit);
            
            // Add to period totals
            periodTotalSales += order.totalSales;
            periodTotalProfit += order.totalProfit;
        });

        res.render("pages/Admin_Pages/dashboard", {
            layout: "admin-layout.ejs",
            products,
            stats: {
                totalRevenue,
                totalProducts: products.length,
                lowStock: products.filter(product => 
                    product.quantities.small < 10 || 
                    product.quantities.medium < 10 || 
                    product.quantities.large < 10
                ).length,
                totalOrders: orders.length,
                recentOrders: orders,
                periodTotalSales,
                periodTotalProfit
            },
            chartData: {
                labels,
                sales: salesData,
                profit: profitData
            },
            dateRange: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            settings: settings || { taxRate: 0 },
            isAuthenticated: req.session.isAuthenticated,
            adminUsername: req.session.adminUsername,
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).send('Server Error');
    }
});

router.get("/admin/products/create", checkAuth, async (req,res)=>{
    let category = await Category.find();
    res.render("pages/Admin_Pages/create",{layout: "admin-layout.ejs",category});
})

router.get("/admin/products/createCategory", checkAuth, (req,res)=>{
    res.render("pages/Admin_Pages/createCategory",{layout: "admin-layout.ejs"});
})


router.get("/admin/login", async (req, res) => {
    // Check if user is already authenticated
    if (req.session.isAuthenticated) {
        return res.redirect("/admin/dashboard");
    }
    
    // Check if redirected due to timeout
    const timeout = req.query.timeout === 'true';
    
    // Check for remember me cookie
    const adminToken = req.cookies.adminToken;
    if (adminToken) {
        try {
            const admin = await Admin.findOne({ username: adminToken });
            if (admin) {
                req.session.isAuthenticated = true;
                req.session.adminUsername = admin.username;
                req.session.lastActivity = Date.now();
                return res.redirect("/admin/dashboard");
            }
        } catch (error) {
            console.error("Auto-login error:", error);
        }
    }
    
    res.render("pages/Admin_Pages/admin-login", { 
        layout: false,
        timeout: timeout 
    });
});


// Register Admin
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

// Login Admin
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

        // Create a new session
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.status(500).send("Error logging in!");
            }
            
            // Set session variables
            req.session.isAuthenticated = true;
            req.session.adminUsername = admin.username;
            req.session.cookie.maxAge = 30000; // 30 seconds
            
            // Set remember me cookie if checked
            if (req.body.rememberMe) {
                res.cookie('adminToken', admin.username, { 
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    httpOnly: true,
                    sameSite: 'strict'
                });
            }
            
            // Save the session before redirection
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send("Error saving session!");
                }
                res.redirect("/admin/dashboard");
            });
        });
    } catch (error) {
        res.status(500).send("Error logging in admin!");
    }
});

router.get("/admin/clock", checkAuth, (req,res)=>{
    res.render("pages/Admin_Pages/clock",{layout: "admin-layout.ejs"});
})
router.get("/admin/location", (req, res) => {
    res.render("pages/Admin_Pages/directions", { layout: false});
});

router.get("/add-to-cart/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const settings = await Settings.findOne();
        
        product.picture = `/uploads/${product.picture}`;
        res.render("pages/Admin_Pages/add-to-cart", {
            layout: false,
            product,
            settings: settings || { taxRate: 0 }
        });
    } catch (error) {
        console.error('Error loading product:', error);
        res.status(500).send("Error loading product");
    }
});

router.post("/place-order", async (req, res) => {
    try {
        const product = await Product.findById(req.body.productId);
        const settings = await Settings.findOne();
        const currentTaxRate = settings ? settings.taxRate : 0;
        
        const requestedSize = req.body.size;
        const requestedQuantity = parseInt(req.body.quantity);

        // Validate size and quantity
        if (!product.quantities[requestedSize]) {
            throw new Error('Invalid size selected');
        }

        if (requestedQuantity > product.quantities[requestedSize]) {
            throw new Error(`Insufficient stock. Only ${product.quantities[requestedSize]} items available in size ${requestedSize}`);
        }

        const subtotal = parseFloat(req.body.billing.subtotal);
        const tax = parseFloat(req.body.billing.tax);
        const shippingFee = 350;
        const total = subtotal + tax + shippingFee;

        // Map payment method to standardized format
        let standardizedPaymentMethod = 'Cash on Delivery'; // default value
        if (req.body.paymentMethod) {
            const method = req.body.paymentMethod.toLowerCase();
            if (method.includes('credit')) {
                standardizedPaymentMethod = 'Credit Card';
            } else if (method.includes('bank')) {
                standardizedPaymentMethod = 'Bank Transfer';
            }
        }

        const order = new Order({
            product: req.body.productId,
            quantity: req.body.quantity,
            size: req.body.size,
            paymentMethod: standardizedPaymentMethod,
            paymentDetails: {
                mobileNumber: req.body.mobileNumber || null,
                cardNumber: req.body.cardNumber || null,
                expiryDate: req.body.expiryDate || null,
                cvv: req.body.cvv || null
            },
            billing: {
                subtotal: subtotal,
                tax: tax,
                taxRate: currentTaxRate,
                shippingFee: shippingFee,
                total: total,
                profit: total * 0.15
            },
            shippingDetails: {
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                postalCode: req.body.postalCode,
                phone: req.body.phone,
                email: req.body.email
            }
        });

        await order.save();

        // Generate PDF bill
        const pdfFileName = await generateOrderPDF(order, product);

        // Update product quantity
        const sizeField = `quantities.${requestedSize}`;
        await Product.findByIdAndUpdate(req.body.productId, {
            $inc: { [sizeField]: -requestedQuantity }
        });

        // Send order confirmation email
        try {
            await sendOrderConfirmation(order, product);
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Continue with order process even if email fails
        }

        res.render("pages/Admin_Pages/order-confirmation", {
            layout: false,
            order,
            product,
            pdfFileName
        });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(400).send("Error placing order: " + error.message);
    }
});


// Add this route after your other routes
router.get("/admin/orders/:id", checkAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('product');
        
        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render("pages/Admin_Pages/order-details", {
            layout: "admin-layout.ejs",
            order: order
        });
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).send('Server Error');
    }
});

// Add this route to handle order status updates
router.post("/admin/orders/:id/status", checkAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = req.body.status;
        await order.save();

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ success: false, message: 'Error updating order status' });
    }
});

router.get('/order-details/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        // Add console.log to debug
        console.log('Order details:', order);
        
        res.render('pages/Admin_Pages/order-details', {
            order: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send('Error fetching order details');
    }
});

// Add logout route
router.get("/admin/logout", (req, res) => {
    // Clear all session data
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.redirect('/admin/dashboard');
        }
        
        // Clear all cookies
        res.clearCookie('adminToken');
        res.clearCookie('connect.sid', { path: '/' });
        
        // Ensure no caching
        res.set({
            'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
            'Pragma': 'no-cache',
            'Expires': '-1'
        });
        
        res.redirect("/admin/login");
    });
});

// Add a route to check session status
router.get("/admin/check-session", (req, res) => {
    res.json({
        isAuthenticated: req.session.isAuthenticated || false,
        adminUsername: req.session.adminUsername || null,
        sessionID: req.sessionID,
        cookie: req.session.cookie
    });
});

// Update the session timeout check to include all admin routes
router.use([
    '/admin/dashboard',
    '/admin/products',
    '/admin/categories',
    '/admin/clock',
    '/admin/orders',
    '/admin/location'
], checkSessionTimeout);

router.use('/admin/settings', settingsRouter);

module.exports = router;