document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the ID from the URL (e.g., ?id=101)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // 2. Get all products from storage
    const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];

    // 3. Find the specific product that matches the ID
    const product = products.find(p => p.id === productId);

    if (product) {
        // 4. If found, fill in the HTML elements
        document.getElementById('detailTitle').innerText = product.name;
        document.getElementById('detailPrice').innerText = "LKR " + product.price;
        document.getElementById('detailCategory').innerText = product.category + " | " + product.subCategory;

        // Construct Image Path
        const isExternal = product.image && product.image.startsWith('http');
        document.getElementById('detailImg').src = isExternal ? product.image : "RSC/IMGS/" + product.image;

        // Add to Cart Logic
        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn.addEventListener('click', () => {
            const size = document.getElementById('productSize').value;
            const material = document.getElementById('productMaterial').value;
            const delivery = document.getElementById('productDelivery').value;

            const cartItem = {
                cartItemId: Date.now().toString(), // Unique internal ID for cart entry
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                size: size,
                material: material,
                delivery: delivery,
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];

            // Check if an identical item already exists in the cart array
            const existingItemIndex = cart.findIndex(item =>
                item.productId === cartItem.productId &&
                item.size === cartItem.size &&
                item.material === cartItem.material &&
                item.delivery === cartItem.delivery
            );

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem('fandomCart', JSON.stringify(cart));

            alert('Item successfully added to your cart!');
            window.location.href = 'cart.html';
        });

        // Buy Now Logic
        const buyNowBtn = document.getElementById('buyNowBtn');
        buyNowBtn.addEventListener('click', () => {
            const size = document.getElementById('productSize').value;
            const material = document.getElementById('productMaterial').value;
            const delivery = document.getElementById('productDelivery').value;

            const cartItem = {
                cartItemId: Date.now().toString(),
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                size: size,
                material: material,
                delivery: delivery,
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];

            const existingItemIndex = cart.findIndex(item =>
                item.productId === cartItem.productId &&
                item.size === cartItem.size &&
                item.material === cartItem.material &&
                item.delivery === cartItem.delivery
            );

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem('fandomCart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        });
    } else {
        // If not found (wrong ID), show error
        const container = document.querySelector('.container');
        if (container) container.innerHTML = "<h2>Product not found!</h2>";
    }
});
