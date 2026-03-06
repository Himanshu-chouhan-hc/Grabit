let counter = 1;
let autoSlideInterval;
let sliderWrapper, allImages, size;

function initSlider() {
    sliderWrapper = document.querySelector('.slider-wrapper');
    const images = document.querySelectorAll('.slider-wrapper img');
    
    if (!sliderWrapper || images.length === 0) return;

    // 1. Clone First and Last Images
    const firstClone = images[0].cloneNode(true);
    const lastClone = images[images.length - 1].cloneNode(true);

    firstClone.id = 'lastClone';
    lastClone.id = 'firstClone';

    sliderWrapper.appendChild(firstClone);
    sliderWrapper.insertBefore(lastClone, sliderWrapper.firstChild);

    // 2. Update references
    allImages = document.querySelectorAll('.slider-wrapper img');
    
    // 3. Get width
    size = sliderWrapper.clientWidth; 

    // 4. Position
    sliderWrapper.style.transition = "none";
    sliderWrapper.style.transform = `translateX(${-size * counter}px)`;

    // 5. MOVED: Listener inside init to avoid 'undefined' error
    sliderWrapper.addEventListener('transitionend', () => {
        if (allImages[counter].id === 'lastClone') {
            sliderWrapper.style.transition = "none";
            counter = 1;
            sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
        }
        if (allImages[counter].id === 'firstClone') {
            sliderWrapper.style.transition = "none";
            counter = allImages.length - 2;
            sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
        }
        updateDots();
    });

    startAutoSlide();
}

function nextSlide() {
    if (!allImages || counter >= allImages.length - 1) return;
    sliderWrapper.style.transition = "transform 0.6s ease-in-out";
    counter++;
    sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
    resetAutoSlide();
}

function prevSlide() {
    if (!allImages || counter <= 0) return;
    sliderWrapper.style.transition = "transform 0.6s ease-in-out";
    counter--;
    sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
    resetAutoSlide();
}

function updateDots() {
    const dots = document.querySelectorAll('.slider-dot');
    if (dots.length === 0) return;
    let activeIndex = counter - 1;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 3000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

window.addEventListener('load', initSlider);