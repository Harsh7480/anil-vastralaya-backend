const orderService = require('../services/orderService');
const deliveryService = require('../services/deliveryService');
const settingsService = require('../services/settingsService');

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
    const {
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      items,
      latitude,
      longitude,
      paymentMethod = 'cod',
      orderType = 'full',
      deliveryDate,
      advancePercentage,
      paymentScreenshot,
    } = req.body;

    if (!customerName || !email || !phone || !address || !city || !pincode || !items?.length) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }
    const hasLocation = latitude !== undefined && latitude !== null && latitude !== '' && longitude !== undefined && longitude !== null && longitude !== '';
    if (!hasLocation && !pincode) {
      return res.status(400).json({ error: 'Please share your location or enter a serviceable pincode' });
    }

    const userId = req.user?.id || null;
    const order = await orderService.create({
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      items,
      latitude,
      longitude,
      paymentMethod,
      orderType,
      deliveryDate,
      advancePercentage,
      paymentScreenshot: paymentScreenshot || null,
      userId,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const quoteDelivery = async (req, res) => {
  try {
    const quote = await deliveryService.calculate(req.body || {});
    res.json(quote);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      distanceKm: error.distanceKm,
      radiusKm: error.radiusKm,
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const { customerName, email, phone, items, advancePercentage, paymentMethod, paymentScreenshot } = req.body;
    const userId = req.user?.id;

    if (!customerName || !email || !phone || !items?.length) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    let percentage = advancePercentage;
    if (!percentage) {
      const globalAdvance = await settingsService.getByKey('advancePercentage');
      percentage = parseInt(globalAdvance) || 20;
    }

    const validPercentages = [5, 10, 15, 20, 25, 30, 50, 100];
    percentage = validPercentages.includes(percentage) ? percentage : 20;

    const order = await orderService.createBooking({
      userId,
      customerName,
      email,
      phone,
      items,
      advancePercentage: percentage,
      paymentMethod: paymentMethod || 'upi_qr',
      paymentScreenshot: paymentScreenshot || null,
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

const verifyPayment = async (req, res) => {
  try {
    const { adminNote } = req.body || {};
    const order = await orderService.verifyPayment(req.params.id, adminNote);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const order = await orderService.updateBookingStatus(req.params.id, status, adminNote);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = '/uploads/payments/' + req.file.filename;
    res.json({ filePath, filename: req.file.filename });
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

module.exports = { getAll, getById, create, quoteDelivery, createBooking, getByUserId, updateStatus, verifyPayment, updateBookingStatus, uploadScreenshot, getStats };
