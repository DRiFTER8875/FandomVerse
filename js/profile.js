document.addEventListener("DOMContentLoaded", async () => {

    // --- 1. CHECK SESSION (PHP) ---
    let userData = null;

    try {
        const sessionRes  = await fetch('php/auth/check_session.php');
        const sessionData = await sessionRes.json();

        if (!sessionData.loggedIn || sessionData.user.role !== 'customer') {
            alert("Please log in to view your profile.");
            window.location.href = "login.html";
            return;
        }
        userData = sessionData.user;
        localStorage.setItem('currentUser', JSON.stringify(userData));

    } catch (err) {
        // Fallback to localStorage if PHP unavailable
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'customer') {
            alert("Please log in to view your profile.");
            window.location.href = "login.html";
            return;
        }
        userData = currentUser;
    }

    // --- 2. DISPLAY PROFILE HEADER ---
    const firstInitial = userData.name ? userData.name.charAt(0).toUpperCase() : '?';
    const dpEl = document.getElementById('profile-dp');
    if (dpEl) dpEl.innerText = firstInitial;

    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.innerText = userData.name || 'User';

    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.innerText = userData.email || '';

    const emailInput = document.getElementById('update-email');
    if (emailInput) emailInput.value = userData.email || '';

    // --- 3. HANDLE UPDATE SUBMISSION ---
    const updateForm = document.getElementById('update-form');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newEmail    = document.getElementById('update-email').value.trim();
            const newPassword = document.getElementById('update-password').value.trim();

            const formData = new FormData();
            if (newEmail)    formData.append('email',    newEmail);
            if (newPassword) formData.append('password', newPassword);

            try {
                const res  = await fetch('php/auth/update_profile.php', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    alert("Profile updated successfully!");
                    if (newEmail && emailEl) emailEl.innerText = newEmail;
                    // Update localStorage cache
                    userData.email = newEmail || userData.email;
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    if (document.getElementById('update-password'))
                        document.getElementById('update-password').value = '';
                } else if (data.errors) {
                    const msgs = Object.values(data.errors).join('\n');
                    alert('Validation errors:\n' + msgs);
                } else {
                    alert(data.error || "Update failed.");
                }
            } catch (err) {
                console.error('Profile update error:', err);
                alert("Connection error.");
            }
        });
    }

    // --- 4. LOGOUT ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('php/auth/logout.php');
            } catch (_) { /* ignore */ }
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // --- 5. RENDER CART (from localStorage — works for guests too) ---
    const cart          = JSON.parse(localStorage.getItem('fandomCart')) || [];
    const cartContainer = document.getElementById('profile-cart-container');
    if (cartContainer) {
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="color:#aaa;">Your cart is currently empty.</p>';
        } else {
            let cartHtml = '';
            cart.forEach(item => {
                const imgPath = (item.image && item.image.startsWith('http'))
                    ? item.image
                    : `RSC/IMGS/${item.image || ''}`;
                cartHtml += `
                    <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,0.1);">
                        <img src="${imgPath}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;" onerror="this.src='RSC/IMGS/LOGO.png'">
                        <div>
                            <div style="font-weight:bold;font-size:0.9rem;color:#fff;line-height:1.2;margin-bottom:4px;">${item.name}</div>
                            <div style="color:#FF6600;font-size:0.8rem;">Qty: ${item.quantity} | LKR ${item.price}</div>
                        </div>
                    </div>
                `;
            });
            cartContainer.innerHTML = cartHtml;
        }
    }

    // --- 6. RENDER ORDERS (from PHP) ---
    const ordersContainer = document.getElementById('profile-orders-container');
    if (ordersContainer) {
        ordersContainer.innerHTML = '<p style="color:#aaa;">Loading orders...</p>';
        try {
            const res  = await fetch('php/orders/get_orders.php');
            const data = await res.json();

            if (!data.success) {
                ordersContainer.innerHTML = `<p style="color:red;">${data.error}</p>`;
                return;
            }

            if (!data.orders || data.orders.length === 0) {
                ordersContainer.innerHTML = '<p style="color:#aaa;">You have no past orders.</p>';
            } else {
                let ordersHtml = '';
                data.orders.forEach(order => {
                    ordersHtml += `
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;border-left:4px solid #FF6600;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                                <span style="font-weight:bold;color:#fff;">Order ${order.orderId}</span>
                                <span style="color:#aaa;font-size:0.8rem;">${order.date}</span>
                            </div>
                            <div style="color:#FF6600;font-weight:bold;font-size:1.1rem;">Total: LKR ${parseFloat(order.total).toFixed(2)}</div>
                            <div style="color:#aaa;font-size:0.8rem;margin-top:4px;">Status: ${order.status}</div>
                        </div>
                    `;
                });
                ordersContainer.innerHTML = ordersHtml;
            }
        } catch (err) {
            // Fallback to localStorage orders
            const orders     = JSON.parse(localStorage.getItem('fandomOrders')) || [];
            const userOrders = orders.filter(o => o.customer && o.customer.email === userData.email);
            if (userOrders.length === 0) {
                ordersContainer.innerHTML = '<p style="color:#aaa;">You have no past orders.</p>';
            } else {
                let ordersHtml = '';
                [...userOrders].reverse().forEach(order => {
                    ordersHtml += `
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;border-left:4px solid #FF6600;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                                <span style="font-weight:bold;color:#fff;">Order ${order.orderId}</span>
                                <span style="color:#aaa;font-size:0.8rem;">${order.date}</span>
                            </div>
                            <div style="color:#FF6600;font-weight:bold;font-size:1.1rem;">Total: ${order.total}</div>
                        </div>
                    `;
                });
                ordersContainer.innerHTML = ordersHtml;
            }
        }
    }
});
