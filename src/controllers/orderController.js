const orderService = require('../services/orderService');

const getAll = async (req, res) => {
  try {
    const orders = await orderService.getAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getByUserId = async (req, res) => {
  try {
    const orders = await orderService.getByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getById = async (req, res) => {
  try {
    const order = await orderService.getById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { customerName, email, phone, address, city, pincode, items } = req.body;
    if (!customerName || !email || !phone || !address || !city || !pincode || !items?.length) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }
    const order = await orderService.create({ customerName, email, phone, address, city, pincode, items });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { customerName, email, phone, items, advancePercentage } = req.body;
    const userId = req.user?.id;

    if (!customerName || !email || !phone || !items?.length) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const validPercentages = [10, 15, 20, 25, 30, 50, 100];
    const percentage = validPercentages.includes(advancePercentage) ? advancePercentage : 10;

    const order = await orderService.createBooking({
      userId,
      customerName,
      email,
      phone,
      items,
      advancePercentage: percentage,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const order = await orderService.updateStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await orderService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getAll, getById, create, createBooking, getByUserId, updateStatus, getStats };
