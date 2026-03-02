// checkout.js - logic moved from checkout.ejs
const cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCheckoutReview() {
  const orderReview = document.getElementById('orderReview');
  const summaryItems = document.getElementById('summaryItems');

  const itemsHTML = cart.map(item => `
    <div class="review-item">
      <div class="review-item-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="review-item-info">
        <div class="review-item-name">${item.name}</div>
        <div class="review-item-price">₹${item.price.toLocaleString()} × ${item.quantity}</div>
      </div>
    </div>
  `).join('');

  orderReview.innerHTML = itemsHTML;
  summaryItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${item.name} (${item.quantity})</span>
      <span>₹${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - (subtotal * 0.1) + 50;
  document.getElementById('summaryTotal').textContent = total.toLocaleString();
}

function setButtonLoading(on) {
  const placeBtn = document.getElementById('placeOrderBtn');
  if (on) placeBtn.classList.add('loading');
  else placeBtn.classList.remove('loading');
}

// event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('placeOrderBtn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }

    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (!fullName || !phone || !street || !city || !state || !pincode) {
      alert('Please fill all address fields');
      return;
    }

    let paymentDetails = null;
    if (paymentMethod === 'Credit Card') {
      const cardHolder = document.getElementById('cardHolder').value.trim();
      const cardNumber = document.getElementById('cardNumber').value.trim();
      const cardExpiry = document.getElementById('cardExpiry').value.trim();
      const cardCvv = document.getElementById('cardCvv').value.trim();

      if (!cardHolder || !cardNumber || !cardExpiry || !cardCvv) {
        alert('Please fill all credit card details');
        return;
      }

      if (cardNumber.replace(/\s+/g, '').length < 16) {
        alert('Invalid card number');
        return;
      }

      paymentDetails = { cardHolder, cardNumber, expiry: cardExpiry };
    } else if (paymentMethod === 'UPI') {
      const upiId = document.getElementById('upiId').value.trim();
      if (!upiId) {
        alert('Please enter your UPI ID');
        return;
      }
      paymentDetails = { upiId };
    }

    const shippingAddress = { name: fullName, phone, street, city, state, pincode };
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.round(subtotal * 0.1);
    const deliveryFee = 50;
    const totalAmount = subtotal;

    try {
      setButtonLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          totalAmount,
          discount,
          deliveryFee,
          shippingAddress,
          paymentMethod,
          ...(paymentDetails && { paymentDetails }),
        }),
      });

      if (response.status === 401) {
        setButtonLoading(false);
        alert('Session expired or invalid. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/auth';
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Order placed successfully');
        localStorage.removeItem('cart');
        window.location.href = `/order-success/${data.data._id}`;
      } else {
        setButtonLoading(false);
        alert(data.message || 'Unable to place order');
      }
    } catch (err) {
      setButtonLoading(false);
      alert('Failed to place order: ' + err.message);
    }
  });

  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const cardSection = document.getElementById('cardDetails');
      const upiSection = document.getElementById('upiDetails');
      if (radio.value === 'Credit Card' && radio.checked) {
        cardSection.style.display = 'block';
      } else {
        cardSection.style.display = 'none';
      }
      if (radio.value === 'UPI' && radio.checked) {
        upiSection.style.display = 'block';
      } else {
        upiSection.style.display = 'none';
      }
    });
  });

  renderCheckoutReview();
});