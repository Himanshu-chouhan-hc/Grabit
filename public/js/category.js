// category.js - category page functions
function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.productId === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            productId: id, 
            name, 
            price, 
            image: event.target.closest('.product-card').querySelector('img').src,
            quantity: 1 
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show success message
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check me-1"></i> Added!';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function filterByPrice() {
    const min = parseFloat(document.getElementById('minPrice').value) || 0;
    const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const priceText = card.querySelector('.current-price').textContent;
        const price = parseFloat(priceText.replace('₹', ''));
        
        if (price >= min && price <= max) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByRating() {
    const selectedRatings = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        selectedRatings.push(parseInt(cb.value));
    });

    if (selectedRatings.length === 0) {
        document.querySelectorAll('.product-card').forEach(card => card.style.display = 'block');
        return;
    }

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const ratingStars = card.querySelectorAll('.fa-star').length;
        const matches = selectedRatings.some(r => ratingStars >= r);
        card.style.display = matches ? 'block' : 'none';
    });
}

// Update cart count on page load
window.addEventListener('DOMContentLoaded', updateCartCount);
