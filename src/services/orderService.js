const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new Error('Order not found');
  return order;
};

const create = async (data) => {
  const { customerName, email, phone, address, city, pincode, items } = data;

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    totalAmount += product.price * item.quantity;
    orderItems.push({ quantity: item.quantity, price: product.price, productId: item.productId });
  }

  return prisma.order.create({
    data: {
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      totalAmount,
      items: { create: orderItems },
    },
    include: { items: true },
  });
};

const updateStatus = async (id, status) => {
  await getById(id);
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

const getStats = async () => {
  const [total, pending, confirmed, shipped, delivered, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count({ where: { status: 'confirmed' } }),
    prisma.order.count({ where: { status: 'shipped' } }),
    prisma.order.count({ where: { status: 'delivered' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  return {
    total,
    pending,
    confirmed,
    shipped,
    delivered,
    totalRevenue: revenue._sum.totalAmount || 0,
  };
};

module.exports = { getAll, getById, create, updateStatus, getStats };
