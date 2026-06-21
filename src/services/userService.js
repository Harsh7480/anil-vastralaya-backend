const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new Error('User not found');
  return user;
};

const updateRole = async (id, role) => {
  await getById(id);
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const remove = async (id) => {
  await getById(id);
  return prisma.user.delete({ where: { id } });
};

const getStats = async () => {
  const [total, admins, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { role: 'user' } }),
  ]);

  return { total, admins, users };
};

module.exports = { getAll, getById, updateRole, remove, getStats };
