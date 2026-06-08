const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  const settings = await prisma.settings.findMany();
  const result = {};
  for (const setting of settings) {
    try {
      result[setting.key] = JSON.parse(setting.value);
    } catch {
      result[setting.key] = setting.value;
    }
  }
  return result;
};

const getByKey = async (key) => {
  const setting = await prisma.settings.findUnique({ where: { key } });
  if (!setting) return null;
  try {
    return JSON.parse(setting.value);
  } catch {
    return setting.value;
  }
};

const update = async (key, value) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  return prisma.settings.upsert({
    where: { key },
    update: { value: stringValue },
    create: { key, value: stringValue },
  });
};

const bulkUpdate = async (settings) => {
  const operations = Object.entries(settings).map(([key, value]) => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return prisma.settings.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });
  });

  await Promise.all(operations);
  return getAll();
};

module.exports = { getAll, getByKey, update, bulkUpdate };
