const express = require('express');
const { getAll, getById, create, updateStatus, getStats } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', create);
router.get('/', authenticate, getAll);
router.get('/stats', authenticate, getStats);
router.get('/:id', authenticate, getById);
router.put('/:id/status', authenticate, updateStatus);

module.exports = router;
