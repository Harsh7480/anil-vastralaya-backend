const express = require('express');
const { getAll, getBySlug, create, update, remove } = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
