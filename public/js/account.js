
// ================= AUTH CHECK =================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user) {
  window.location.href = '/auth';
}


// ================= AVATAR RENDER =================
function renderAvatar(user) {
  const img = document.getElementById('userAvatarImg');
  const icon = document.getElementById('userAvatarIcon');

  const name = user?.name || "User";

  if (user?.profileImage) {
    if (img) {
      img.src = user.profileImage;
      img.style.display = "block";
    }
    if (icon) icon.style.display = "none";
  } else {
    if (img) img.style.display = "none";

    if (icon) {
      icon.style.display = "flex";
      icon.textContent = name.charAt(0).toUpperCase();

      icon.style.width = "80px";
      icon.style.height = "80px";
      icon.style.borderRadius = "50%";
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.fontSize = "30px";
      icon.style.fontWeight = "bold";
      icon.style.color = "white";
      icon.style.background = "#4f46e5";
    }
  }
}


// ================= DOM LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('userName').textContent = user.name || '';
  document.getElementById('userEmail').textContent = user.email || '';
  document.getElementById('profileName').value = user.name || '';
  document.getElementById('profileEmail').value = user.email || '';

  renderAvatar(user);
});


// ================= LOAD ORDERS =================
async function loadOrders() {
  try {
    const response = await fetch('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    const container = document.getElementById('ordersContainer');

    if (data.success) {
      container.innerHTML = data.data.length
        ? data.data.map(order => `
            <div class="order-card">
              <div><b>${order.orderNumber}</b></div>
              <div>${order.orderStatus}</div>
              <div>₹${order.finalAmount}</div>
            </div>
          `).join('')
        : '<p>No orders yet</p>';
    }
  } catch (err) {
    console.error("Orders error:", err);
  }
}


// ================= SAVE PROFILE =================
function saveProfile() {
  const name = document.getElementById('profileName').value;
  const phone = document.getElementById('profilePhone').value;

  fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, phone })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile updated');
      location.reload();
    }
  });
}


// ================= IMAGE UPLOAD =================
const pictureInput = document.getElementById('profilePictureInput');

if (pictureInput) {
  pictureInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/auth/upload-picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        user.profileImage = data.profileImage;
        localStorage.setItem('user', JSON.stringify(user));

        renderAvatar(user);

        alert('Profile picture updated!');
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }
  });
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}


// ================= INIT =================
loadOrders();