function changeImage(img) {
  document.getElementById('mainImage').src = img.src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  img.classList.add('active');
}

function loadReviews() {
  const reviewsList = document.getElementById('reviewsList');
  const reviews = productReviews || [];
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No reviews yet.</p>';
    return;
  }

  reviewsList.innerHTML = reviews.map(review => {
    const reviewerId = review.reviewerId || review.reviewer?._id || review.reviewer;
    const currentUserId = currentUser.id || currentUser._id;
    const isOwner = currentUserId && reviewerId && currentUserId === reviewerId;

    return `
      <div class="review-item" style="padding: 16px; border-bottom: 1px solid #e0e0e0; display: flex; gap: 16px;">
        <div style="flex-shrink: 0;">
          ${review.reviewerImage ? 
            `<img src="${review.reviewerImage}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />` :
            `<div style="width: 48px; height: 48px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center;"><i class="fas fa-user"></i></div>`
          }
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <strong>${review.reviewer || 'Anonymous'}</strong>
              <span style="color: #fb641b;">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
              </span>
            </div>
            
            ${isOwner ? `
              <button onclick="deleteReview('${review._id}')" style="background:none; border:none; color:#999; cursor:pointer;">
                <i class="fas fa-trash-alt"></i>
              </button>
            ` : ''}
          </div>
          <p style="color: #666; margin: 8px 0; font-size: 14px;">${review.comment}</p>
          <small style="color: #999;">${new Date(review.date).toLocaleDateString()}</small>
        </div>
      </div>
    `;
  }).join('');
}

async function deleteReview(reviewId) {
  if (!confirm('you want to delete review')) return;

  const token = localStorage.getItem('token');
  const productId = document.querySelector('[data-product-id]').dataset.productId;

  try {
    const response = await fetch(`/api/products/${productId}/review/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('Review was deleted successfully.');
      location.reload();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    alert('Server error: Review delete nahi ho paya.');
  }
}

function addToCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const product = {
    productId: document.querySelector('[data-product-id]').dataset.productId,
    name: document.querySelector('[data-product-name]').dataset.productName,
    price: parseInt(document.querySelector('[data-product-price]').dataset.productPrice),
    image: document.querySelector('[data-product-image]').dataset.productImage,
    quantity: 1,
  };

  const existing = cart.find(item => item.productId === product.productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
  btn.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.backgroundColor = '';
  }, 2000);
}

function submitReview() {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const comment = document.getElementById('reviewText').value;

  if (!rating || !comment) {
    alert('Please fill all fields');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/auth';
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const productId = document.querySelector('[data-product-id]').dataset.productId;

  console.log('Submitting review:', { rating, comment, reviewer: user.name });

  fetch(`/api/products/${productId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      rating: parseInt(rating), 
      comment, 
      reviewer: user.name || 'User',
      reviewerId: user.id || user._id,
      reviewerImage: user.profileImage
    }),
  })
    .then(r => r.json())
    .then(data => {
      console.log('Review submission response:', data);
      if (data.success) {
        alert('Review submitted! Reloading...');
        setTimeout(() => {
          location.reload();
        }, 500);
      } else {
        alert('Failed: ' + (data.message || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error('Review submission error:', err);
      alert('Error: ' + err.message);
    });
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartBadge = document.querySelector('.cart-count');
  if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadReviews();
  updateCartCount();
});
