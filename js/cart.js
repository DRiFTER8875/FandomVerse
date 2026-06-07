document.addEventListener('DOMContentLoaded', () => {
    
    renderCart();
});

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const orderSummary = document.getElementById('order-summary');

    
    let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = '';
        emptyMessage.style.display = 'block';
        orderSummary.style.display = 'none';
        updateCartTotals(0, 0);
        return;
    }

    emptyMessage.style.display = 'none';
    orderSummary.style.display = 'block';
    cartContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 1;
        const lineTotal = itemPrice * itemQuantity;

        subtotal += lineTotal;

        const cartRow = document.createElement('div');
        cartRow.className = 'cart-item glass';
        cartRow.style.display = 'flex';
        cartRow.style.alignItems = 'center';
        cartRow.style.padding = '15px';
        cartRow.style.marginBottom = '15px';

        cartRow.innerHTML = `
            <img src="RSC/IMGS/${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin-right: 20px;" onerror="this.src='RSC/IMGS/LOGO.png'">
            <div style="flex: 1;">
                <h3 style="margin-bottom: 5px; color: #fff;">${item.name}</h3>
                <p style="font-size: 0.9rem; color: #aaa; margin-bottom: 5px;">
                    ${item.size} | ${item.material} <br>
                    <span style="color: #6a5cff;">${item.delivery}</span>
                </p>
                <h4 style="color: #FF0055;">LKR ${itemPrice.toFixed(2)}</h4>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; margin-right: 20px;">
                <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', -1)" style="width: 30px; height: 30px; border-radius: 50%; background: #333; color: white; cursor: pointer;">-</button>
                <span style="font-weight: bold; font-size: 1.1rem; width: 20px; text-align: center;">${itemQuantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', 1)" style="width: 30px; height: 30px; border-radius: 50%; background: #333; color: white; cursor: pointer;">+</button>
            </div>
            <div style="font-weight: bold; font-size: 1.2rem; min-width: 100px; text-align: right;">
                LKR ${lineTotal.toFixed(2)}
            </div>
            <button onclick="removeItem('${item.cartItemId}')" style="margin-left: 20px; background: none; border: none; color: #FF0055; cursor: pointer; font-size: 1.5rem;" title="Remove Item">
                🗑️
            </button>
        `;
        cartContainer.appendChild(cartRow);
    });

    // calculate shipping cost
    let hasDelivery = cart.some(item => item.delivery.includes('Delivery'));
    let shippingCost = hasDelivery ? 500.00 : 0.00;

    updateCartTotals(subtotal, shippingCost);
}

window.updateQuantity = function (cartItemId, change) {
    let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        localStorage.setItem('fandomCart', JSON.stringify(cart));
        renderCart();

        
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    }
}

window.removeItem = function (cartItemId) {
    let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    localStorage.setItem('fandomCart', JSON.stringify(cart));
    renderCart();

    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
}

function updateCartTotals(subtotal, shippingCost) {
    const total = subtotal + shippingCost;
    document.getElementById('cart-subtotal').innerText = 'LKR ' + subtotal.toFixed(2);
    document.getElementById('cart-shipping').innerText = shippingCost === 0 ? 'Free' : 'LKR ' + shippingCost.toFixed(2);
    document.getElementById('cart-total').innerText = 'LKR ' + total.toFixed(2);
}
