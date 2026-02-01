const express = require('express');
const router = express.Router();
const Order = require('../module/order');
const  verifyToken  = require('../middleware/verify');


// Create order
router.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, discount, deliveryFee, shippingAddress, paymentMethod } = req.body;

    const finalAmount = totalAmount - discount + deliveryFee;

    const order = new Order({
      userId: req.userId,
      items,
      totalAmount,
      discount,
      deliveryFee,
      finalAmount,
      shippingAddress,
      paymentMethod,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

 router.post('/api/orders', verifyToken, async (req, res) => {
    try {
        const { items, totalAmount, discount, deliveryFee, shippingAddress, paymentMethod } = req.body;
        const finalAmount = totalAmount - discount + deliveryFee;

        const order = new Order({
            userId: req.userId,
            items,
            totalAmount,
            discount,
            deliveryFee,
            finalAmount,
            shippingAddress,
            paymentMethod,
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        });

        await order.save();
        res.json({ success: true, message: 'Order created', data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// Get user orders
router.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ orderDate: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get order details
router.get('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cancel order
router.put('/api/orders/:id/cancel', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.orderStatus !== 'Processing') {
      return res.status(400).json({ success: false, message: 'Can only cancel Processing orders' });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
