const { PrismaClient } = require('@prisma/client');
const settingsService = require('./settingsService');
const deliveryService = require('./deliveryService');

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
  const {
    customerName,
    email,
    phone,
    address,
    city,
    pincode,
    items,
    userId,
    latitude,
    longitude,
    paymentMethod = 'cod',
    orderType = 'full',
    deliveryDate,
    advancePercentage,
    paymentScreenshot = null,
  } = data;

  let itemSubtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    itemSubtotal += product.price * item.quantity;
    orderItems.push({ quantity: item.quantity, price: product.price, size: item.size || null, productId: item.productId });
  }

  const delivery = await deliveryService.calculate({ latitude, longitude, pincode, subtotal: itemSubtotal });
  const totalAmount = itemSubtotal + delivery.deliveryCharge;
  const isPrebook = orderType === 'prebook';

  let status = 'pending';
  let bookingType = 'full';
  let finalAdvancePercentage = null;
  let advanceAmount = null;
  let remainingAmount = null;
  let bookingCode = null;
  let finalPaymentMethod = paymentMethod;
  let parsedDeliveryDate = null;

  if (isPrebook) {
    if (!deliveryDate) {
      throw Object.assign(new Error('Please choose a prebook delivery date'), { statusCode: 400 });
    }
    parsedDeliveryDate = new Date(deliveryDate);
    if (Number.isNaN(parsedDeliveryDate.getTime())) {
      throw Object.assign(new Error('Invalid prebook delivery date'), { statusCode: 400 });
    }

    const allowedPercentages = [5, 10, 15, 20, 25, 30, 50, 100];
    const configured = Number(await settingsService.getByKey('advancePercentage'));
    finalAdvancePercentage = allowedPercentages.includes(Number(advancePercentage))
      ? Number(advancePercentage)
      : allowedPercentages.includes(configured) ? configured : 20;
    advanceAmount = Math.ceil((totalAmount * finalAdvancePercentage) / 100);
    remainingAmount = totalAmount - advanceAmount;
    bookingCode = generateBookingCode();
    bookingType = 'advance';
    status = finalPaymentMethod === 'in_shop' ? 'confirmed' : 'pending_verification';

    if (!['upi_qr', 'in_shop'].includes(finalPaymentMethod)) {
      throw Object.assign(new Error('Prebook requires UPI QR or pay at shop'), { statusCode: 400 });
    }
  } else if (!['cod', 'online'].includes(finalPaymentMethod)) {
    throw Object.assign(new Error('Invalid payment method'), { statusCode: 400 });
  }

  return prisma.order.create({
    data: {
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      itemSubtotal,
      deliveryCharge: delivery.deliveryCharge,
      deliveryMode: delivery.deliveryMode,
      distanceKm: delivery.distanceKm,
      latitude: latitude !== null && latitude !== undefined && latitude !== '' && Number.isFinite(Number(latitude)) ? Number(latitude) : null,
      longitude: longitude !== null && longitude !== undefined && longitude !== '' && Number.isFinite(Number(longitude)) ? Number(longitude) : null,
      deliveryDate: parsedDeliveryDate,
      totalAmount,
      status,
      bookingType,
      advancePercentage: finalAdvancePercentage,
      advanceAmount,
      remainingAmount,
      bookingCode,
      paymentMethod: finalPaymentMethod,
      paymentScreenshot: isPrebook ? paymentScreenshot : null,
      userId: userId || null,
      items: { create: orderItems },
    },
    include: { items: true },
  });
};

const createBooking = async (data) => {
  const { userId, customerName, email, phone, items, advancePercentage = 20, paymentMethod = 'upi_qr', paymentScreenshot = null } = data;

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

  const initialStatus = paymentMethod === 'in_shop' ? 'confirmed' : 'pending_verification';

  return prisma.order.create({
    data: {
      customerName,
      email,
      phone,
      address: 'Pickup from Shop',
      city: 'N/A',
      pincode: '000000',
      totalAmount,
      status: initialStatus,
      bookingType: 'advance',
      advancePercentage,
      advanceAmount,
      remainingAmount,
      bookingCode,
      paymentMethod,
      paymentScreenshot,
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

const verifyPayment = async (id, adminNote = '') => {
  const order = await getById(id);
  if (!order) throw new Error('Order not found');
  return prisma.order.update({
    where: { id },
    data: {
      paymentVerified: true,
      status: 'confirmed',
      adminNote,
    },
  });
};

const updateBookingStatus = async (id, status, adminNote = '') => {
  await getById(id);
  return prisma.order.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote || undefined,
    },
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

module.exports = { getAll, getById, create, createBooking, getByUserId, updateStatus, verifyPayment, updateBookingStatus, getStats };
