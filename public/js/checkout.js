const cart = JSON.parse(localStorage.getItem("cart")) || [];
const token = localStorage.getItem("token");
const orderReviewContainer = document.getElementById("orderReview");
const summaryItemsContainer = document.getElementById("summaryItems");
const summaryTotalEl = document.getElementById("summaryTotal");
const placeOrderBtn = document.getElementById("placeOrderBtn");

function formatCurrency(value) {
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * 0.1);
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal - discount + deliveryFee;
  return { subtotal, discount, deliveryFee, total };
}

function renderCheckoutSummary() {
  const { subtotal, discount, deliveryFee, total } = calculateTotals(cart);

  if (!cart.length) {
    orderReviewContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    summaryItemsContainer.innerHTML = '<p class="empty-cart">Add items to see your order summary.</p>';
    summaryTotalEl.textContent = "0";
    placeOrderBtn.disabled = true;
    return;
  }

  orderReviewContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="review-item">
          <div class="item-name">${item.name}</div>
          <div class="item-details">Qty: ${item.quantity} × ₹${formatCurrency(item.price)}</div>
          <div class="item-total">₹${formatCurrency(item.price * item.quantity)}</div>
        </div>
      `
    )
    .join("");

  summaryItemsContainer.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>₹${formatCurrency(subtotal)}</span></div>
    <div class="summary-row"><span>Discount</span><span>-₹${formatCurrency(discount)}</span></div>
    <div class="summary-row"><span>Delivery Fee</span><span>₹${formatCurrency(deliveryFee)}</span></div>
  `;

  summaryTotalEl.textContent = formatCurrency(total);
}

renderCheckoutSummary();

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  if (!cart.length) {
    return alert("Your cart is empty.");
  }

  const { total, discount, deliveryFee } = calculateTotals(cart);

  const address = {
    name: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    street: document.getElementById("street").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    pincode: document.getElementById("pincode").value,
  };

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "Razorpay";
  const orderData = {
    items: cart,
    total,
    discount,
    deliveryFee,
    shippingAddress: address,
    paymentMethod,
  };

  if (paymentMethod === "COD") {
    const save = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        razorpay_order_id: "COD",
        razorpay_payment_id: "COD",
        razorpay_signature: "COD",
        orderData,
      }),
    });

    const result = await save.json();
    if (result.success) {
      localStorage.removeItem("cart");
      window.location.href = `/order-success/${result.order._id}`;
    } else {
      alert(result.message);
    }
    return;
  }

  // CREATE ORDER
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: total }),
  });

  const data = await res.json();
  if (!data.success) return alert(data.message);

  const order = data.order;

  // RAZORPAY FLOW
  const options = {
    key: "rzp_test_T2LN7mDTmatODZ",
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,

    handler: async function (response) {
      const verify = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: order.id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderData,
        }),
      });

      const result = await verify.json();

      if (result.success) {
        localStorage.removeItem("cart");
        window.location.href = `/order-success/${result.order._id}`;
      } else {
        alert(result.message);
      }
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
});