const express = require('express');
const { getAll, create, markAsRead, remove, getStats } = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', create);
router.get('/', authenticate, getAll);
router.get('/stats', authenticate, getStats);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, remove);

module.exports = router;
