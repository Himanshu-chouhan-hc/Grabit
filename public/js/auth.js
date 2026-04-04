// auth.js - logic moved from auth.ejs
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginBtn.addEventListener('click', () => {
  loginBtn.classList.add('active');
  signupBtn.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
});

signupBtn.addEventListener('click', () => {
  signupBtn.classList.add('active');
  loginBtn.classList.remove('active');
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginStatus = document.getElementById('loginStatus');

  loginSubmitBtn.disabled = true;
  loginStatus.textContent = 'Logging in...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      const storedUser = { ...data.user, id: data.user.id || data.user._id };
      localStorage.setItem('user', JSON.stringify(storedUser));
      window.location.href = '/account';
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Login failed: ' + err.message);
  } finally {
    loginSubmitBtn.disabled = false;
    loginStatus.textContent = '';
  }
});

// Handle signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const signupSubmitBtn = document.getElementById('signupSubmitBtn');
  const signupStatus = document.getElementById('signupStatus');

  signupSubmitBtn.disabled = true;
  signupStatus.textContent = 'Signing up...';

  console.log('Signup attempt:', { name, email, password, confirmPassword });

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (data.success) {
      localStorage.setItem('token', data.token);
      const storedUser = { ...data.user, id: data.user.id || data.user._id };
      localStorage.setItem('user', JSON.stringify(storedUser));
      alert('Account created successfully!');
      window.location.href = '/account';
    } else {
      alert('Signup failed: ' + data.message);
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Signup failed: ' + err.message);
  } finally {
    signupSubmitBtn.disabled = false;
    signupStatus.textContent = '';
  }
});
