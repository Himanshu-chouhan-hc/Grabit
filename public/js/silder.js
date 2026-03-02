let counter = 1;
let autoSlideInterval;

function initSlider() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const images = document.querySelectorAll('.slider-wrapper img');

    if (images.length > 0) {
        const size = window.innerWidth;

        // Clone first and last image for infinite effect
        const firstImageClone = images[0].cloneNode(true);
        const lastImageClone = images[images.length - 1].cloneNode(true);

        firstImageClone.id = 'lastClone';
        lastImageClone.id = 'firstClone';

        sliderWrapper.appendChild(firstImageClone);
        sliderWrapper.insertBefore(lastImageClone, sliderWrapper.firstChild);

        // Initial position
        sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';

        startAutoSlide();
    }
}

function nextSlide() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const allImages = document.querySelectorAll('.slider-wrapper img');
    const size = window.innerWidth;

    sliderWrapper.style.transition = "transform 0.6s ease-in-out";
    counter++;
    sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';

    setTimeout(() => {
        if (counter === allImages.length - 1) {
            sliderWrapper.style.transition = "none";
            counter = 1;
            sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';
        }
        updateDots();
    }, 600);

    resetAutoSlide();
}

function prevSlide() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const allImages = document.querySelectorAll('.slider-wrapper img');
    const size = window.innerWidth;

    sliderWrapper.style.transition = "transform 0.6s ease-in-out";
    counter--;
    sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';

    setTimeout(() => {
        if (counter === 0) {
            sliderWrapper.style.transition = "none";
            counter = allImages.length - 2;
            sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';
        }
        updateDots();
    }, 600);

    resetAutoSlide();
}

function goToSlide(n) {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const allImages = document.querySelectorAll('.slider-wrapper img');
    const size = window.innerWidth;

    counter = n + 1;
    sliderWrapper.style.transition = "transform 0.6s ease-in-out";
    sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';

    updateDots();
    resetAutoSlide();
}

function updateDots() {
    const dots = document.querySelectorAll('.slider-dot');
    const images = document.querySelectorAll('.slider-wrapper img');
    const actualIndex = (counter - 1) % (images.length - 2);

    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[actualIndex]) {
        dots[actualIndex].classList.add('active');
    }
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        const sliderWrapper = document.querySelector('.slider-wrapper');
        const allImages = document.querySelectorAll('.slider-wrapper img');
        const size = window.innerWidth;

        sliderWrapper.style.transition = "transform 0.6s ease-in-out";
        counter++;
        sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';

        setTimeout(() => {
            if (counter === allImages.length - 1) {
                sliderWrapper.style.transition = "none";
                counter = 1;
                sliderWrapper.style.transform = 'translateX(' + (-size * counter) + 'px)';
            }
            updateDots();
        }, 600);
    }, 3000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

document.addEventListener('DOMContentLoaded', initSlider);


