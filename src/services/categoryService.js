const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { products: true },
  });
  if (!category) throw new Error('Category not found');
  return category;
};

const getById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new Error('Category not found');
  return category;
};

const create = async (data) => {
  return prisma.category.create({ data });
};

const update = async (id, data) => {
  await getById(id);
  return prisma.category.update({ where: { id }, data });
};

const remove = async (id) => {
  await getById(id);
  return prisma.category.delete({ where: { id } });
};

module.exports = { getAll, getBySlug, getById, create, update, remove };
