const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async (filters = {}) => {
  const where = {};

  if (filters.category) {
    where.category = { slug: filters.category };
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.tag) {
    where.tag = filters.tag;
  }
  if (filters.subcategory) {
    where.subcategory = filters.subcategory;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
  }
  if (filters.inStock !== undefined) {
    where.inStock = filters.inStock === 'true';
  }
  if (filters.featured !== undefined) {
    where.featured = filters.featured === 'true';
  }

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getFeatured = async () => {
  return prisma.product.findMany({
    where: { featured: true, inStock: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) throw new Error('Product not found');
  return product;
};

const getById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) throw new Error('Product not found');
  return product;
};

const create = async (data) => {
  return prisma.product.create({ data });
};

const update = async (id, data) => {
  await getById(id);
  return prisma.product.update({ where: { id }, data });
};

const remove = async (id) => {
  await getById(id);
  return prisma.product.delete({ where: { id } });
};

const getStats = async () => {
  const [total, active, lowStock, featured, totalValue] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { inStock: true } }),
    prisma.product.count({ where: { inStock: false } }),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.aggregate({ _sum: { price: true } }),
  ]);

  return {
    total,
    active,
    lowStock,
    featured,
    inactive: total - active,
    totalValue: totalValue._sum.price || 0,
  };
};

module.exports = { getAll, getFeatured, getBySlug, getById, create, update, remove, getStats };
