const heroService = require('../services/heroService');

const getAll = async (req, res) => {
  try {
    const slides = await heroService.getAll();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
};

const getAllForAdmin = async (req, res) => {
  try {
    const slides = await heroService.getAllForAdmin();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
};

const create = async (req, res) => {
  try {
    const { image, tagline, title } = req.body;
    if (!image || !tagline || !title) {
      return res.status(400).json({ error: 'Image, tagline and title are required' });
    }
    const slide = await heroService.create(req.body);
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const slide = await heroService.update(req.params.id, req.body);
    res.json(slide);
  } catch (error) {
    const status = error.message === 'Hero slide not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await heroService.remove(req.params.id);
    res.json({ message: 'Hero slide deleted' });
  } catch (error) {
    const status = error.message === 'Hero slide not found' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

const reorder = async (req, res) => {
  try {
    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: 'slides must be an array' });
    }
    const updated = await heroService.reorder(slides);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reset = async (req, res) => {
  try {
    const slides = await heroService.reset();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ image: '/uploads/hero/' + req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getAllForAdmin, create, update, remove, reorder, reset, uploadImage };
