document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            placeOrder();
        });
    }
});

function renderCheckoutSummary() {
    let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
    const summaryContainer = document.getElementById('checkout-items');

    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p style="color:red;">Your cart is empty.</p>';
        document.getElementById('place-order-btn').disabled = true;
        return;
    }

    let subtotal = 0;
    summaryContainer.innerHTML = '';

    cart.forEach(item => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 1;
        const lineTotal = itemPrice * itemQuantity;
        subtotal += lineTotal;

        summaryContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                <span>${itemQuantity}x ${item.name} <br> <small style="color:#aaa;">${item.size} | ${item.material}</small></span>
                <span>LKR ${lineTotal.toFixed(2)}</span>
            </div>
        `;
    });

    let hasDelivery = cart.some(item => item.delivery.includes('Delivery'));
    let shippingCost = hasDelivery ? 500.00 : 0.00;
    const grandTotal = subtotal + shippingCost;

    document.getElementById('checkout-subtotal').innerText = `LKR ${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').innerText = shippingCost === 0 ? 'Free' : `LKR ${shippingCost.toFixed(2)}`;
    document.getElementById('checkout-total').innerText = `LKR ${grandTotal.toFixed(2)}`;
}

function placeOrder() {
    let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
    if (cart.length === 0) return;

    const email = document.getElementById('checkout-email').value;
    const name = document.getElementById('checkout-name').value;
    const address = document.getElementById('checkout-address').value;
    const city = document.getElementById('checkout-city').value;

    // Simulate order object
    const newOrder = {
        orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        customer: { name, email, address, city },
        items: cart,
        total: document.getElementById('checkout-total').innerText,
        status: 'Processing'
    };

    let orders = JSON.parse(localStorage.getItem('fandomOrders')) || [];
    orders.push(newOrder);
    localStorage.setItem('fandomOrders', JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem('fandomCart');

    window.location.href = 'order_success.html';
}
