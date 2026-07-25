const express = require('express');
const { getAll, getByKey, update, bulkUpdate, uploadQrCode } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const qrUpload = require('../middleware/qrUpload');

const router = express.Router();

router.get('/public', getAll);
router.get('/', authenticate, getAll);
router.get('/:key', authenticate, getByKey);
router.put('/:key', authenticate, update);
router.put('/', authenticate, bulkUpdate);
router.post('/upload-qr', authenticate, qrUpload.single('qr'), uploadQrCode);

module.exports = router;
