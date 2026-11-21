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
  const [total, admins, superadmins, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { role: 'superadmin' } }),
    prisma.user.count({ where: { role: 'user' } }),
  ]);

  return { total, admins, superadmins, users };
};

const ensureSuperadmin = async () => {
  const existing = await prisma.user.findFirst({ where: { role: 'superadmin' } });
  if (existing) return existing;

  const candidate = await prisma.user.findFirst({
    where: { role: 'admin' },
    orderBy: { createdAt: 'asc' },
  });

  if (!candidate) return null;

  return prisma.user.update({
    where: { id: candidate.id },
    data: { role: 'superadmin' },
  });
};

module.exports = { getAll, getById, updateRole, remove, getStats, ensureSuperadmin };
