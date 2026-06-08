const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async (filters = {}) => {
  const where = {};

  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.gallery.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const item = await prisma.gallery.findUnique({ where: { id } });
  if (!item) throw new Error('Gallery item not found');
  return item;
};

const create = async (data) => {
  return prisma.gallery.create({ data });
};

const update = async (id, data) => {
  await getById(id);
  return prisma.gallery.update({ where: { id }, data });
};

const remove = async (id) => {
  await getById(id);
  return prisma.gallery.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
