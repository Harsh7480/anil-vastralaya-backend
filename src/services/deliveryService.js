const settingsService = require('./settingsService');

const readSetting = async (key) => settingsService.getByKey(key);

const readNumber = async (key) => {
  const raw = await readSetting(key);
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeSlabs = (rawSlabs, fallbackCharge) => {
  const slabs = (Array.isArray(rawSlabs) ? rawSlabs : [])
    .map((slab) => {
      const charge = Number(slab?.charge);
      const rawUpTo = slab?.upTo;
      const upTo = rawUpTo === null || rawUpTo === undefined || rawUpTo === '' ? null : Number(rawUpTo);
      if (!Number.isFinite(charge) || charge < 0) return null;
      if (upTo !== null && (!Number.isFinite(upTo) || upTo <= 0)) return null;
      return { upTo, charge };
    })
    .filter(Boolean)
    .sort((a, b) => (a.upTo === null ? Infinity : a.upTo) - (b.upTo === null ? Infinity : b.upTo));

  return slabs.length ? slabs : [{ upTo: null, charge: fallbackCharge }];
};

const getConfig = async () => {
  const [storeLatitude, storeLongitude, radiusKm, deliveryCharge, rawSlabs, rawPincodes] = await Promise.all([
    readNumber('storeLatitude'),
    readNumber('storeLongitude'),
    readNumber('deliveryRadiusKm'),
    readNumber('deliveryCharge'),
    readSetting('deliverySlabs'),
    readSetting('serviceablePincodes'),
  ]);

  if (storeLatitude === null || storeLongitude === null) {
    throw Object.assign(new Error('Store delivery location is not configured'), { statusCode: 400 });
  }

  const fallbackCharge = deliveryCharge !== null && deliveryCharge >= 0 ? deliveryCharge : 49;

  return {
    storeLatitude,
    storeLongitude,
    radiusKm: radiusKm && radiusKm > 0 ? radiusKm : 10,
    fallbackCharge,
    slabs: normalizeSlabs(rawSlabs, fallbackCharge),
    serviceablePincodes: String(rawPincodes || '')
      .split(',')
      .map((pincode) => pincode.trim())
      .filter(Boolean),
  };
};

const chargeForSubtotal = (subtotal, config) => {
  const slab = config.slabs.find((item) => item.upTo === null || subtotal <= item.upTo);
  return slab ? slab.charge : config.fallbackCharge;
};

const calculate = async ({ latitude, longitude, pincode, subtotal }) => {
  const amount = Number(subtotal);
  if (!Number.isFinite(amount) || amount < 0) {
    throw Object.assign(new Error('A valid cart subtotal is required for delivery charges'), { statusCode: 400 });
  }

  const config = await getConfig();
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasLocation =
    latitude !== null && latitude !== undefined && latitude !== '' &&
    longitude !== null && longitude !== undefined && longitude !== '' &&
    Number.isFinite(lat) && Number.isFinite(lng);
  const deliveryCharge = chargeForSubtotal(amount, config);

  if (hasLocation) {
    const distanceKm = haversineKm(lat, lng, config.storeLatitude, config.storeLongitude);
    if (distanceKm > config.radiusKm) {
      throw Object.assign(
        new Error(`Delivery is available only within ${config.radiusKm} KM of our store`),
        { statusCode: 400, distanceKm: Number(distanceKm.toFixed(2)), radiusKm: config.radiusKm }
      );
    }
    return {
      deliveryMode: 'location',
      distanceKm: Number(distanceKm.toFixed(2)),
      radiusKm: config.radiusKm,
      deliveryCharge,
      subtotal: amount,
    };
  }

  const normalizedPincode = String(pincode || '').trim();
  if (!/^\d{6}$/.test(normalizedPincode)) {
    throw Object.assign(new Error('Please share your location or enter a valid 6-digit pincode'), { statusCode: 400 });
  }
  if (!config.serviceablePincodes.length) {
    throw Object.assign(new Error('Pincode delivery is not configured yet. Please use your location.'), { statusCode: 400 });
  }
  if (!config.serviceablePincodes.includes(normalizedPincode)) {
    throw Object.assign(new Error('Delivery is not available at this pincode'), { statusCode: 400 });
  }

  return {
    deliveryMode: 'pincode',
    distanceKm: null,
    radiusKm: config.radiusKm,
    deliveryCharge,
    subtotal: amount,
    pincode: normalizedPincode,
  };
};

module.exports = { calculate, getConfig, chargeForSubtotal };
