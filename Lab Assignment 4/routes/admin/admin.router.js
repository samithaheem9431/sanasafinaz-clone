const express = require('express');
const router = express.Router();
const Settings = require('../../model/settings.model');
const settingsRouter = require('./settings.router');

router.use('/settings', settingsRouter);

router.get('/dashboard', async (req, res) => {
    try {
        // Add this to fetch tax settings
        const settings = await Settings.findOne();
        
        res.render('pages/Admin_Pages/dashboard', {
            layout: "admin-layout.ejs",
            settings: settings || { taxRate: 0 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}); 