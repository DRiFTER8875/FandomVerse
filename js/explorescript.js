
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

function toggleCategory(gridId, btn) {
    const grid = document.getElementById(gridId);
    
    if (btn.innerText === "Show All") {
        
        
        
        const itemsToAdd = extraImages[gridId];
        
        if (itemsToAdd) {
            itemsToAdd.forEach(item => {
                
                const link = document.createElement("a");
                link.href = item.link;
                link.classList.add("explore-link", "extra-item"); 

                
                const box = document.createElement("div");
                box.classList.add("box", "slide-in");
                box.innerHTML = `<img src="${item.src}" alt="Image">`;

                link.appendChild(box);
                grid.appendChild(link);
            });
            
            
            btn.innerText = "Show Less";
        }
    } else {
        
        
        
        const extraItems = grid.querySelectorAll(".extra-item");
        
        
        extraItems.forEach(item => item.remove());
        
        
        btn.innerText = "Show All";
        
        
        
        
    }
}