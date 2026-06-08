const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw new Error('Message not found');
  return message;
};

const create = async (data) => {
  return prisma.contactMessage.create({ data });
};

const markAsRead = async (id) => {
  await getById(id);
  return prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
};

const remove = async (id) => {
  await getById(id);
  return prisma.contactMessage.delete({ where: { id } });
};

const getStats = async () => {
  const [total, unread, read] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count({ where: { read: true } }),
  ]);

  return { total, unread, read };
};

module.exports = { getAll, getById, create, markAsRead, remove, getStats };
