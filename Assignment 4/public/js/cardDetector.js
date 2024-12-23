const cardPatterns = {
    visa: {
        pattern: /^4/,
        logo: '/images/card-logos/visa.png'
    },
    mastercard: {
        pattern: /^(5[1-5]|2[2-7])/,
        logo: '/images/card-logos/mastercard.png'
    },
    amex: {
        pattern: /^3[47]/,
        logo: '/images/card-logos/amex.png'
    },
    paypak: {
        pattern: /^2[2-7]/,
        logo: '/images/card-logos/paypak.png'
    },
    unionpay: {
        pattern: /^62/,
        logo: '/images/card-logos/unionpay.png'
    }
};

function detectCardType(cardNumber) {
    // Remove any spaces or non-numeric characters
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Check PayPak first before other cards
    if (/^2[2-7]/.test(cardNumber)) {
        return {
            type: 'paypak',
            logo: cardPatterns.paypak.logo
        };
    }
    
    // Then check other cards
    for (const [cardType, data] of Object.entries(cardPatterns)) {
        if (cardType !== 'paypak' && data.pattern.test(cardNumber)) {
            return {
                type: cardType,
                logo: data.logo
            };
        }
    }
    return null;
}

// Add this to test if the detection is working
window.detectCardType = detectCardType; 