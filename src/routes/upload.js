const express = require('express');
const { authenticate } = require('../middleware/auth');
const imageUpload = require('../middleware/imageUpload');

const router = express.Router();

router.post('/', authenticate, imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file was uploaded' });
  }
  res.status(201).json({ image: '/uploads/images/' + req.file.filename });
});

module.exports = router;
