const express = require('express');
const { getAll, getBySlug, create, update, remove, getStats } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, getStats);
router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
