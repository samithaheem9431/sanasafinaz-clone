const express = require('express');
const router = express.Router();
const Cart = require('../model/cart.model');
const Order = require('../model/order.model');

// Add to cart
router.post('/add-to-cart', async (req, res) => {
    try {
        const { productId, price, title, picture } = req.body;
        let userId = req.cookies.userId || 'guest-' + Date.now();
        
        if (!req.cookies.userId) {
            res.cookie('userId', userId, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        }

        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                total: 0
            });
        }

        const existingItem = cart.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                productId,
                title,
                price: Number(price),
                picture,
                quantity: 1
            });
        }

        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await cart.save();
        
        res.json({ success: true, cartCount: cart.items.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View cart
router.get('/cart', async (req, res) => {
    try {
        const userId = req.cookies.userId;
        const cart = await Cart.findOne({ userId });
        res.render('pages/Main_Site_pages/cart', { 
            cart: cart || { items: [], total: 0 },
            layout: false  // This removes the layout
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Checkout
router.post('/checkout', async (req, res) => {
    try {
        const userId = req.cookies.userId;
        const { name, address, city, phone } = req.body;
        const cart = await Cart.findOne({ userId });
        const shippingCharge = 190; // Fixed shipping charge

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        // Create order with validated data
        const order = new Order({
            userId,
            items: cart.items.map(item => ({
                productId: item.productId,
                title: item.title,
                price: Number(item.price) || 0,
                picture: item.picture,
                quantity: Number(item.quantity) || 1
            })),
            total: Number(cart.total) + shippingCharge, // Add shipping charge to total
            shippingCharge: shippingCharge,
            shippingAddress: {
                name: name || 'Customer',
                address: address || 'N/A',
                city: city || 'N/A',
                phone: phone || 'N/A'
            },
            orderDate: new Date(),
            status: 'Pending'
        });

        // Validate order before saving
        if (!order.total || order.total <= 0) {
            order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCharge;
        }

        await order.save();
        await Cart.deleteOne({ userId });
        
        res.render('pages/Main_Site_pages/order-confirmed', { 
            order,
            layout: false
        });
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).send(error.message);
    }
});

module.exports = router; 