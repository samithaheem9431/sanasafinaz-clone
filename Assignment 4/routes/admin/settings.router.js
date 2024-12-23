const express = require('express');
const router = express.Router();
const Settings = require('../../model/settings.model');

router.get('/tax', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ taxRate: 0 });
        }
        res.json({ taxRate: settings.taxRate });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tax settings' });
    }
});

// Update tax settings
router.post('/tax', async (req, res) => {
    try {
        const { taxRate } = req.body;
        
        if (taxRate === undefined || taxRate === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Tax rate is required' 
            });
        }
        
        const taxRateNum = parseFloat(taxRate);
        
        if (isNaN(taxRateNum)) {
            return res.status(400).json({ 
                success: false,
                error: 'Tax rate must be a valid number' 
            });
        }
        
        if (taxRateNum < 0 || taxRateNum > 100) {
            return res.status(400).json({ 
                success: false,
                error: 'Tax rate must be between 0 and 100' 
            });
        }

        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings({ taxRate: taxRateNum });
        } else {
            settings.taxRate = taxRateNum;
            settings.updatedAt = Date.now();
        }
        
        await settings.save();
        
        return res.status(200).json({ 
            success: true, 
            taxRate: settings.taxRate,
            message: 'Tax rate updated successfully' 
        });
    } catch (error) {
        console.error('Tax update error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to update tax rate. Please try again.' 
        });
    }
});

module.exports = router; 