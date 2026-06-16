const cart = JSON.parse(localStorage.getItem("cart")) || [];
const token = localStorage.getItem("token");

function getTotal() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = subtotal * 0.1;
  const deliveryFee = 50;
  const total = subtotal - discount + deliveryFee;
  return { subtotal, discount, deliveryFee, total };
}

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  const { subtotal, discount, deliveryFee, total } = getTotal();

  const address = {
    name: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    street: document.getElementById("street").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    pincode: document.getElementById("pincode").value,
  };

  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  if (!token) return (window.location.href = "/auth");

  try {
    // 1. CREATE ORDER
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

    // =========================
    // COD FLOW
    // =========================
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
          orderData: { items: cart, subtotal, discount, deliveryFee, total, shippingAddress: address, paymentMethod: "COD" },
        }),
      });

      const result = await save.json();
      if (result.success) {
        localStorage.removeItem("cart");
        window.location.href = `/order-success/${result.order._id}`;
      }

      return;
    }

    // =========================
    // RAZORPAY FLOW
    // =========================
    const options = {
      key: "rzp_test_T2LN7mDTmatODZ", // YOUR KEY
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      handler: async function (response) {
        console.log("PAYMENT RESPONSE:", response);

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
            orderData: {
              items: cart,
              subtotal,
              discount,
              deliveryFee,
              total,
              shippingAddress: address,
              paymentMethod: "Razorpay",
            },
          }),
        });

        const result = await verify.json();

        if (result.success) {
          localStorage.removeItem("cart");
          window.location.href = `/order-success/${result.order._id}`;
        } else {
          alert(result.message || "Payment verification failed");
        }
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert("Payment error");
  }
});