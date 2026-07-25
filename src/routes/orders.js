const express = require('express');
const { getAll, getById, create, createBooking, getByUserId, updateStatus, verifyPayment, updateBookingStatus, uploadScreenshot, getStats } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', authenticate, create);
router.post('/book', authenticate, createBooking);
router.post('/upload-payment', authenticate, upload.single('screenshot'), uploadScreenshot);
router.get('/', authenticate, getAll);
router.get('/my-bookings', authenticate, getByUserId);
router.get('/stats', authenticate, getStats);
router.get('/:id', authenticate, getById);
router.put('/:id/status', authenticate, updateStatus);
router.put('/:id/verify-payment', authenticate, verifyPayment);
router.put('/:id/booking-status', authenticate, updateBookingStatus);

module.exports = router;
