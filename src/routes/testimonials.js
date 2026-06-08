const express = require('express');
const { getAll, create, update, remove, getStats } = require('../controllers/testimonialController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);
router.get('/stats', authenticate, getStats);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
