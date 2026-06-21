const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateBookingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AV-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const getAll = async () => {
  return prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getByUserId = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
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
  const { customerName, email, phone, address, city, pincode, items, userId } = data;

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    totalAmount += product.price * item.quantity;
    orderItems.push({ quantity: item.quantity, price: product.price, size: item.size || null, productId: item.productId });
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
      bookingType: 'full',
      userId: userId || null,
      items: { create: orderItems },
    },
    include: { items: true },
  });
};

const createBooking = async (data) => {
  const { userId, customerName, email, phone, items, advancePercentage = 10 } = data;

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    totalAmount += product.price * item.quantity;
    orderItems.push({ quantity: item.quantity, price: product.price, size: item.size || null, productId: item.productId });
  }

  const advanceAmount = Math.ceil((totalAmount * advancePercentage) / 100);
  const remainingAmount = totalAmount - advanceAmount;
  const bookingCode = generateBookingCode();

  return prisma.order.create({
    data: {
      customerName,
      email,
      phone,
      address: 'Pickup from Shop',
      city: 'N/A',
      pincode: '000000',
      totalAmount,
      status: 'booked',
      bookingType: 'advance',
      advancePercentage,
      advanceAmount,
      remainingAmount,
      bookingCode,
      userId: userId || null,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
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

module.exports = { getAll, getById, create, createBooking, getByUserId, updateStatus, getStats };
