const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateOrderPDF(order, product) {
    return new Promise((resolve, reject) => {
        try {
            // Add date validation and logging
            const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
            
            // Log date information for debugging
            console.log('Original createdAt:', order.createdAt);
            console.log('Parsed order date:', orderDate);
            console.log('Is valid date:', !isNaN(orderDate.getTime()));

            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 70,
                    right: 70
                }
            });
            const fileName = `bill-${order._id}.pdf`;
            const billsDir = path.join(__dirname, '..', 'uploads', 'bills');

            // Ensure bills directory exists
            if (!fs.existsSync(billsDir)) {
                fs.mkdirSync(billsDir, { recursive: true });
            }

            const filePath = path.join(billsDir, fileName);
            doc.pipe(fs.createWriteStream(filePath));

            // Company Logo Placeholder (you would replace this with actual logo positioning)
            const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 50, { width: 150 });
            }

            // Bill Invoice Header
            doc.font('Times-Bold')
               .fontSize(20)
               .text('BILL INVOICE', 0, 50, { 
                   align: 'right',
                   color: '#2C3E50'
               });

            // Horizontal Line
            doc.strokeColor('#34495E')
               .lineWidth(1)
               .moveTo(50, 120)
               .lineTo(550, 120)
               .stroke();

            // Company Details
            doc.font('Times-Bold')
               .fontSize(12)
               .fillColor('#2C3E50')
               .text('SANA SAFINAZ', 50, 140);

            doc.font('Times-Roman')
               .fontSize(10)
               .text('Authorized Retailer', 50, 155);

            // Invoice Details
            doc.font('Times-Bold')
               .fontSize(12)
               .text('Invoice Details', 50, 210);

            doc.font('Times-Roman')
               .fontSize(10)
               .text(`Invoice Number: INV-${order._id}`, 50, 230)
               .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 245)
               .text(`Order Date: ${isNaN(orderDate.getTime()) ? 'N/A' : orderDate.toLocaleDateString()}`, 50, 260);

            // Billing & Shipping Details
            doc.font('Times-Bold')
               .fontSize(12)
               .text('Customer Information', 350, 210);

            doc.font('Times-Roman')
               .fontSize(10)
               .text(`${order.shippingDetails.name || 'N/A'}`, 350, 230)
               .text(`${order.shippingDetails.email || 'N/A'}`, 350, 245)
               .text(`${order.shippingDetails.address || 'N/A'}`, 350, 260)
               .text(`${(order.shippingDetails.city || '') + ', ' + (order.shippingDetails.postalCode || '').trim()}`, 350, 275)
               .text(`Phone: ${order.shippingDetails.phone || 'N/A'}`, 350, 290);

            // Order Details
            doc.font('Times-Bold')
               .fontSize(14)
               .text('Order Summary', 50, 320, { underline: true });

            const tableTop = 350;
            const columnWidths = [250, 100, 100, 100];
            const headers = ['Description', 'Quantity', 'Unit Price', 'Total'];
            
            // Table Header
            doc.font('Times-Bold')
               .fontSize(10)
               .text(headers[0], 50, tableTop)
               .text(headers[1], 50 + columnWidths[0], tableTop)
               .text(headers[2], 50 + columnWidths[0] + columnWidths[1], tableTop)
               .text(headers[3], 50 + columnWidths[0] + columnWidths[1] + columnWidths[2], tableTop);

            // Table Separator
            doc.strokeColor('#BDC3C7')
               .lineWidth(0.5)
               .moveTo(50, tableTop + 15)
               .lineTo(550, tableTop + 15)
               .stroke();

            // Order Item
            doc.font('Times-Roman')
               .fontSize(10)
               .text(product.title || 'N/A', 50, tableTop + 25)
               .text((order.quantity || 'N/A').toString(), 50 + columnWidths[0], tableTop + 25)
               .text(`PKR ${order.billing && order.billing.subtotal ? (order.billing.subtotal / (order.quantity || 1)).toFixed(2) : 'N/A'}`, 50 + columnWidths[0] + columnWidths[1], tableTop + 25)
               .text(`PKR ${order.billing && order.billing.subtotal ? order.billing.subtotal.toFixed(2) : 'N/A'}`, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2], tableTop + 25);

            // Bill Summary
            const billSummaryTop = tableTop + 100;
            doc.font('Times-Bold')
               .fontSize(12)
               .text('Financial Summary', 350, billSummaryTop);

            // Add null checks for billing information
            doc.font('Times-Roman')
               .fontSize(10)
               .text('Subtotal:', 350, billSummaryTop + 25)
               .text(`PKR ${order.billing && order.billing.subtotal ? order.billing.subtotal.toFixed(2) : 'N/A'}`, 470, billSummaryTop + 25, { align: 'right' })
               .text(`Tax (${order.billing && order.billing.taxRate ? order.billing.taxRate.toFixed(1) : 0}%):`, 350, billSummaryTop + 40)
               .text(`PKR ${order.billing && order.billing.tax ? order.billing.tax.toFixed(2) : 'N/A'}`, 470, billSummaryTop + 40, { align: 'right' })
               .text('Shipping Fee:', 350, billSummaryTop + 55)
               .text(`PKR ${order.billing && order.billing.shippingFee ? order.billing.shippingFee.toFixed(2) : 'N/A'}`, 470, billSummaryTop + 55, { align: 'right' });

            // Total Amount
            doc.font('Times-Bold')
               .fontSize(12)
               .text('Total Amount:', 350, billSummaryTop + 75)
               .text(`PKR ${order.billing && order.billing.total ? order.billing.total.toFixed(2) : 'N/A'}`, 470, billSummaryTop + 75, { align: 'right' });

            // Payment Method
            doc.font('Times-Roman')
               .fontSize(10)
               .text(`Payment Method: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}`, 50, billSummaryTop + 150);

            // Footer
            doc.font('Times-Roman')
               .fontSize(8)
               .fillColor('#7F8C8D')
               .text('This is a computer-generated bill and does not require a physical signature.', 50, 750, { align: 'center' })
               .text('Thank you for your business!', 50, 770, { align: 'center' });

            doc.end();
            resolve(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
}
exports.generateOrderPDF = generateOrderPDF;