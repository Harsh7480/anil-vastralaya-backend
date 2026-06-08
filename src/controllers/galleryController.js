const galleryService = require('../services/galleryService');

const getAll = async (req, res) => {
  try {
    const items = await galleryService.getAll(req.query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
};

const create = async (req, res) => {
  try {
    const { title, category, image, status } = req.body;
    if (!title || !category || !image) {
      return res.status(400).json({ error: 'Title, category and image are required' });
    }
    const item = await galleryService.create({ title, category, image, status: status || 'active' });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, category, image, status } = req.body;
    const item = await galleryService.update(req.params.id, { title, category, image, status });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await galleryService.remove(req.params.id);
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, create, update, remove };
