# 🛒 Grabit Store

A modern full-stack e-commerce web application built with Node.js, Express.js, MongoDB, EJS, and Bootstrap. Grabit provides a seamless online shopping experience with user authentication, product browsing, search functionality, and cart management.

## 🌐 Live Demo

**Live Website:** https://grabit-7if4.onrender.com/

**GitHub Repository:** https://github.com/Himanshu-chouhan-hc/Grabit

---

## 📸 Screenshots

### 🏠 Home Page

![Home Page](screenshots/home.png)

### 🔍 Product Search

![Search](screenshots/search.png)

### 🛍️ Product Listing

![Products](screenshots/products.png)

### 🛒 Shopping Cart

![Cart](screenshots/cart.png)

### 👤 Authentication

![Login](screenshots/login.png)

> Create a `screenshots` folder inside your repository and upload these images.

---

## ✨ Features

### 🔐 Authentication System

* User Registration
* Secure Login & Logout
* Session Management
* Protected Routes

### 🛍️ E-Commerce Features

* Product Catalog
* Category Browsing
* Product Search
* Dynamic Product Pages
* Shopping Cart

### 🎨 User Experience

* Responsive Design
* Mobile-Friendly Layout
* Clean UI
* Fast Navigation

### ⚡ Backend Features

* RESTful Routing
* MongoDB Integration
* Mongoose ODM
* Error Handling
* Server-Side Rendering

---

## 🛠️ Tech Stack

| Category        | Technologies                         |
| --------------- | ------------------------------------ |
| Frontend        | HTML5, CSS3, Bootstrap 5, JavaScript |
| Template Engine | EJS                                  |
| Backend         | Node.js, Express.js                  |
| Database        | MongoDB, Mongoose                    |
| Authentication  | Express Session                      |
| Deployment      | Render                               |

---

## 📂 Project Structure

```text
Grabit/
│
├── models/
├── routes/
├── views/
│   ├── pages/
│   └── partials/
│
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│
├── middleware/
├── config/
│
├── app.js
├── package.json
├── .env
└── README.md
```

---

## 🏗️ System Architecture

```text
┌──────────────┐
│    User      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Browser UI   │
│ EJS + CSS    │
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────┐
│ Express.js   │
│ Application  │
└──────┬───────┘
       │
 ┌─────┴─────┐
 ▼           ▼
Routes     Sessions
 │
 ▼
Models
 │
 ▼
MongoDB Atlas
```

---

## 🚀 Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Himanshu-chouhan-hc/Grabit.git
cd Grabit
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
PORT=9000
```

### 4️⃣ Start Application

```bash
npm start
```

or

```bash
node app.js
```

### 5️⃣ Open Browser

```text
http://localhost:9000
```

---

## 🌍 Deployment Guide (Render)

### Step 1

Push project to GitHub.

### Step 2

Create an account on Render.

### Step 3

Click **New Web Service**.

### Step 4

Connect your GitHub repository.

### Step 5

Configure:

```text
Build Command:
npm install

Start Command:
npm start
```

### Step 6

Add Environment Variables:

```env
MONGODB_URI=your_connection_string
SESSION_SECRET=your_secret_key
```

### Step 7

Deploy Application 🚀

---

## 🎯 Future Enhancements

* ❤️ Wishlist System
* ⭐ Product Reviews & Ratings
* 💳 Online Payments (Razorpay/Stripe)
* 📦 Order Tracking
* 📧 Email Notifications
* 🛠️ Admin Dashboard
* 🤖 AI Product Recommendations

---

## 📈 Learning Outcomes

Through this project, I gained hands-on experience with:

* Full-Stack Web Development
* REST Architecture
* Authentication & Authorization
* MongoDB Database Design
* MVC Project Structure
* Deployment & Hosting
* Git & GitHub Workflow

---

## 👨‍💻 Developer

**Himanshu Babu**

GitHub: https://github.com/Himanshu-chouhan-hc

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

---

## 📄 License

This project is developed for educational, portfolio, and learning purposes.
