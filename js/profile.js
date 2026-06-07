document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'customer') {
        alert("Please log in to view your profile.");
        window.location.href = "login.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem('fandomUsers')) || [];
    let userData = users.find(u => u.username === currentUser.username);

    if (!userData) {
        alert("User data not found. Please log in again.");
        localStorage.removeItem('currentUser');
        window.location.href = "login.html";
        return;
    }

    // 1. Setup Profile Header & DP
    const firstInitial = userData.firstName ? userData.firstName.charAt(0) : '';
    const lastInitial = userData.lastName ? userData.lastName.charAt(0) : '';
    document.getElementById('profile-dp').innerText = `${firstInitial}${lastInitial}`;
    document.getElementById('profile-name').innerText = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('profile-email').innerText = userData.email;

    // 2. Pre-fill update form
    document.getElementById('update-email').value = userData.email;

    // 3. Handle Update Submission
    document.getElementById('update-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newEmail = document.getElementById('update-email').value.trim();
        const newPassword = document.getElementById('update-password').value.trim();

        if (newEmail) userData.email = newEmail;
        if (newPassword) userData.password = newPassword;

        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex > -1) {
            users[userIndex] = userData;
            localStorage.setItem('fandomUsers', JSON.stringify(users));
            alert("Profile updated successfully!");
            document.getElementById('profile-email').innerText = userData.email;
            document.getElementById('update-password').value = '';
        }
    });

    // Logout handling on profile page specifically
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 4. Render Cart Items
    const cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
    const cartContainer = document.getElementById('profile-cart-container');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color:#aaa;">Your cart is currently empty.</p>';
    } else {
        let cartHtml = '';
        cart.forEach(item => {
            const imgPath = item.image.startsWith('http') ? item.image : `RSC/IMGS/${item.image}`;
            cartHtml += `
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${imgPath}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" onerror="this.src='RSC/IMGS/LOGO.png'">
                    <div>
                        <div style="font-weight: bold; font-size: 0.9rem; color: #fff; line-height: 1.2; margin-bottom: 4px;">${item.name}</div>
                        <div style="color: #FF6600; font-size: 0.8rem;">Qty: ${item.quantity} | LKR ${item.price}</div>
                    </div>
                </div>
            `;
        });
        cartContainer.innerHTML = cartHtml;
    }

    // 5. Render Orders filtering by customer email
    const orders = JSON.parse(localStorage.getItem('fandomOrders')) || [];
    const userOrders = orders.filter(o => o.customer && o.customer.email === userData.email);

    const ordersContainer = document.getElementById('profile-orders-container');
    if (userOrders.length === 0) {
        ordersContainer.innerHTML = '<p style="color:#aaa;">You have no past orders.</p>';
    } else {
        let ordersHtml = '';
        [...userOrders].reverse().forEach(order => {
            ordersHtml += `
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 4px solid #FF6600;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: bold; color: #fff;">Order ${order.orderId}</span>
                        <span style="color: #aaa; font-size: 0.8rem;">${order.date}</span>
                    </div>
                    <div style="color: #FF6600; font-weight: bold; font-size: 1.1rem;">Total: ${order.total}</div>
                </div>
            `;
        });
        ordersContainer.innerHTML = ordersHtml;
    }
});
