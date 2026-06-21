const express = require('express');
const { getAll, getFeatured, getBySlug, create, update, remove, getStats } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, getStats);
router.get('/featured', getFeatured);
router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
