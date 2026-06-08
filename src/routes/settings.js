const express = require('express');
const { getAll, getByKey, update, bulkUpdate } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getAll);
router.get('/:key', authenticate, getByKey);
router.put('/:key', authenticate, update);
router.put('/', authenticate, bulkUpdate);

module.exports = router;
