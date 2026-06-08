const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) throw new Error('Testimonial not found');
  return testimonial;
};

const create = async (data) => {
  return prisma.testimonial.create({ data });
};

const update = async (id, data) => {
  await getById(id);
  return prisma.testimonial.update({ where: { id }, data });
};

const remove = async (id) => {
  await getById(id);
  return prisma.testimonial.delete({ where: { id } });
};

const getStats = async () => {
  const [total, active, inactive, avgRating, fiveStar] = await Promise.all([
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { status: 'active' } }),
    prisma.testimonial.count({ where: { status: 'inactive' } }),
    prisma.testimonial.aggregate({ _avg: { rating: true } }),
    prisma.testimonial.count({ where: { rating: 5 } }),
  ]);

  return {
    total,
    active,
    inactive,
    avgRating: avgRating._avg.rating || 0,
    fiveStar,
  };
};

module.exports = { getAll, getById, create, update, remove, getStats };
