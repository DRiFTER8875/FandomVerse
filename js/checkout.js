let paymentMethod = 'Card';

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();

    const tabCard = document.getElementById('tab-card');
    const tabCod = document.getElementById('tab-cod');
    const cardSection = document.getElementById('payment-card-section');
    const codSection = document.getElementById('payment-cod-section');
    const cardInput = document.getElementById('checkout-card');

    if (tabCard && tabCod) {
        tabCard.addEventListener('click', () => {
            paymentMethod = 'Card';
            tabCard.className = 'btn btn-primary';
            tabCard.style.border = 'none';
            tabCod.className = 'btn btn-outline';
            if (cardSection) {
                cardSection.style.opacity = '1';
                cardSection.style.visibility = 'visible';
                cardSection.style.zIndex = '1';
            }
            if (codSection) {
                codSection.style.opacity = '0';
                codSection.style.visibility = 'hidden';
                codSection.style.zIndex = '0';
            }
            if (cardInput) cardInput.required = true;
        });

        tabCod.addEventListener('click', () => {
            paymentMethod = 'Cash on Delivery';
            tabCod.className = 'btn btn-primary';
            tabCod.style.border = 'none';
            tabCard.className = 'btn btn-outline';
            if (cardSection) {
                cardSection.style.opacity = '0';
                cardSection.style.visibility = 'hidden';
                cardSection.style.zIndex = '0';
            }
            if (codSection) {
                codSection.style.opacity = '1';
                codSection.style.visibility = 'visible';
                codSection.style.zIndex = '1';
            }
            if (cardInput) cardInput.required = false;
        });
    }

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
        const btn = document.getElementById('place-order-btn');
        if (btn) btn.disabled = true;
        return;
    }

    let subtotal = 0;
    summaryContainer.innerHTML = '';

    cart.forEach(item => {
        const itemPrice    = parseFloat(item.price)    || 0;
        const itemQuantity = parseInt(item.quantity)   || 1;
        const lineTotal    = itemPrice * itemQuantity;
        subtotal += lineTotal;

        summaryContainer.innerHTML += `
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:0.9rem;">
                <span>${itemQuantity}x ${item.name} <br>
                    <small style="color:#aaa;">${item.size || 'Standard'} | ${item.material || 'Standard'}</small>
                </span>
                <span>LKR ${lineTotal.toFixed(2)}</span>
            </div>
        `;
    });

    const hasDelivery  = cart.some(item => item.delivery && item.delivery.includes('Delivery'));
    const shippingCost = hasDelivery ? 500.00 : 0.00;
    const grandTotal   = subtotal + shippingCost;

    const subtotalEl  = document.getElementById('checkout-subtotal');
    const shippingEl  = document.getElementById('checkout-shipping');
    const totalEl     = document.getElementById('checkout-total');
    if (subtotalEl) subtotalEl.innerText = `LKR ${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = shippingCost === 0 ? 'Free' : `LKR ${shippingCost.toFixed(2)}`;
    if (totalEl)    totalEl.innerText    = `LKR ${grandTotal.toFixed(2)}`;
}

async function placeOrder() {
    let cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
    if (cart.length === 0) return;

    const emailEl   = document.getElementById('checkout-email');
    const nameEl    = document.getElementById('checkout-name');
    const addressEl = document.getElementById('checkout-address');
    const cityEl    = document.getElementById('checkout-city');
    const totalEl   = document.getElementById('checkout-total');

    const email   = emailEl   ? emailEl.value   : '';
    const name    = nameEl    ? nameEl.value     : '';
    const address = addressEl ? addressEl.value  : '';
    const city    = cityEl    ? cityEl.value     : '';
    const total   = totalEl   ? totalEl.innerText.replace('LKR ', '') : '0';

    const placeBtn = document.getElementById('place-order-btn');
    if (placeBtn) { placeBtn.disabled = true; placeBtn.textContent = 'Placing order...'; }

    let subtotal = 0;
    cart.forEach(item => {
        const itemPrice    = parseFloat(item.price)    || 0;
        const itemQuantity = parseInt(item.quantity)   || 1;
        subtotal += itemPrice * itemQuantity;
    });
    const hasDelivery  = cart.some(item => item.delivery && item.delivery.includes('Delivery'));
    const shippingCost = hasDelivery ? 500.00 : 0.00;
    const grandTotal   = subtotal + shippingCost;

    const formData = new FormData();
    formData.append('name',    name);
    formData.append('email',   email);
    formData.append('address', address);
    formData.append('city',    city);
    formData.append('items',   JSON.stringify(cart));
    formData.append('total',   grandTotal);
    formData.append('payment_method', paymentMethod);

    try {
        const res  = await fetch('php/orders/place_order.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            const orderDetails = {
                orderId: data.orderId,
                customerName: name,
                customerEmail: email,
                address: address,
                city: city,
                items: cart,
                subtotal: subtotal,
                shippingCost: shippingCost,
                total: grandTotal,
                paymentMethod: paymentMethod,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            };
            localStorage.setItem('lastOrderDetails', JSON.stringify(orderDetails));
            localStorage.removeItem('fandomCart');
            localStorage.setItem('lastOrderId', data.orderId);
            window.location.href = 'order_success.html?t=' + Date.now();
        } else {
            alert('Order failed: ' + (data.error || 'Please try again.'));
            if (placeBtn) { placeBtn.disabled = false; placeBtn.textContent = 'Place Order'; }
        }
    } catch (err) {
        console.warn('PHP order failed, saving to localStorage as fallback:', err);
        
        const newOrder = {
            orderId:  'ORD-' + Math.floor(Math.random() * 1000000),
            date:     new Date().toLocaleDateString(),
            customer: { name, email, address, city },
            items:    cart,
            total:    grandTotal,
            paymentMethod: paymentMethod,
            status:   'Processing'
        };
        let orders = JSON.parse(localStorage.getItem('fandomOrders')) || [];
        orders.push(newOrder);
        localStorage.setItem('fandomOrders', JSON.stringify(orders));
        
        const orderDetails = {
            orderId: newOrder.orderId,
            customerName: name,
            customerEmail: email,
            address: address,
            city: city,
            items: cart,
            subtotal: subtotal,
            shippingCost: shippingCost,
            total: grandTotal,
            paymentMethod: paymentMethod,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        localStorage.setItem('lastOrderDetails', JSON.stringify(orderDetails));
        
        localStorage.removeItem('fandomCart');
        localStorage.setItem('lastOrderId', newOrder.orderId);
        window.location.href = 'order_success.html?t=' + Date.now();
    }
}
