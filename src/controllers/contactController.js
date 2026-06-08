const contactService = require('../services/contactService');

const getAll = async (req, res) => {
  try {
    const messages = await contactService.getAll();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }
    const contactMessage = await contactService.create({ firstName, lastName, email, phone, subject, message });
    res.status(201).json({ message: 'Message sent successfully', id: contactMessage.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const message = await contactService.markAsRead(req.params.id);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await contactService.remove(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await contactService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getAll, create, markAsRead, remove, getStats };
