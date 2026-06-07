function slideSlider(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        
        const card = slider.querySelector('.product-card');
        if (!card) return;
        const cardWidth = card.offsetWidth;
        const gap = 24; 
        const scrollAmount = cardWidth + gap;

        slider.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}
