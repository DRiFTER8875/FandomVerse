document.addEventListener("DOMContentLoaded", () => {
    // --- 0. INJECT SIDEBAR & HAMBURGER ---
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

    // --- 0b. INJECT SEARCH BAR ---
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


    // --- 2. CHECK LOGIN STATUS (PHP session) ---
    checkLoginStatus();

    // --- 2.5 LOAD PRODUCTS FROM PHP/MYSQL ---
    // We fetch from the PHP API; while loading we show a placeholder.
    // window._fandomProducts is used as the in-memory cache for search/render.
    let products = [];
    window._fandomProducts = [];

    // Kick off product fetch immediately (async), then render
    (async () => {
        try {
            const res  = await fetch('php/products/get_products.php');
            const data = await res.json();
            if (data.success && Array.isArray(data.products)) {
                products = data.products;
                window._fandomProducts = products;
                // Also mirror to localStorage for pages that still read it
                localStorage.setItem('fandomProducts', JSON.stringify(products));
            }
        } catch (err) {
            console.warn('PHP API unavailable, falling back to localStorage:', err);
            // Graceful fallback: use whatever is in localStorage
            products = JSON.parse(localStorage.getItem('fandomProducts')) || [];
            window._fandomProducts = products;
        }

        // Dummy block to satisfy old code path that used initialProducts = [
          {
                    id: "prod_1",
                    name: "Gojo Figure",
                    price: "3500.00",
                    category: "Anime",
                    subCategory: "Figure",
                    image: "gojo figure.webp",
                    stock: 15
          },
          {
                    id: "prod_2",
                    name: "One Piece - Monkey D. Luffy Poster",
                    price: "2400.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "luffy.png",
                    stock: 15
          },
          {
                    id: "prod_3",
                    name: "Dragon Ball - Goku Figure",
                    price: "4200.00",
                    category: "Anime",
                    subCategory: "Figure",
                    image: "goku figure.jpg",
                    stock: 15
          },
          {
                    id: "prod_4",
                    name: "Demon Slayer Poster",
                    price: "2150.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "DemonSlayer.png",
                    stock: 15
          },
          {
                    id: "prod_5",
                    name: "Naruto Figure",
                    price: "3850.00",
                    category: "Anime",
                    subCategory: "Figure",
                    image: "naruto figure.jpg",
                    stock: 15
          },
          {
                    id: "prod_6",
                    name: "Your Name Poster",
                    price: "2200.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "Yourname.png",
                    stock: 15
          },
          {
                    id: "prod_7",
                    name: "Chainsaw Man - Makima Poster",
                    price: "2300.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "Makima.png",
                    stock: 15
          },
          {
                    id: "prod_8",
                    name: "Attack on Titan Poster",
                    price: "2250.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "AOT.png",
                    stock: 15
          },
          {
                    id: "prod_9",
                    name: "Dragon Ball Super Poster",
                    price: "2100.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "DB.png",
                    stock: 15
          },
          {
                    id: "prod_10",
                    name: "Horimiya Poster",
                    price: "2400.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "Horimiya.png",
                    stock: 15
          },
          {
                    id: "prod_11",
                    name: "Naruto Poster",
                    price: "2200.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "Naruto.png",
                    stock: 15
          },
          {
                    id: "prod_12",
                    name: "Darling in the Franxx - Zero Two Poster",
                    price: "2350.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "ZeroTwo.png",
                    stock: 15
          },
          {
                    id: "prod_13",
                    name: "RDR 2 - Arthur Morgan Poster",
                    price: "2600.00",
                    category: "Games",
                    subCategory: "Poster",
                    image: "Arthur rdr.png",
                    stock: 15
          },
          {
                    id: "prod_14",
                    name: "Call of Duty - Captain Price",
                    price: "2800.00",
                    category: "Games",
                    subCategory: "Merch",
                    image: "Captain price.png",
                    stock: 15
          },
          {
                    id: "prod_15",
                    name: "The Witcher 3 - Cirilla of Cintra",
                    price: "2500.00",
                    category: "Games",
                    subCategory: "Merch",
                    image: "Ciri.png",
                    stock: 15
          },
          {
                    id: "prod_16",
                    name: "GTA San Andreas - CJ Poster",
                    price: "2400.00",
                    category: "Games",
                    subCategory: "Poster",
                    image: "CJ.png",
                    stock: 15
          },
          {
                    id: "prod_17",
                    name: "Detroit Become Human - Connor Poster",
                    price: "2300.00",
                    category: "Games",
                    subCategory: "Poster",
                    image: "Connor.png",
                    stock: 15
          },
          {
                    id: "prod_18",
                    name: "God of War - Kratos Figure",
                    price: "4800.00",
                    category: "Games",
                    subCategory: "Figure",
                    image: "kratos figure.avif",
                    stock: 15
          },
          {
                    id: "prod_19",
                    name: "The Witcher 3 - Geralt of Rivia",
                    price: "2900.00",
                    category: "Games",
                    subCategory: "Merch",
                    image: "Geralt.png",
                    stock: 15
          },
          {
                    id: "prod_20",
                    name: "Ghost of Tsushima Poster",
                    price: "2550.00",
                    category: "Games",
                    subCategory: "Poster",
                    image: "ghost.jpg",
                    stock: 15
          },
          {
                    id: "prod_21",
                    name: "Call of Duty - Ghost Poster",
                    price: "2450.00",
                    category: "Games",
                    subCategory: "Poster",
                    image: "Ghost.png",
                    stock: 15
          },
          {
                    id: "prod_22",
                    name: "RDR - John Marston Poster",
                    price: "2350.00",
                    category: "Games",
                    subCategory: "Poster",
                    image: "John rdr.png",
                    stock: 15
          },
          {
                    id: "prod_23",
                    name: "Call of Duty - Ghost Figure",
                    price: "4950.00",
                    category: "Games",
                    subCategory: "Figure",
                    image: "ghost figure.webp",
                    stock: 15
          },
          {
                    id: "prod_24",
                    name: "Ben 10 Poster",
                    price: "2100.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "ben10.jpg",
                    stock: 15
          },
          {
                    id: "prod_25",
                    name: "Avatar the Last Airbender Poster",
                    price: "2200.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "avatar.jpg",
                    stock: 15
          },
          {
                    id: "prod_26",
                    name: "Regular Show - Mordakai and Rigby Poster",
                    price: "2300.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "regular show.jpg",
                    stock: 15
          },
          {
                    id: "prod_27",
                    name: "Ben 10 - Monster Kevin 11 Figure",
                    price: "3500.00",
                    category: "Cartoon",
                    subCategory: "Figure",
                    image: "kevin11 figure.avif",
                    stock: 15
          },
          {
                    id: "prod_28",
                    name: "Avatar The Last Airbender Poster",
                    price: "2400.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "avatar1.jpg",
                    stock: 15
          },
          {
                    id: "prod_29",
                    name: "Pink Panther Poster",
                    price: "2250.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "pink panther.jpg",
                    stock: 15
          },
          {
                    id: "prod_30",
                    name: "Oggy and the Cockroaches Poster",
                    price: "2150.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "oggy.jpg",
                    stock: 15
          },
          {
                    id: "prod_31",
                    name: "Tom and Jerry Poster",
                    price: "2200.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "tom and jerry.jpg",
                    stock: 15
          },
          {
                    id: "prod_32",
                    name: "Ben 10 - Swampfire Figure",
                    price: "3800.00",
                    category: "Cartoon",
                    subCategory: "Figure",
                    image: "swampfire figure.webp",
                    stock: 15
          },
          {
                    id: "prod_33",
                    name: "Powerpuff Girls Poster",
                    price: "2400.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "powerpuff girls.jpg",
                    stock: 15
          },
          {
                    id: "prod_34",
                    name: "Regular Show Figure",
                    price: "3600.00",
                    category: "Cartoon",
                    subCategory: "Figure",
                    image: "regular show figure.webp",
                    stock: 15
          },
          {
                    id: "prod_35",
                    name: "Teen Titans Go Poster",
                    price: "2300.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "teen titans go.jpg",
                    stock: 15
          },
          {
                    id: "prod_36",
                    name: "Adventure Time Poster",
                    price: "2250.00",
                    category: "Cartoon",
                    subCategory: "Poster",
                    image: "adventure time.jpg",
                    stock: 15
          },
          {
                    id: "prod_37",
                    name: "Iron Man Figure",
                    price: "4900.00",
                    category: "Movies",
                    subCategory: "Figure",
                    image: "iron man figure.jfif",
                    stock: 15
          },
          {
                    id: "prod_38",
                    name: "Game of Thrones - John Snow Poster",
                    price: "2450.00",
                    category: "TV Shows",
                    subCategory: "Poster",
                    image: "johnsnow.png",
                    stock: 15
          },
          {
                    id: "prod_39",
                    name: "Superman Poster",
                    price: "2100.00",
                    category: "TV Shows",
                    subCategory: "Poster",
                    image: "Super man.png",
                    stock: 15
          },
          {
                    id: "prod_40",
                    name: "Breaking Bad - Walter White(Heisenberge) Poster",
                    price: "2500.00",
                    category: "TV Shows",
                    subCategory: "Poster",
                    image: "Walter.png",
                    stock: 15
          },
          {
                    id: "prod_41",
                    name: "Iron Man Poster",
                    price: "2400.00",
                    category: "Movies",
                    subCategory: "Poster",
                    image: "iron man.webp",
                    stock: 15
          },
          {
                    id: "prod_42",
                    name: "Stranger Things Poster",
                    price: "2350.00",
                    category: "Movies",
                    subCategory: "Poster",
                    image: "stranger things.jpg",
                    stock: 15
          },
          {
                    id: "prod_43",
                    name: "My DressUp Darling - Marin",
                    price: "4500.00",
                    category: "Anime",
                    subCategory: "Merch",
                    image: "Figure.jpg",
                    stock: 15
          },
          {
                    id: "prod_44",
                    name: "One Piece Poster - Monkey D. Luffy",
                    price: "2199.00",
                    category: "Anime",
                    subCategory: "Poster",
                    image: "luffy.png",
                    stock: 15
          },
          {
                    id: "prod_45",
                    name: "RDR2 - Arthur Morgan",
                    price: "3800.00",
                    category: "Games",
                    subCategory: "Merch",
                    image: "Arthur rdr.png",
                    stock: 15
          },
          {
                    id: "prod_46",
                    name: "The Boys T-Shirt",
                    price: "2450.00",
                    category: "Movies & TV Shows",
                    subCategory: "Merch",
                    image: "MERCH.jpg",
                    stock: 15
          },
          {
                    id: "prod_47",
                    name: "Call of Duty - Ghost",
                    price: "2750.00",
                    category: "Games",
                    subCategory: "Merch",
                    image: "Ghost.png",
                    stock: 15
          },
          {
                    id: "prod_48",
                    name: "Arcane - Jinx Figure",
                    price: "4999.00",
                    category: "Movies & TV Shows",
                    subCategory: "Figure",
                    image: "jinxFigure.png",
                    stock: 15
          },
          {
                    id: "prod_49",
                    name: "League of Legends Jinx Action Figure",
                    price: "4200.00",
                    category: "Games",
                    subCategory: "Figure",
                    image: "https://images.unsplash.com/photo-1605114841961-da286d9a9235?w=600&h=800&fit=crop&q=80",
                    stock: 15
          },
          {
                    id: "prod_50",
                    name: "Call of Duty: Ghost Skull Premium T-Shirt",
                    price: "2950.00",
                    category: "Games",
                    subCategory: "Merch",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&q=80",
                    stock: 15
          },
          {
                    id: "prod_51",
                    name: "Spider-Man Vintage Comic Poster",
                    price: "3500.00",
                    category: "Movies",
                    subCategory: "Poster",
                    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&h=800&fit=crop&q=80",
                    stock: 15
          }
];
        // (end of dummy block — product data now comes from DB)
        ];

        // --- RENDER after products loaded ---
        updateCartBadge();

        // --- DYNAMIC MOST POPULAR (only items flagged by admin) ---
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

        // Render index.html newest arrivals track
        renderProductsToContainer('new-arrivals-track', null, null, true);
        applySmartScroll(document.getElementById('new-arrivals-track'));
        applySmartScroll(document.getElementById('popular-track'));

        // Render Explore.html categories
        renderProductsToContainer('slider-new-arrivals', null, 25, false);
        renderProductsToContainer('slider-anime',   p => p.category === 'Anime', null, false);
        renderProductsToContainer('slider-games',   p => p.category === 'Games', null, false);
        renderProductsToContainer('slider-cartoon', p => p.category === 'Cartoons' || p.category === 'Cartoon', null, false);
        renderProductsToContainer('slider-movies',  p => p.category === 'Movies/TV Series' || p.category === 'Movies' || p.category === 'Movies & TV Shows' || p.category === 'TV Shows', null, false);
    })(); // end async IIFE

    // placeholder so the synchronous code below doesn't crash before IIFE resolves
    if (false) { const _placeholder = [

    } // end placeholder if-block

    // --- 3. DYNAMIC PRODUCTS GENERATION ---
    // Reusable function to render products into a specific container
    const renderProductsToContainer = (containerId, filterFn, maxItems = null, duplicateForScroll = false) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        let filteredProducts = products;
        if (filterFn) {
            filteredProducts = products.filter(filterFn);
        }
        
        // Sort by dateAdded descending: admin-added items appear first.
        // Legacy products without dateAdded fall to the end (treated as timestamp 0).
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
            // Add clones for infinite marquee (marked so we can remove them if not needed)
            if (duplicateForScroll && filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    const clone = document.createElement('div');
                    clone.innerHTML = createCardHTML(product);
                    const card = clone.firstElementChild;
                    card.setAttribute('data-clone', 'true');
                    container.appendChild(card);
                });
            }

            // Fix speed: compute duration from actual pixel width so px/s is constant
            if (containerId === 'new-arrivals-track' || containerId === 'popular-track') {
                requestAnimationFrame(() => {
                    const PIXELS_PER_SECOND = 120; // constant scroll speed
                    const halfWidth = container.scrollWidth / 2; // width of one set
                    const duration = Math.max(halfWidth / PIXELS_PER_SECOND, 5); // min 5s
                    container.style.animationDuration = duration + 's';
                });
            }

            return;
        }

        // --- SMART DOM SYNC (Preserves Hardcoded HTML) ---
        // 1. Remove DOM cards whose products were deleted from the store
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
            // Avoid selecting by unescaped attributes, use more permissive check
            const alreadyInDOM = Array.from(container.querySelectorAll('.product-card')).some(card => {
                const attr = card.getAttribute('onclick') || '';
                return attr.includes(`id=${product.id}'`) || attr.includes(`id=${product.id}"`);
            });
            if (!alreadyInDOM && product.id) {
                container.insertAdjacentHTML('afterbegin', createCardHTML(product)); // Add new items to the front
            }
        });
    };

    // --- DYNAMIC MOST POPULAR (only items flagged by admin) ---
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
            // Add originals
            popularTrack.innerHTML = popularItems.map(createPopCardHTML).join('');
            // Add clones marked for removal if items fit on screen
            popularItems.forEach(product => {
                const clone = document.createElement('div');
                clone.innerHTML = createPopCardHTML(product);
                const card = clone.firstElementChild;
                card.setAttribute('data-clone', 'true');
                popularTrack.appendChild(card);
            });
        }
    }

    // --- SMART SCROLL: stop animation if items fit on screen ---
    const applySmartScroll = (trackEl) => {
        if (!trackEl) return;
        requestAnimationFrame(() => {
            const wrapper = trackEl.closest('.slider-wrapper');
            const wrapperWidth = wrapper ? wrapper.offsetWidth : window.innerWidth;
            // Measure only original (non-clone) cards
            const originals = trackEl.querySelectorAll('.product-card:not([data-clone])');
            let originalsWidth = 0;
            originals.forEach(c => { originalsWidth += c.offsetWidth + 32; }); // 32 = 2rem gap
            if (originalsWidth <= wrapperWidth) {
                // Items fit — remove clones, center, disable animation
                trackEl.querySelectorAll('[data-clone]').forEach(c => c.remove());
                trackEl.style.animationName = 'none';
                trackEl.style.justifyContent = 'center';
                trackEl.style.width = 'auto';
            } else {
                // Items overflow — keep clones, enable constant-speed marquee
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

    // (Rendering now happens inside the async IIFE above after products are fetched)
});

// --- HELPER FUNCTION: UPDATE CART BADGE ---
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

// --- CHECK LOGIN (PHP session-aware) ---
function checkLoginStatus() {
    // First try the PHP session (primary source of truth)
    fetch('php/auth/check_session.php')
        .then(r => r.json())
        .then(data => {
            if (data.loggedIn && data.user) {
                // Sync minimal info to localStorage for offline-UI use
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                _applyLoginUI(data.user);
            } else {
                // PHP says not logged in — also clear localStorage
                localStorage.removeItem('currentUser');
            }
        })
        .catch(() => {
            // Fallback: PHP not available (e.g. opened as file://)
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

    // Avoid duplicate welcome messages
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

// --- GLOBAL STORE FOR EXISTING EXPLORE PAGE ---
window.store = {
    addToCart: function (productId) {
        // Use in-memory cache first, then localStorage fallback
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

        // Always update localStorage cart (works for guests too)
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

        // If user is logged in, also sync to DB
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


// --- SEARCH LOGIC ---
function doSearch(query) {
    const overlay = document.getElementById('search-results-overlay');
    if (!query || query.length < 2) {
        overlay.style.display = 'none';
        return;
    }

    // Use in-memory cache (populated by PHP fetch) or localStorage fallback
    const products = window._fandomProducts && window._fandomProducts.length > 0
        ? window._fandomProducts
        : (JSON.parse(localStorage.getItem('fandomProducts')) || []);

    // Search in name, category, and keywords
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
