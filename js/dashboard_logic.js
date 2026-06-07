document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SETUP: Load existing data from DB ---
    loadTableFromDB();

    // --- SETUP ADMIN NAME from session ---
    fetch('php/auth/check_session.php')
        .then(r => r.json())
        .then(data => {
            if (data.loggedIn && data.user) {
                const adminNameEl = document.getElementById('displayAdminName');
                if (adminNameEl) adminNameEl.innerText = 'Admin ' + data.user.name;
                // Also update localStorage for other pages
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            } else {
                // Not an admin session — redirect to login
                alert('Admin access required. Please log in.');
                window.location.href = 'login.html';
            }
        })
        .catch(() => {
            // Fallback: check localStorage (file:// mode)
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.name) {
                const adminNameEl = document.getElementById('displayAdminName');
                if (adminNameEl) adminNameEl.innerText = 'Admin ' + currentUser.name;
            }
        });

    // --- LOAD ACTUAL USERS ---
    loadUsersFromDB();

    // --- TAB SWITCHING LOGIC ---
    const sidebarLinks    = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            contentSections.forEach(section => section.style.display = 'none');
            const targetSection = document.getElementById(link.getAttribute('data-target'));
            if (targetSection) targetSection.style.display = 'block';
        });
    });

    // --- "ADD / UPDATE ITEM" BUTTON LOGIC ---
    const addItemBtn = document.getElementById('addItemBtn');

    if (addItemBtn) {
        addItemBtn.addEventListener('click', async function () {

            const id          = document.getElementById('itemId').value.trim();
            const name        = document.getElementById('itemName').value.trim();
            const price       = document.getElementById('itemPrice').value.trim();
            const category    = document.getElementById('itemCategory').value;
            const subCategory = document.getElementById('itemSubCategory').value;
            const keywords    = document.getElementById('itemKeywords').value.trim();
            const isLimited   = document.getElementById('itemLimited').checked;
            const isPopular   = document.getElementById('itemPopular').checked;
            const image       = document.getElementById('itemImage').value.trim();
            const editId    = document.getElementById('editIndexInput').value.trim();
            const isEditing = editId !== '' && editId !== '-1';

            if (!id || !name || !price || !image || !category || !subCategory || !keywords) {
                alert('Please fill in all details, including Categories and Keywords.');
                return;
            }

            addItemBtn.disabled    = true;
            addItemBtn.textContent = isEditing ? 'Updating...' : 'Adding...';

            const formData = new FormData();
            formData.append('id',          isEditing ? editId : id);
            formData.append('name',        name);
            formData.append('price',       price);
            formData.append('category',    category);
            formData.append('subCategory', subCategory);
            formData.append('keywords',    keywords);
            formData.append('isLimited',   isLimited ? 'true' : 'false');
            formData.append('isPopular',   isPopular ? 'true' : 'false');
            formData.append('image',       image);
            formData.append('stock',       15);

            const endpoint = isEditing
                ? 'php/products/update_product.php'
                : 'php/products/add_product.php';

            try {
                const res  = await fetch(endpoint, { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    alert(isEditing ? 'Item Updated Successfully!' : 'Item Added and Saved!');
                    loadTableFromDB();
                    clearInputs();
                    addItemBtn.textContent = 'Add Item to Store';
                    addItemBtn.style.background = '';
                    document.getElementById('editIndexInput').value = '';
                } else {
                    alert('Error: ' + (data.error || 'Unknown error.'));
                }
            } catch (err) {
                console.error('Add/update product error:', err);
                alert('Connection error. Make sure XAMPP is running.');
            } finally {
                addItemBtn.disabled = false;
                addItemBtn.textContent = isEditing ? 'Update Item' : 'Add Item to Store';
            }
        });
    }

    // --- BULK DELETE LOGIC ---
    const selectAllCheckbox = document.getElementById('selectAllItems');
    const bulkDeleteBtn     = document.getElementById('bulkDeleteBtn');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            document.querySelectorAll('.itemCheckbox').forEach(cb => cb.checked = this.checked);
            toggleBulkDeleteBtn();
        });
    }

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', async function () {
            const checkboxes = document.querySelectorAll('.itemCheckbox:checked');
            if (checkboxes.length === 0) return;

            if (!confirm(`Are you sure you want to permanently delete these ${checkboxes.length} selected items?`)) return;

            const productIds = Array.from(checkboxes).map(cb => cb.value);

            // Delete each one via PHP
            const deletePromises = productIds.map(pid => {
                const fd = new FormData();
                fd.append('id', pid);
                return fetch('php/products/delete_product.php', { method: 'POST', body: fd })
                    .then(r => r.json());
            });

            try {
                await Promise.all(deletePromises);
                if (selectAllCheckbox) selectAllCheckbox.checked = false;
                toggleBulkDeleteBtn();
                loadTableFromDB();
            } catch (err) {
                console.error('Bulk delete error:', err);
                alert('Some items may not have been deleted. Please refresh.');
            }
        });
    }
});

// --- TOGGLE BULK DELETE BUTTON ---
function toggleBulkDeleteBtn() {
    const checkedCount = document.querySelectorAll('.itemCheckbox:checked').length;
    const bulkBtn      = document.getElementById('bulkDeleteBtn');
    if (bulkBtn) bulkBtn.style.display = checkedCount > 0 ? 'inline-block' : 'none';
}

// --- LOAD PRODUCTS FROM DB INTO TABLE ---
async function loadTableFromDB() {
    const tableBody = document.getElementById('itemsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#aaa;">Loading...</td></tr>';

    try {
        const res  = await fetch('php/products/get_products.php');
        const data = await res.json();

        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="9" style="color:red;">${data.error}</td></tr>`;
            return;
        }

        const products = data.products;
        // Mirror to localStorage for other JS pages
        localStorage.setItem('fandomProducts', JSON.stringify(products));

        tableBody.innerHTML = '';
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#aaa;">No products found.</td></tr>';
            return;
        }

        products.forEach((product, index) => {
            const row   = document.createElement('tr');
            const badge = product.isLimited
                ? '<span class="badge-yes">Yes</span>'
                : '<span class="badge-no">No</span>';

            row.innerHTML = `
                <td><input type="checkbox" class="itemCheckbox" value="${product.id}" onchange="toggleBulkDeleteBtn()"></td>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.subCategory}</td>
                <td><small style="color:var(--text-muted);">${product.keywords || ''}</small></td>
                <td>${badge}</td>
                <td>LKR ${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <button class="remove-btn" style="margin-bottom:4px;" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="remove-btn" onclick="removeProduct('${product.id}')">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Load products error:', err);
        tableBody.innerHTML = '<tr><td colspan="9" style="color:red;">Connection error. Make sure XAMPP is running.</td></tr>';
    }
}

// --- CLEAR INPUTS ---
function clearInputs() {
    document.getElementById('itemId').value        = '';
    document.getElementById('itemName').value      = '';
    document.getElementById('itemPrice').value     = '';
    document.getElementById('itemImage').value     = '';
    document.getElementById('itemKeywords').value  = '';
    document.getElementById('itemLimited').checked = false;
    document.getElementById('itemPopular').checked = false;
    document.getElementById('itemCategory').selectedIndex    = 0;
    document.getElementById('itemSubCategory').selectedIndex = 0;
}

// --- REMOVE PRODUCT ---
window.removeProduct = async function (productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;

    const fd = new FormData();
    fd.append('id', productId);

    try {
        const res  = await fetch('php/products/delete_product.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            loadTableFromDB();
        } else {
            alert('Error: ' + (data.error || 'Delete failed.'));
        }
    } catch (err) {
        console.error('Remove product error:', err);
        alert('Connection error.');
    }
};

// --- EDIT PRODUCT (pre-fill form from DB data) ---
window.editProduct = async function (productId) {
    const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
    const product  = products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found. Please refresh.');
        return;
    }

    document.getElementById('itemId').value       = product.id       || '';
    document.getElementById('itemName').value     = product.name     || '';
    document.getElementById('itemPrice').value    = product.price    || '';
    document.getElementById('itemImage').value    = product.image    || '';
    document.getElementById('itemKeywords').value = product.keywords || '';
    document.getElementById('itemLimited').checked = !!product.isLimited;
    document.getElementById('itemPopular').checked = !!product.isPopular;

    const catSelect = document.getElementById('itemCategory');
    const subSelect = document.getElementById('itemSubCategory');
    for (let opt of catSelect.options) { if (opt.value === product.category)    { opt.selected = true; break; } }
    for (let opt of subSelect.options) { if (opt.value === product.subCategory) { opt.selected = true; break; } }

    // Store editing ID
    document.getElementById('editIndexInput').value = productId;
    const addBtn = document.getElementById('addItemBtn');
    addBtn.textContent  = 'Update Item';
    addBtn.style.background = 'linear-gradient(135deg, #ff8c00, #ff0055)';

    document.querySelector('.add-item-form').scrollIntoView({ behavior: 'smooth' });
};

// --- LOAD USERS FROM DB ---
async function loadUsersFromDB() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;">Loading...</td></tr>';

    try {
        const res  = await fetch('php/users/get_users.php');
        const data = await res.json();

        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">${data.error}</td></tr>`;
            return;
        }

        tableBody.innerHTML = '';
        if (data.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;">No users registered yet.</td></tr>';
            return;
        }

        data.users.forEach(user => {
            const row      = document.createElement('tr');
            const badge    = user.role === 'admin'
                ? '<span class="badge-yes">Admin</span>'
                : '<span class="badge-no">Customer</span>';
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

            row.innerHTML = `
                <td>#U${user.id}</td>
                <td>${fullName || 'Unknown'}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${badge}</td>
                <td>
                    <button class="remove-btn" onclick="removeUser(${user.id})">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Load users error:', err);
        tableBody.innerHTML = '<tr><td colspan="6" style="color:red;">Connection error. Make sure XAMPP is running.</td></tr>';
    }
}

// --- REMOVE USER ---
window.removeUser = async function (userId) {
    if (!confirm('Are you sure you want to remove this user?')) return;

    const fd = new FormData();
    fd.append('id', userId);

    try {
        const res  = await fetch('php/users/delete_user.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            loadUsersFromDB();
        } else {
            alert('Error: ' + (data.error || 'Delete failed.'));
        }
    } catch (err) {
        console.error('Remove user error:', err);
        alert('Connection error.');
    }
};