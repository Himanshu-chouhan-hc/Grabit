// cart.js - shopping cart functions
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const emptyCartDiv = document.getElementById('emptyCart');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '';
        emptyCartDiv.style.display = 'block';
        updatePriceSummary();
        return;
    }

    emptyCartDiv.style.display = 'none';
    cartItemsDiv.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" />
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">
                    <span class="current-price">₹${item.price.toLocaleString()}</span>
                    <span class="original-price">₹${(item.price * 1.4).toLocaleString()}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${idx}, -1)">−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${idx}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${idx})">Remove</button>
            </div>
        </div>
    `).join('');

    updatePriceSummary();
}

function updateQuantity(idx, change) {
    cart[idx].quantity += change;
    if (cart[idx].quantity <= 0) {
        removeFromCart(idx);
        return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function updatePriceSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.round(subtotal * 0.1);
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal - discount + deliveryFee;

    document.getElementById('itemCount').textContent = cart.length;
    document.getElementById('subtotal').textContent = subtotal.toLocaleString();
    document.getElementById('totalDiscount').textContent = discount.toLocaleString();
    document.getElementById('deliveryFee').textContent = deliveryFee > 0 ? '₹' + deliveryFee : 'FREE';
    document.getElementById('totalAmount').textContent = total.toLocaleString();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth';
            return;
        }
        window.location.href = '/checkout';
    });

    renderCart();
});
