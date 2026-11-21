const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const defaultSlides = [
  {
    image: '/images/hero1.png',
    tagline: 'New Season 2024',
    title: 'Timeless\nElegance',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    position: 0,
    status: 'active',
  },
  {
    image: '/images/hero2.png',
    tagline: 'Ethnic Collection',
    title: 'Grace\nRedefined',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    position: 1,
    status: 'active',
  },
  {
    image: '/images/hero3.png',
    tagline: 'Premium Selection',
    title: 'Pure\nSophistication',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    position: 2,
    status: 'active',
  },
];

const orderBy = [{ position: 'asc' }, { createdAt: 'asc' }];

const getAll = async () => {
  const slides = await prisma.heroSlide.findMany({ where: { status: 'active' }, orderBy });
  return slides.length ? slides : defaultSlides;
};

const getAllForAdmin = async () => {
  return prisma.heroSlide.findMany({ orderBy });
};

const create = async (data) => {
  const count = await prisma.heroSlide.count();
  return prisma.heroSlide.create({
    data: {
      image: data.image,
      tagline: data.tagline,
      title: data.title,
      ctaText: data.ctaText || 'Shop Now',
      ctaLink: data.ctaLink || '/shop',
      position: data.position === undefined ? count : Number(data.position),
      status: data.status || 'active',
    },
  });
};

const update = async (id, data) => {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new Error('Hero slide not found');

  const updates = {};
  for (const field of ['image', 'tagline', 'title', 'ctaText', 'ctaLink', 'status']) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  if (data.position !== undefined) updates.position = Number(data.position);

  return prisma.heroSlide.update({ where: { id }, data: updates });
};

const remove = async (id) => {
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) throw new Error('Hero slide not found');
  await prisma.heroSlide.delete({ where: { id } });

  if (slide.image && slide.image.startsWith('/uploads/hero/')) {
    const filePath = path.join(__dirname, '../..', slide.image);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Failed to remove hero image file:', error.message);
    }
  }
};

const reorder = async (items) => {
  await Promise.all(
    items.map((item) =>
      prisma.heroSlide.update({
        where: { id: item.id },
        data: { position: Number(item.position) },
      })
    )
  );
  return getAllForAdmin();
};

const reset = async () => {
  const existing = await prisma.heroSlide.findMany();
  for (const slide of existing) {
    if (slide.image && slide.image.startsWith('/uploads/hero/')) {
      const filePath = path.join(__dirname, '../..', slide.image);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Failed to remove hero image file:', error.message);
      }
    }
  }

  await prisma.heroSlide.deleteMany();
  for (const slide of defaultSlides) {
    await prisma.heroSlide.create({ data: slide });
  }
  return getAllForAdmin();
};

module.exports = { getAll, getAllForAdmin, create, update, remove, reorder, reset };
