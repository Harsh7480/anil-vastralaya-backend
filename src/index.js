require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const orderRoutes = require('./routes/orders');
const testimonialRoutes = require('./routes/testimonials');
const galleryRoutes = require('./routes/gallery');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/users');
const heroRoutes = require('./routes/hero');
const uploadRoutes = require('./routes/upload');
const userService = require('./services/userService');

const app = express();

const uploadsDir = path.join(__dirname, '../uploads/payments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const qrDir = path.join(__dirname, '../uploads/qrcode');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

const heroDir = path.join(__dirname, '../uploads/hero');
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

const imagesDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Anil Vastralaya API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || err.statusCode;
  res.status(status >= 400 && status < 600 ? status : 500).json({
    error: err.message || 'Something went wrong!',
  });
});

const PORT = process.env.PORT || 5000;

userService.ensureSuperadmin().catch((error) => {
  console.error('Failed to ensure a superadmin account:', error.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
