document.addEventListener("DOMContentLoaded", () => {
    
    const header = document.querySelector('header');
    if (header && !document.querySelector('.hamburger')) {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '&#9776;';
        header.prepend(hamburger);

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        sidebar.id = 'mobile-sidebar';
        sidebar.innerHTML = `
            <div class="close-btn">&times;</div>
            <a href="index.html" class="logo" style="font-size: 1.5rem; margin-bottom: 1rem; display: block;">FandomVerse</a>
            <a href="index.html">Home</a>
            <a href="Explore.html">Explore</a>
            <a href="about.html">About Us</a>
            <a href="profile.html" id="sidebar-profile-link" style="display:none; color: var(--primary-color);">Profile</a>
        `;
        document.body.appendChild(sidebar);

        hamburger.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });

        const closeSidebar = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        };

        const closeBtn = sidebar.querySelector('.close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
    }

    
    if (header && !document.getElementById('global-search-bar')) {
        const searchBar = document.createElement('div');
        searchBar.id = 'global-search-bar';
        searchBar.innerHTML = `
            <input type="text" id="search-input" placeholder="Search products..." autocomplete="off">
            <span class="search-icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;opacity:0.6;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
        `;
        const navIcons = header.querySelector('.nav-icons');
        if (navIcons) {
            const authLink = document.getElementById('nav-auth-link');
            if (authLink) {
                navIcons.insertBefore(searchBar, authLink);
            } else {
                navIcons.prepend(searchBar);
            }
        }

        const mobileSearchIcon = document.createElement('span');
        mobileSearchIcon.id = 'mobile-search-icon';
        mobileSearchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;opacity:0.6;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        if (navIcons) navIcons.prepend(mobileSearchIcon);

        const overlayResults = document.createElement('div');
        overlayResults.id = 'search-results-overlay';
        document.body.appendChild(overlayResults);

        const searchInput = searchBar.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => doSearch(e.target.value));
        }
        
        mobileSearchIcon.addEventListener('click', () => {
            searchBar.classList.toggle('mobile-active');
            if (searchBar.classList.contains('mobile-active') && searchInput) searchInput.focus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchBar.classList.remove('mobile-active');
                overlayResults.style.display = 'none';
            }
        });
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !overlayResults.contains(e.target)) {
                overlayResults.style.display = 'none';
            }
        });
    }

    
    checkLoginStatus();

    
    
    
    let products = [];
    window._fandomProducts = [];

    
    (async () => {
        try {
            const res  = await fetch('php/products/get_products.php');
            const data = await res.json();
            if (data.success && Array.isArray(data.products)) {
                products = data.products;
                window._fandomProducts = products;
                
                localStorage.setItem('fandomProducts', JSON.stringify(products));
            }
        } catch (err) {
            console.warn('PHP API unavailable, falling back to localStorage:', err);
            
            products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
            window._fandomProducts = products;
        }

        updateCartBadge();

        
        const popularTrack = document.getElementById('popular-track');
        if (popularTrack) {
            const popularItems = products.filter(p => p.isPopular === true);
            if (popularItems.length > 0) {
                const createPopCardHTML = (product) => {
                    const isExternal = product.image && product.image.startsWith('http');
                    const imgPath = isExternal ? product.image : `RSC/IMGS/${product.image}`;
                    return `
                        <div class="product-card glass" style="cursor: pointer;" onclick="window.location.href='product_detail.html?id=${product.id}'">
                            <div class="product-image-wrapper">
                                <div class="product-badge">Featured</div>
                                <img src="${imgPath}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='RSC/IMGS/LOGO.png'">
                            </div>
                            <div class="product-info">
                                <span class="product-category">${product.category}</span>
                                <h3 class="product-title">${product.name}</h3>
                                <div class="product-price">LKR ${product.price}</div>
                                <button class="add-to-cart-btn" onclick="event.stopPropagation(); store.addToCart('${product.id}'); alert('Added to cart!')">Add to Cart</button>
                            </div>
                        </div>
                    `;
                };
                popularTrack.innerHTML = popularItems.map(createPopCardHTML).join('');
                popularItems.forEach(product => {
                    const clone = document.createElement('div');
                    clone.innerHTML = createPopCardHTML(product);
                    const card = clone.firstElementChild;
                    card.setAttribute('data-clone', 'true');
                    popularTrack.appendChild(card);
                });
            }
        }

        
        renderProductsToContainer('new-arrivals-track', null, null, true);
        applySmartScroll(document.getElementById('new-arrivals-track'));
        applySmartScroll(document.getElementById('popular-track'));

        
        renderProductsToContainer('slider-new-arrivals', null, 25, false);
        renderProductsToContainer('slider-anime',   p => p.category === 'Anime', null, false);
        renderProductsToContainer('slider-games',   p => p.category === 'Games', null, false);
        renderProductsToContainer('slider-cartoon', p => p.category === 'Cartoons' || p.category === 'Cartoon', null, false);
        renderProductsToContainer('slider-movies',  p => p.category === 'Movies/TV Series' || p.category === 'Movies' || p.category === 'Movies & TV Shows' || p.category === 'TV Shows', null, false);
    })(); 

    

    
    
    const renderProductsToContainer = (containerId, filterFn, maxItems = null, duplicateForScroll = false) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        let filteredProducts = products;
        if (filterFn) {
            filteredProducts = products.filter(filterFn);
        }
        
        
        
        filteredProducts = [...filteredProducts].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));

        if (maxItems) {
            filteredProducts = filteredProducts.slice(0, maxItems);
        }

        if (filteredProducts.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100vw; color:#555;">No items available in this category.</p>';
            return;
        }

                const createCardHTML = (product) => {
            const isExternal = product.image && product.image.startsWith('http');
            const imgPath = isExternal ? product.image : `RSC/IMGS/${product.image}`;
            
            return `
                <div class="product-card glass" style="cursor: pointer;" onclick="window.location.href='product_detail.html?id=${product.id}'">
                    <div class="product-image-wrapper">
                        <div class="product-badge">Available</div>
                        <img src="${imgPath}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='RSC/IMGS/LOGO.png'">
                    </div>
                    <div class="product-info">
                        <span class="product-category">${product.category}</span>
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">LKR ${product.price}</div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); store.addToCart('${product.id}'); alert('Added to cart!')">Add to Cart</button>
                    </div>
                </div>
            `;
        };

        if (duplicateForScroll || containerId === 'new-arrivals-track') {
            container.innerHTML = '';
            const originalCards = filteredProducts.map(createCardHTML).join('');
            container.innerHTML = originalCards;
            
            if (duplicateForScroll && filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    const clone = document.createElement('div');
                    clone.innerHTML = createCardHTML(product);
                    const card = clone.firstElementChild;
                    card.setAttribute('data-clone', 'true');
                    container.appendChild(card);
                });
            }

            
            if (containerId === 'new-arrivals-track' || containerId === 'popular-track') {
                requestAnimationFrame(() => {
                    const PIXELS_PER_SECOND = 120; 
                    const halfWidth = container.scrollWidth / 2; 
                    const duration = Math.max(halfWidth / PIXELS_PER_SECOND, 5); 
                    container.style.animationDuration = duration + 's';
                });
            }

            return;
        }

        
        
        const existingCardsDOM = container.querySelectorAll('.product-card');
        existingCardsDOM.forEach(card => {
            const onclickAttr = card.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/id=([^']+)/);
                if (match) {
                    const domId = match[1];
                    const existsInStore = products.some(p => p.id === domId);
                    if (!existsInStore) {
                        card.remove(); // The admin deleted it!
                    }
                }
            }
        });

        // 2. Append NEW products that belong in this container but aren't in the DOM yet
        filteredProducts.forEach(product => {
            
            const alreadyInDOM = Array.from(container.querySelectorAll('.product-card')).some(card => {
                const attr = card.getAttribute('onclick') || '';
                return attr.includes(`id=${product.id}'`) || attr.includes(`id=${product.id}"`);
            });
            if (!alreadyInDOM && product.id) {
                container.insertAdjacentHTML('afterbegin', createCardHTML(product)); 
            }
        });
    };

    
    const popularTrack = document.getElementById('popular-track');
    if (popularTrack) {
        const popularItems = products.filter(p => p.isPopular === true);
        if (popularItems.length > 0) {
            const createPopCardHTML = (product) => {
                const isExternal = product.image && product.image.startsWith('http');
                const imgPath = isExternal ? product.image : `RSC/IMGS/${product.image}`;
                return `
                    <div class="product-card glass" style="cursor: pointer;" onclick="window.location.href='product_detail.html?id=${product.id}'">
                        <div class="product-image-wrapper">
                            <div class="product-badge">Featured</div>
                            <img src="${imgPath}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='RSC/IMGS/LOGO.png'">
                        </div>
                        <div class="product-info">
                            <span class="product-category">${product.category}</span>
                            <h3 class="product-title">${product.name}</h3>
                            <div class="product-price">LKR ${product.price}</div>
                            <button class="add-to-cart-btn" onclick="event.stopPropagation(); store.addToCart('${product.id}'); alert('Added to cart!')">Add to Cart</button>
                        </div>
                    </div>
                `;
            };
            
            popularTrack.innerHTML = popularItems.map(createPopCardHTML).join('');
            
            popularItems.forEach(product => {
                const clone = document.createElement('div');
                clone.innerHTML = createPopCardHTML(product);
                const card = clone.firstElementChild;
                card.setAttribute('data-clone', 'true');
                popularTrack.appendChild(card);
            });
        }
    }

    
    const applySmartScroll = (trackEl) => {
        if (!trackEl) return;
        requestAnimationFrame(() => {
            const wrapper = trackEl.closest('.slider-wrapper');
            const wrapperWidth = wrapper ? wrapper.offsetWidth : window.innerWidth;
            
            const originals = trackEl.querySelectorAll('.product-card:not([data-clone])');
            let originalsWidth = 0;
            originals.forEach(c => { originalsWidth += c.offsetWidth + 32; }); 
            if (originalsWidth <= wrapperWidth) {
                
                trackEl.querySelectorAll('[data-clone]').forEach(c => c.remove());
                trackEl.style.animationName = 'none';
                trackEl.style.justifyContent = 'center';
                trackEl.style.width = 'auto';
            } else {
                
                trackEl.style.animationName = '';
                trackEl.style.justifyContent = '';
                trackEl.style.width = '';
                const PIXELS_PER_SECOND = 120;
                const duration = Math.max(originalsWidth / PIXELS_PER_SECOND, 5);
                trackEl.style.animationDuration = duration + 's';
                trackEl.style.animationPlayState = 'running';
            }
        });
    };

    
});

function updateCartBadge() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('fandomCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (totalItems > 0) {
            cartCount.innerText = totalItems;
            cartCount.style.display = 'inline-block';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

function checkLoginStatus() {
    
    fetch('php/auth/check_session.php')
        .then(r => r.json())
        .then(data => {
            if (data.loggedIn && data.user) {
                
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                _applyLoginUI(data.user);
            } else {
                
                localStorage.removeItem('currentUser');
            }
        })
        .catch(() => {
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.name) _applyLoginUI(currentUser);
        });
}

function _applyLoginUI(user) {
    const navRight  = document.querySelector('.nav-icons');
    const loginIcon = document.getElementById('nav-auth-link');
    const adminLink = document.getElementById('nav-admin-link');

    if (loginIcon) loginIcon.style.display = 'none';

    if (user.role === 'admin' && adminLink) {
        adminLink.style.display = 'inline';
    }

    
    if (document.getElementById('nav-welcome-msg')) return;

    const welcomeMsg = document.createElement('a');
    welcomeMsg.id          = 'nav-welcome-msg';
    welcomeMsg.innerText   = `Hi, ${user.name}`;
    welcomeMsg.href        = user.role === 'admin' ? 'admin_dashboard.html' : 'profile.html';
    welcomeMsg.title       = 'Go to Profile';
    welcomeMsg.style.cssText = 'margin-right:15px;font-weight:bold;color:#fff;text-decoration:none;';

    if (navRight) navRight.prepend(welcomeMsg);

    const sidebarProfile = document.getElementById('sidebar-profile-link');
    if (sidebarProfile) sidebarProfile.style.display = 'block';
}

window.store = {
    addToCart: function (productId) {
        
        const products = window._fandomProducts && window._fandomProducts.length > 0
            ? window._fandomProducts
            : (JSON.parse(localStorage.getItem('fandomProducts')) || []);
        const product = products.find(p => p.id === productId);

        if (!product) {
            console.error("Product not found:", productId);
            return;
        }

        const cartItem = {
            cartItemId: Date.now().toString() + Math.random().toString(36).substring(2, 5),
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            size: 'Standard',
            material: 'Standard',
            delivery: 'Standard Delivery',
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

        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id) {
            const fd = new FormData();
            fd.append('productId', productId);
            fd.append('quantity',  1);
            fd.append('size',      'Standard');
            fd.append('material',  'Standard');
            fd.append('delivery',  'Standard Delivery');
            fetch('php/cart/update_cart.php', { method: 'POST', body: fd })
                .catch(err => console.warn('Cart DB sync failed:', err));
        }

        if (typeof updateCartBadge === 'function') updateCartBadge();
    }
};

function doSearch(query) {
    const overlay = document.getElementById('search-results-overlay');
    if (!query || query.length < 2) {
        overlay.style.display = 'none';
        return;
    }

    
    const products = window._fandomProducts && window._fandomProducts.length > 0
        ? window._fandomProducts
        : (JSON.parse(localStorage.getItem('fandomProducts')) || []);

    
    const results = products.filter(p => {
        const source = (p.name + " " + p.category + " " + (p.keywords || "")).toLowerCase();
        return source.includes(query.toLowerCase());
    });

    if (results.length === 0) {
        overlay.innerHTML = `<div style="padding: 20px; text-align: center; color: #aaa;">No products found for "${query}"</div>`;
    } else {
        overlay.innerHTML = results.map(p => {
            const isExternal = p.image && p.image.startsWith('http');
            const imgSrc = isExternal ? p.image : "RSC/IMGS/" + p.image;
            return `
                <div class="search-result-item" onclick="window.location.href='product_detail.html?id=${p.id}'">
                    <img src="${imgSrc}" alt="${p.name}">
                    <div class="search-result-info">
                        <strong>${p.name}</strong>
                        <span>${p.category} | LKR ${p.price}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    overlay.style.display = 'block';
}
