// Data source for extra items
const extraImages = {
  "all-merch-grid": [
    { src: "RSC/IMGS/ghost.jpg", link: "#" },
    { src: "RSC/IMGS/codMW.jpg", link: "#" },
    { src: "RSC/IMGS/nfs.jpg", link: "#" },
    { src: "RSC/IMGS/figures.png", link: "#" },
    { src: "RSC/IMGS/gekko.jpg", link: "#" }
  ],
  "popular-anime-grid": [
    { src: "RSC/IMGS/ghost.jpg", link: "#" },
    { src: "RSC/IMGS/codMW.jpg", link: "#" },
    { src: "RSC/IMGS/nfs.jpg", link: "#" },
    { src: "RSC/IMGS/figures.png", link: "#" },
    { src: "RSC/IMGS/gekko.jpg", link: "#" }
  ],
  "popular-games-grid": [
    { src: "RSC/IMGS/ghost.jpg", link: "#" },
    { src: "RSC/IMGS/codMW.jpg", link: "#" },
    { src: "RSC/IMGS/nfs.jpg", link: "#" },
    { src: "RSC/IMGS/figures.png", link: "#" },
    { src: "RSC/IMGS/gekko.jpg", link: "#" }
  ],
  "popular-movies-grid": [
    { src: "RSC/IMGS/ghost.jpg", link: "#" },
    { src: "RSC/IMGS/codMW.jpg", link: "#" },
    { src: "RSC/IMGS/nfs.jpg", link: "#" },
    { src: "RSC/IMGS/figures.png", link: "#" },
    { src: "RSC/IMGS/gekko.jpg", link: "#" }
  ]
};

// Toggle Function
function toggleCategory(gridId, btn) {
    const grid = document.getElementById(gridId);
    
    if (btn.innerText === "Show All") {
        // --- EXPAND LOGIC ---
        
        // 1. Get data for this category
        const itemsToAdd = extraImages[gridId];
        
        if (itemsToAdd) {
            itemsToAdd.forEach(item => {
                // Create link
                const link = document.createElement("a");
                link.href = item.link;
                link.classList.add("explore-link", "extra-item"); // 'extra-item' marks it for removal later

                // Create image box
                const box = document.createElement("div");
                box.classList.add("box", "slide-in");
                box.innerHTML = `<img src="${item.src}" alt="Image">`;

                link.appendChild(box);
                grid.appendChild(link);
            });
            
            // 2. Change button text
            btn.innerText = "Show Less";
        }
    } else {
        // --- COLLAPSE LOGIC ---
        
        // 1. Find all items we added (marked with 'extra-item')
        const extraItems = grid.querySelectorAll(".extra-item");
        
        // 2. Remove them
        extraItems.forEach(item => item.remove());
        
        // 3. Change button text back
        btn.innerText = "Show All";
        
        // 4. Scroll slightly back to header so user isn't lost
        // (Optional nice-to-have UX)
        // btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}