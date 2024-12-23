document.addEventListener('DOMContentLoaded', function() {
    // Handle size selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons in this product's container
            const container = this.closest('.position-relative');
            container.querySelectorAll('.size-btn').forEach(btn => {
                btn.classList.remove('active', 'btn-light');
                btn.classList.add('btn-outline-light');
            });
            // Add active class to clicked button
            this.classList.add('active', 'btn-light');
            this.classList.remove('btn-outline-light');
        });
    });

    // Handle add to cart
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('.position-relative');
            const selectedSize = container.querySelector('.size-btn.active');
            
            if (!selectedSize) {
                alert('Please select a size first');
                return;
            }

            const productData = {
                image: container.querySelector('img').src,
                size: selectedSize.dataset.size,
                price: container.querySelector('.price').textContent,
                name: container.querySelector('.product-name').textContent
            };

            // Redirect to cart page with product data
            window.location.href = `/admin/addCart?${new URLSearchParams(productData)}`;
        });
    });
});
