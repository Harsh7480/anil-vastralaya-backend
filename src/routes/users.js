const express = require('express');
const { getAll, getById, updateRole, remove, getStats } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, getStats);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.put('/:id/role', authenticate, updateRole);
router.delete('/:id', authenticate, remove);

module.exports = router;
