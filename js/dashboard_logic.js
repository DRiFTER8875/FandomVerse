document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SETUP: Load existing data ---
    // We run this immediately so the table shows items you added previously
    loadTableFromStorage();

    // --- SETUP ADMIN NAME ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.name) {
        const adminNameElement = document.getElementById('displayAdminName');
        if (adminNameElement) {
            adminNameElement.innerText = "Admin " + currentUser.name;
        }
    }

    // --- LOAD ACTUAL USERS ---
    loadUsersFromStorage();

    // --- TAB SWITCHING LOGIC ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all sections
            contentSections.forEach(section => section.style.display = 'none');

            // Show target section
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // --- 2. "ADD ITEM" BUTTON LOGIC ---
    const addItemBtn = document.getElementById('addItemBtn');

    // Only run this if the button actually exists on the page
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function () {

            // A. Grab all the text the user typed
            const id = document.getElementById('itemId').value;
            const name = document.getElementById('itemName').value;
            const price = document.getElementById('itemPrice').value;
            const category = document.getElementById('itemCategory').value;
            const subCategory = document.getElementById('itemSubCategory').value;
            const keywords = document.getElementById('itemKeywords').value;
            const isLimited = document.getElementById('itemLimited').checked;
            const isPopular = document.getElementById('itemPopular').checked;
            const image = document.getElementById('itemImage').value;
            const editIndex = parseInt(document.getElementById('editIndexInput').value);

            // B. validation: Stop if important fields are empty
            if (!id || !name || !price || !image || !category || !subCategory || !keywords) {
                alert("Please fill in all details, including Categories and Keywords.");
                return;
            }

            const productData = { id, name, price, category, subCategory, keywords, isLimited, isPopular, image, dateAdded: Date.now() };

            if (editIndex >= 0) {
                // --- UPDATE MODE ---
                const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
                products[editIndex] = productData;
                localStorage.setItem('fandomProducts', JSON.stringify(products));
                alert("Item Updated Successfully!");
            } else {
                // --- ADD MODE ---
                saveProductToStorage(productData);
                alert("Item Added and Saved!");
            }

            loadTableFromStorage();
            clearInputs();

            // Reset button
            addItemBtn.textContent = 'Add Item to Store';
            addItemBtn.style.background = '';
            document.getElementById('editIndexInput').value = '-1';
        });
    }

    // --- 3. BULK DELETE LOGIC ---
    const selectAllCheckbox = document.getElementById('selectAllItems');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.itemCheckbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
            toggleBulkDeleteBtn();
        });
    }

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function () {
            const checkboxes = document.querySelectorAll('.itemCheckbox:checked');
            if (checkboxes.length === 0) return;

            if (confirm(`Are you sure you want to permanently delete these ${checkboxes.length} selected items?`)) {
                
                // Get indices to delete, sorting descending to avoid index shifting when splicing
                const indicesToDelete = Array.from(checkboxes)
                    .map(cb => parseInt(cb.value))
                    .sort((a, b) => b - a);

                const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
                
                indicesToDelete.forEach(index => {
                    products.splice(index, 1);
                });

                localStorage.setItem('fandomProducts', JSON.stringify(products));
                
                // Uncheck master box
                if (selectAllCheckbox) selectAllCheckbox.checked = false;
                toggleBulkDeleteBtn();
                loadTableFromStorage();
            }
        });
    }
});

function toggleBulkDeleteBtn() {
    const checkedCount = document.querySelectorAll('.itemCheckbox:checked').length;
    const bulkBtn = document.getElementById('bulkDeleteBtn');
    if (bulkBtn) {
        bulkBtn.style.display = checkedCount > 0 ? 'inline-block' : 'none';
    }
}

// --- HELPER FUNCTIONS (The logic behind the scenes) ---

function saveProductToStorage(product) {
    // 1. Get the current list from memory. 
    // JSON.parse turns the text string back into a JavaScript Array.
    // "|| []" means "if memory is empty, create a new empty list".
    const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];

    // 2. Add the new product to the FRONT of the list so it appears first in New Arrivals.
    products.unshift(product);

    // 3. Save it back to memory.
    // JSON.stringify turns the Array into a text string (Storage only accepts strings).
    localStorage.setItem('fandomProducts', JSON.stringify(products));
}

function loadTableFromStorage() {
    const tableBody = document.getElementById('itemsTableBody');
    if (!tableBody) return; // specific check to avoid errors

    tableBody.innerHTML = ''; // Wipe the table clean first

    // Get the data
    const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];

    // Loop through every product and build a table row <tr>
    products.forEach((product, index) => {
        const row = document.createElement('tr');

        const badge = product.isLimited
            ? '<span class="badge-yes">Yes</span>'
            : '<span class="badge-no">No</span>';

        // We insert the data into the HTML
        row.innerHTML = `
            <td><input type="checkbox" class="itemCheckbox" value="${index}" onchange="toggleBulkDeleteBtn()"></td>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.subCategory}</td>
            <td><small style="color:var(--text-muted);">${product.keywords || ''}</small></td>
            <td>${badge}</td>
            <td>LKR ${product.price}</td>
            <td>
                <button class="remove-btn" style="margin-bottom:4px;" onclick="editProduct(${index})">Edit</button>
                <button class="remove-btn" onclick="removeProduct(${index})">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function clearInputs() {
    document.getElementById('itemId').value = "";
    document.getElementById('itemName').value = "";
    document.getElementById('itemPrice').value = "";
    document.getElementById('itemImage').value = "";
    document.getElementById('itemKeywords').value = "";
    document.getElementById('itemLimited').checked = false;
    document.getElementById('itemPopular').checked = false;
    document.getElementById('itemCategory').selectedIndex = 0;
    document.getElementById('itemSubCategory').selectedIndex = 0;
}

// Global function for the Remove button
window.removeProduct = function (index) {
    if (confirm("Are you sure you want to remove this item?")) {
        const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
        products.splice(index, 1);
        localStorage.setItem('fandomProducts', JSON.stringify(products));
        loadTableFromStorage();
    }
};

// Global function for the Edit button
window.editProduct = function (index) {
    const products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
    const product = products[index];
    if (!product) return;

    // Pre-fill form fields
    document.getElementById('itemId').value = product.id || '';
    document.getElementById('itemName').value = product.name || '';
    document.getElementById('itemPrice').value = product.price || '';
    document.getElementById('itemImage').value = product.image || '';
    document.getElementById('itemKeywords').value = product.keywords || '';
    document.getElementById('itemLimited').checked = !!product.isLimited;
    document.getElementById('itemPopular').checked = !!product.isPopular;

    // Set select dropdowns
    const catSelect = document.getElementById('itemCategory');
    const subSelect = document.getElementById('itemSubCategory');
    for (let opt of catSelect.options) { if (opt.value === product.category) { opt.selected = true; break; } }
    for (let opt of subSelect.options) { if (opt.value === product.subCategory) { opt.selected = true; break; } }

    // Store editing index and change button label
    document.getElementById('editIndexInput').value = index;
    const addBtn = document.getElementById('addItemBtn');
    addBtn.textContent = 'Update Item';
    addBtn.style.background = 'linear-gradient(135deg, #ff8c00, #ff0055)';

    // Scroll form into view
    document.querySelector('.add-item-form').scrollIntoView({ behavior: 'smooth' });
};

function loadUsersFromStorage() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Wipe clean

    const users = JSON.parse(localStorage.getItem('fandomUsers')) || [];

    users.forEach((user, index) => {
        const row = document.createElement('tr');

        const badge = user.role === 'admin'
            ? '<span class="badge-yes">Admin</span>'
            : '<span class="badge-no">Customer</span>';

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        row.innerHTML = `
            <td>#U${index + 101}</td>
            <td>${fullName || 'Unknown'}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${badge}</td>
            <td>
                <button class="remove-btn" onclick="removeUser(${index})">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

window.removeUser = function (index) {
    if (confirm("Are you sure you want to remove this user?")) {
        const users = JSON.parse(localStorage.getItem('fandomUsers')) || [];
        users.splice(index, 1);
        localStorage.setItem('fandomUsers', JSON.stringify(users));
        loadUsersFromStorage();
    }
};