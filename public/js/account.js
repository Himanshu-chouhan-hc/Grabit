const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/auth';
}

const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('userName').textContent = user.name;
document.getElementById('userEmail').textContent = user.email;
document.getElementById('profileName').value = user.name;
document.getElementById('profileEmail').value = user.email;

// Load orders
async function loadOrders() {
  try {
    const response = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();

    if (data.success) {
      const ordersContainer = document.getElementById('ordersContainer');
      ordersContainer.innerHTML = data.data.map(order => `
        <div class="order-card">
          <div class="order-header">
            <span class="order-number">${order.orderNumber}</span>
            <span class="order-status ${order.orderStatus.toLowerCase().replace(/ /g, '-')}">${order.orderStatus}</span>
          </div>
          <div class="order-info">
            <span>₹${order.finalAmount.toLocaleString()}</span>
            <span>${new Date(order.orderDate).toLocaleDateString('en-IN')}</span>
            <span>${order.items.length} items</span>
          </div>
        </div>
      `).join('') || '<p>No orders yet</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

// Menu navigation
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', (e) => {
    if (!item.querySelector('i')?.classList.contains('fa-sign-out-alt')) {
      e.preventDefault();
      const section = item.dataset.section;
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(section).classList.add('active');
      loadOrders();
    }
  });
});

function saveProfile() {
  const name = document.getElementById('profileName').value;
  const phone = document.getElementById('profilePhone').value;

  fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        alert('Profile updated');
        localStorage.setItem('user', JSON.stringify({ ...user, name }));
      }
    });
}

function showAddAddressForm() {
  document.getElementById('addAddressForm').style.display = 'flex';
}

function hideAddAddressForm() {
  document.getElementById('addAddressForm').style.display = 'none';
}

function saveAddress() {
  const name = document.getElementById('addressName').value;
  const street = document.getElementById('addressStreet').value;
  const city = document.getElementById('addressCity').value;
  const state = document.getElementById('addressState').value;
  const pincode = document.getElementById('addressPincode').value;

  fetch('/api/auth/address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, street, city, state, pincode }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        hideAddAddressForm();
        alert('Address saved');
      }
    });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Picture upload
const pictureInput = document.getElementById('profilePictureInput');
if (pictureInput) {
  pictureInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Uploading file:', file.name);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/upload-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Update localStorage with new picture
        const user = JSON.parse(localStorage.getItem('user'));
        user.profileImage = data.profileImage;
        localStorage.setItem('user', JSON.stringify(user));
        
        alert('Picture updated!');
        location.reload();
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    }
  });
}

// Load user avatar on page load
function loadUserAvatar() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.profileImage) {
    const img = document.getElementById('userAvatarImg');
    img.src = user.profileImage;
    img.style.display = 'block';
    document.getElementById('userAvatarIcon').style.display = 'none';
  }
}

loadUserAvatar();
loadOrders();
