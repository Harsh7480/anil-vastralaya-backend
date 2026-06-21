const express = require('express');
const { getAll, getById, create, createBooking, getByUserId, updateStatus, getStats } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', create);
router.post('/book', authenticate, createBooking);
router.get('/', authenticate, getAll);
router.get('/my-bookings', authenticate, getByUserId);
router.get('/stats', authenticate, getStats);
router.get('/:id', authenticate, getById);
router.put('/:id/status', authenticate, updateStatus);

module.exports = router;
