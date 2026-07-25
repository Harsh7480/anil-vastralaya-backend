const multer = require('multer');
const path = require('path');
const fs = require('fs');

const qrUploadsDir = path.join(__dirname, '../../uploads/qrcode');

if (!fs.existsSync(qrUploadsDir)) {
  fs.mkdirSync(qrUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qrUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'qr-code' + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP) are allowed'), false);
  }
};

const qrUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = qrUpload;
