const testimonialService = require('../services/testimonialService');

const getAll = async (req, res) => {
  try {
    const testimonials = await testimonialService.getAll();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

const create = async (req, res) => {
  try {
    const { name, review, rating, status } = req.body;
    if (!name || !review || !rating) {
      return res.status(400).json({ error: 'Name, review and rating are required' });
    }
    const testimonial = await testimonialService.create({ name, review, rating, status: status || 'active' });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, review, rating, status } = req.body;
    const testimonial = await testimonialService.update(req.params.id, { name, review, rating, status });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await testimonialService.remove(req.params.id);
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await testimonialService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getAll, create, update, remove, getStats };
