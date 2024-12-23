const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abdulsamikhan471@gmail.com',
        pass: 'fgft jbly ytnf vmgh'
    }
});

async function verifyEmail(email) {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
    return true;
}

async function sendOrderConfirmation(order, product) {
    try {
        // Verify the email first
        await verifyEmail(order.shippingDetails.email);
        console.log('Attempting to send email to:', order.shippingDetails.email);

        const mailOptions = {
            from: '"Sana Safinaz" <abdulsamikhan471@gmail.com>',
            to: order.shippingDetails.email,
            subject: 'Order Confirmation - Sana Safinaz',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation - Sana Safinaz</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 700px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .email-container {
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        padding: 30px;
                    }
                    .header {
                        background-color: #8B0000;
                        color: #ffffff;
                        text-align: center;
                        padding: 15px;
                        border-radius: 8px 8px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .order-details {
                        background-color: #f9f9f9;
                        border: 1px solid #e0e0e0;
                        border-radius: 5px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .section-title {
                        color: #8B0000;
                        border-bottom: 2px solid #8B0000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                        border-bottom: 1px solid #eaeaea;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .total-amount {
                        font-weight: bold;
                        color: #8B0000;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Order Confirmation</h1>
                    </div>
                    
                    <div style="padding: 20px;">
                        <p>Dear ${order.shippingDetails.name},</p>
                        <p>Thank you for your purchase from Sana Safinaz. We appreciate your business.</p>
                        
                        <div class="order-details">
                            <h2 class="section-title">Order Information</h2>
                            
                            <div class="detail-row">
                                <span>Order ID:</span>
                                <span>${order._id}</span>
                            </div>
                            <div class="detail-row">
                                <span>Product:</span>
                                <span>${product.title}</span>
                            </div>
                            <div class="detail-row">
                                <span>Size:</span>
                                <span>${order.size}</span>
                            </div>
                            <div class="detail-row">
                                <span>Quantity:</span>
                                <span>${order.quantity}</span>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <h2 class="section-title">Billing Summary</h2>
                            
                            <div class="detail-row">
                                <span>Subtotal:</span>
                                <span>PKR ${order.billing.subtotal.toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span>Tax (5%):</span>
                                <span>PKR ${order.billing.tax.toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span>Shipping Fee:</span>
                                <span>PKR ${order.billing.shippingFee.toFixed(2)}</span>
                            </div>
                            <div class="detail-row total-amount">
                                <span>Total Amount:</span>
                                <span>PKR ${order.billing.total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <h2 class="section-title">Shipping Details</h2>
                            
                            <div class="detail-row">
                                <span>Address:</span>
                                <span>${order.shippingDetails.address}</span>
                            </div>
                            <div class="detail-row">
                                <span>City:</span>
                                <span>${order.shippingDetails.city}</span>
                            </div>
                            <div class="detail-row">
                                <span>Postal Code:</span>
                                <span>${order.shippingDetails.postalCode}</span>
                            </div>
                            <div class="detail-row">
                                <span>Phone:</span>
                                <span>${order.shippingDetails.phone}</span>
                            </div>
                        </div>
                        
                        <p>Our team will process your order shortly. If you have any questions, please contact our customer support.</p>
                        
                        <div class="footer">
                            <p>&copy; 2024 Sana Safinaz. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        };

        // Test connection before sending
        await transporter.verify();
        console.log('SMTP connection verified');

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

// Test the connection when the server starts
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

module.exports = { sendOrderConfirmation }; 