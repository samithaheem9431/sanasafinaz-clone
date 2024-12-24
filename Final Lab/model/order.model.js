const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: String,
    items: [{
        productId: String,
        title: String,
        price: Number,
        picture: String,
        quantity: Number
    }],
    total: Number,
    shippingCharge: {
        type: Number,
        default: 190
    },
    shippingAddress: {
        name: String,
        address: String,
        city: String,
        phone: String
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('Order', orderSchema); 