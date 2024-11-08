
document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.body; 
    let images = gallery.querySelectorAll('div[class^="img"]');
    let footer = gallery.querySelectorAll('footer')
    images = [...images, ...footer]
    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('dots');
    document.body.appendChild(dotsContainer);

    // Create dots
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => scrollToImage(index));
        dotsContainer.appendChild(dot);
    });

    const allDots = dotsContainer.querySelectorAll('.dot');

    function scrollToImage(index) {
        images[index].scrollIntoView({ behavior: 'smooth' });
    }

    function updateActiveDot() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        images.forEach((img, index) => {
            const imgTop = img.offsetTop;
            const imgBottom = imgTop + img.offsetHeight;

            if (scrollPosition >= imgTop - windowHeight / 2 && scrollPosition < imgBottom - windowHeight / 2) {
                allDots.forEach(dot => dot.classList.remove('active'));
                allDots[index].classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveDot);
    updateActiveDot();
});
