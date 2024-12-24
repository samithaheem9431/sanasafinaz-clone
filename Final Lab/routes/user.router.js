const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/user.model');

// Login page render
router.get('/user/login', (req, res) => {
    res.render('pages/Main_Site_pages/user-login', { 
        layout: false,
        error: null 
    });
});

// Login post handler
router.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('pages/Main_Site_pages/user-login', {
                layout: false,
                error: 'Invalid email or password'
            });
        }

        // Set user cookie
        res.cookie('userId', user._id, { 
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true
        });

        // Redirect back to previous page or home
        const redirectUrl = req.cookies.redirectUrl || '/';
        res.clearCookie('redirectUrl');
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Login error:', error);
        res.render('pages/Main_Site_pages/user-login', {
            layout: false,
            error: 'An error occurred during login'
        });
    }
});

// Add this route to your existing user.router.js
router.post('/user/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('pages/Main_Site_pages/user-register', {
                layout: false,
                error: 'Email already registered'
            });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });
        
        await user.save();

        // Automatically log in the user after registration
        res.cookie('userId', user._id, { 
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true
        });

        // Redirect to the stored URL or home page
        const redirectUrl = req.cookies.redirectUrl || '/';
        res.clearCookie('redirectUrl');
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Registration error:', error);
        res.render('pages/Main_Site_pages/user-register', {
            layout: false,
            error: 'Error during registration. Please try again.'
        });
    }
});

// Add registration page route
router.get('/user/register', (req, res) => {
    res.render('pages/Main_Site_pages/user-register', { 
        layout: false,
        error: null 
    });
});

// Add this route to your existing user.router.js
router.get('/user/logout', (req, res) => {
    // Clear the userId cookie
    res.clearCookie('userId');
    // Redirect to home page
    res.redirect('/');
});

module.exports = router; 