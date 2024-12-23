const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    taxRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema); 