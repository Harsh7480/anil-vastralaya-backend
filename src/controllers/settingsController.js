const settingsService = require('../services/settingsService');

const getAll = async (req, res) => {
  try {
    const settings = await settingsService.getAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const getByKey = async (req, res) => {
  try {
    const value = await settingsService.getByKey(req.params.key);
    if (value === null) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    await settingsService.update(req.params.key, value);
    res.json({ message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkUpdate = async (req, res) => {
  try {
    const settings = await settingsService.bulkUpdate(req.body);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getByKey, update, bulkUpdate };
