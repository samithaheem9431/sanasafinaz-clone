const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    shippingDetails: {
        name: String,
        email: String,
        address: String,
        city: String,
        postalCode: String,
        phone: String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash on Delivery', 'Credit/Debit Card', 'JazzCash', 'EasyPaisa'],
        default: 'Cash on Delivery'
    },
    paymentDetails: {
        mobileNumber: String,
        cardNumber: String,
        expiryDate: String,
        cvv: String,
        cardType: String
    },
    billing: {
        subtotal: Number,
        tax: Number,
        shippingFee: Number,
        total: Number,
        profit: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    size: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
    if (this.billing && this.billing.total) {
        this.billing.profit = this.billing.total * 0.15;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema); 