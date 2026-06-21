const productService = require('../services/productService');

const getAll = async (req, res) => {
  try {
    const products = await productService.getAll(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getFeatured = async (req, res) => {
  try {
    const products = await productService.getFeatured();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
};

const getBySlug = async (req, res) => {
  try {
    const product = await productService.getBySlug(req.params.slug);
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, image, images, tag, subcategory, sizes, categoryId, featured } = req.body;
    if (!name || !slug || !price || !image || !categoryId) {
      return res.status(400).json({ error: 'Name, slug, price, image and categoryId are required' });
    }
    const product = await productService.create({ name, slug, description, price, originalPrice, image, images, tag, subcategory, sizes, categoryId, featured: featured || false });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, image, images, tag, subcategory, sizes, inStock, categoryId, featured } = req.body;
    const product = await productService.update(req.params.id, { name, slug, description, price, originalPrice, image, images, tag, subcategory, sizes, inStock, categoryId, featured });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await productService.remove(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await productService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getAll, getFeatured, getBySlug, create, update, remove, getStats };
