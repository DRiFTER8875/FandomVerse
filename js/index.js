document.addEventListener('DOMContentLoaded', () => {
    
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    if (heroSlides.length > 0) {
        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000); 
    }
});
