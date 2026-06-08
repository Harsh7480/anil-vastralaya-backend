const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@anilvastralaya.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const women = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women',
      description: 'Elegant sarees, lehengas & more',
      image: '/images/women.png',
    },
  });

  const ethnic = await prisma.category.create({
    data: {
      name: 'Ethnic Wear',
      slug: 'ethnic',
      description: 'Traditional & festive collections',
      image: '/images/ethnic.png',
    },
  });

  const kids = await prisma.category.create({
    data: {
      name: 'Kids',
      slug: 'kids',
      description: 'Adorable outfits for little ones',
      image: '/images/kids.png',
    },
  });

  const men = await prisma.category.create({
    data: {
      name: 'Men\'s Collection',
      slug: 'men',
      description: 'Shirts, kurtas, and suits for men',
      image: '/images/men.png',
    },
  });

  const products = [
    { name: 'Silk Banarasi Saree', slug: 'silk-banarasi-saree', description: 'Pure silk Banarasi saree with intricate gold zari work.', price: 2999, originalPrice: 4999, image: '/images/product1.png', tag: 'Bestseller', categoryId: women.id },
    { name: 'Bridal Red Lehenga', slug: 'bridal-red-lehenga', description: 'Stunning red bridal lehenga with heavy embroidery.', price: 12999, originalPrice: 18999, image: '/images/product2.png', tag: 'New', categoryId: ethnic.id },
    { name: 'Cotton Anarkali Set', slug: 'cotton-anarkali-set', description: 'Comfortable cotton anarkali set with block prints.', price: 1899, originalPrice: 2999, image: '/images/product3.png', tag: 'Sale', categoryId: women.id },
    { name: 'Designer Sharara Set', slug: 'designer-sharara-set', description: 'Elegant sharara set with mirror work and tassels.', price: 4599, originalPrice: 6999, image: '/images/product4.jpg', tag: 'Trending', categoryId: ethnic.id },
    { name: 'Embroidered Suit', slug: 'embroidered-suit', description: 'Premium embroidered suit with churidar.', price: 3299, originalPrice: 5499, image: '/images/product1.png', tag: 'Bestseller', categoryId: women.id },
    { name: 'Georgette Party Saree', slug: 'georgette-party-saree', description: 'Lightweight georgette saree with shimmering border.', price: 2199, originalPrice: 3999, image: '/images/product2.png', tag: 'New', categoryId: women.id },
    { name: 'Men\'s Silk Kurta', slug: 'mens-silk-kurta', description: 'Elegant silk kurta for men with subtle embroidery.', price: 1499, originalPrice: 2499, image: '/images/product3.png', tag: 'Bestseller', categoryId: men.id },
    { name: 'Kids Lehenga Set', slug: 'kids-lehenga-set', description: 'Adorable lehenga set for kids with colorful prints.', price: 999, originalPrice: 1599, image: '/images/product4.jpg', tag: 'New', categoryId: kids.id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const testimonials = [
    { name: 'Priya Sharma', review: 'Absolutely love the quality of the saree I purchased! The fabric is luxurious and the delivery was prompt.', rating: 5, status: 'active' },
    { name: 'Anita Gupta', review: 'Beautiful collection of ethnic wear. The lehenga I bought for my daughter\'s wedding was stunning.', rating: 5, status: 'active' },
    { name: 'Meera Joshi', review: 'Great experience shopping here. The customer service was excellent and the product quality is top-notch.', rating: 4, status: 'active' },
    { name: 'Sunita Verma', review: 'The kurta I ordered was exactly as shown in the picture. Very satisfied with my purchase.', rating: 4, status: 'active' },
    { name: 'Kavita Singh', review: 'Good variety of traditional wear. Prices are reasonable for the quality offered.', rating: 3, status: 'inactive' },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }

  const galleryItems = [
    { title: 'Bridal Collection 2024', category: 'Bridal', image: '/images/gallery1.jpg', status: 'active' },
    { title: 'Festive Saree Range', category: 'Festive', image: '/images/gallery2.jpg', status: 'active' },
    { title: 'New Arrivals - Kurtas', category: 'New Arrivals', image: '/images/gallery3.jpg', status: 'active' },
    { title: 'Casual Wear Collection', category: 'Casual', image: '/images/gallery4.jpg', status: 'active' },
  ];

  for (const item of galleryItems) {
    await prisma.gallery.create({ data: item });
  }

  const defaultSettings = {
    storeName: 'Anil Vastralaya',
    storeTagline: 'Premium Traditional Wear Since 1985',
    storeEmail: 'info@anilvastralaya.com',
    storePhone: '+91 98765 43210',
    storeAddress: '123 Fashion Street, Mumbai, Maharashtra 400001',
    storeDescription: 'Anil Vastralaya is your destination for premium traditional Indian wear.',
    businessHours: JSON.stringify({ weekday: '10:00 AM - 9:00 PM', saturday: '10:00 AM - 8:00 PM', sunday: '11:00 AM - 6:00 PM' }),
    currency: 'INR',
    taxName: 'GST',
    taxRate: 18,
    enableTax: true,
    shippingCharges: 99,
    freeShippingThreshold: 999,
    deliveryTime: '3-5 business days',
    returnPolicy: '7 days return policy',
    exchangePolicy: '15 days exchange policy',
    socialMedia: JSON.stringify({ facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '' }),
    emailSettings: JSON.stringify({ adminEmail: 'admin@anilvastralaya.com', orderEmail: 'orders@anilvastralaya.com', supportEmail: 'support@anilvastralaya.com' }),
    appearance: JSON.stringify({ primaryColor: '#000000', secondaryColor: '#FFF8E7', accentColor: '#98635D', bannerText: 'Welcome to Anil Vastralaya', showBanner: true }),
    notifications: JSON.stringify({ emailNotifications: true, orderNotifications: true, lowStockAlerts: true }),
    security: JSON.stringify({ twoFactorAuth: false, sessionTimeout: 30, maxLoginAttempts: 5, strongPassword: true }),
    seo: JSON.stringify({ metaTitle: 'Anil Vastralaya - Premium Traditional Wear', metaDescription: 'Shop premium sarees, lehengas, kurtas and traditional Indian wear at Anil Vastralaya.', keywords: 'sarees, lehengas, kurtas, traditional wear, Indian clothing' }),
    discounts: JSON.stringify({ coupons: [], firstOrderDiscount: 10, referralDiscount: 5 }),
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.settings.create({ data: { key, value: typeof value === 'string' ? value : JSON.stringify(value) } });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
