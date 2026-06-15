let counter = 1;
let autoSlideInterval;
let sliderWrapper, allImages, size;
let isCloned = false;
let resizeTimeout;

function initSlider() {
    sliderWrapper = document.querySelector('.slider-wrapper');
    const images = document.querySelectorAll('.slider-wrapper img');
    
    console.log('Slider init - images found:', images.length);
    
    if (!sliderWrapper || images.length === 0) {
        console.log('Slider wrapper or images not found');
        return;
    }

    // Only clone if not already cloned
    if (!isCloned) {
        // 1. Clone First and Last Images
        const firstClone = images[0].cloneNode(true);
        const lastClone = images[images.length - 1].cloneNode(true);

        firstClone.id = 'lastClone';
        lastClone.id = 'firstClone';

        sliderWrapper.appendChild(firstClone);
        sliderWrapper.insertBefore(lastClone, sliderWrapper.firstChild);
        
        isCloned = true;
    }

    // 2. Update references
    allImages = document.querySelectorAll('.slider-wrapper img');
    
    // 3. Get width
    size = sliderWrapper.clientWidth || window.innerWidth;
    console.log('Slider size:', size);
    
    allImages.forEach(image => {
        image.style.width = `${size}px`;
        image.style.minWidth = `${size}px`;
        image.style.height = 'auto';
    });
    sliderWrapper.style.width = `${size * allImages.length}px`;
    sliderWrapper.style.height = '100%';

    // 4. Position
    sliderWrapper.style.transition = "none";
    sliderWrapper.style.transform = `translateX(${-size * counter}px)`;

    // 5. Listener for infinite loop effect
    if (!sliderWrapper._hasTransitionListener) {
        sliderWrapper.addEventListener('transitionend', () => {
            if (allImages[counter] && allImages[counter].id === 'lastClone') {
                sliderWrapper.style.transition = "none";
                counter = 1;
                sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
            }
            if (allImages[counter] && allImages[counter].id === 'firstClone') {
                sliderWrapper.style.transition = "none";
                counter = allImages.length - 2;
                sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
            }
            updateDots();
        });
        sliderWrapper._hasTransitionListener = true;
    }

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
    let activeIndex = Math.max(0, Math.min(allImages.length - 3, counter - 1));
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

function goToSlide(index) {
    const target = Number(index);
    if (!allImages || isNaN(target) || target < 0 || target >= allImages.length - 2) return;
    counter = target + 1;
    sliderWrapper.style.transition = 'transform 0.6s ease-in-out';
    sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
    updateDots();
    resetAutoSlide();
}

function adjustSliderSize() {
    if (!sliderWrapper || !allImages || allImages.length === 0) return;
    
    const newSize = sliderWrapper.clientWidth;
    
    // Only update if size has actually changed
    if (newSize === size) return;
    
    size = newSize;
    allImages.forEach(image => {
        image.style.width = `${size}px`;
        image.style.minWidth = `${size}px`;
    });
    sliderWrapper.style.width = `${size * allImages.length}px`;
    sliderWrapper.style.transition = 'none';
    sliderWrapper.style.transform = `translateX(${-size * counter}px)`;
}

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Initialize slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing slider');
    
    // Wait for images to load
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const images = sliderContainer.querySelectorAll('.slider-wrapper img');
        console.log('Found images:', images.length);
        let loadedCount = 0;
        
        if (images.length === 0) {
            console.log('No images found, trying again with timeout');
            setTimeout(() => {
                initSlider();
            }, 500);
            return;
        }
        
        images.forEach((img, index) => {
            console.log('Image', index, '- complete:', img.complete, 'src:', img.src);
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    console.log('Image loaded:', loadedCount, '/', images.length);
                    if (loadedCount === images.length) {
                        initSlider();
                    }
                });
                img.addEventListener('error', (e) => {
                    loadedCount++;
                    console.log('Image error:', e);
                    if (loadedCount === images.length) {
                        initSlider();
                    }
                });
            }
        });
        
        if (loadedCount === images.length) {
            console.log('All images already loaded, initializing slider');
            initSlider();
        } else {
            // Fallback timeout
            setTimeout(() => {
                console.log('Fallback initialization - loaded:', loadedCount, 'total:', images.length);
                initSlider();
            }, 1000);
        }
    } else {
        console.log('Slider container not found');
    }
});

// Debounced resize handler
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        adjustSliderSize();
    }, 250);
});