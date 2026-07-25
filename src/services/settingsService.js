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
  const operations = [];

  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        const stringValue = typeof nestedValue === 'string' ? nestedValue : JSON.stringify(nestedValue);
        operations.push(
          prisma.settings.upsert({
            where: { key: nestedKey },
            update: { value: stringValue },
            create: { key: nestedKey, value: stringValue },
          })
        );
      }
    } else {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      operations.push(
        prisma.settings.upsert({
          where: { key },
          update: { value: stringValue },
          create: { key, value: stringValue },
        })
      );
    }
  }

  await Promise.all(operations);
  return getAll();
};

module.exports = { getAll, getByKey, update, bulkUpdate };
