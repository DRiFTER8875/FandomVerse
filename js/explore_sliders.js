function slideSlider(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        // Calculate scroll distance based on one card width + gap
        const cardWidth = slider.querySelector('.product-card').offsetWidth;
        const gap = 24; // 1.5rem = 24px default
        const scrollAmount = cardWidth + gap;

        slider.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}
