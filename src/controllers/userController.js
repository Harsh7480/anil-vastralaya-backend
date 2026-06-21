const userService = require('../services/userService');

const getAll = async (req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getById = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }
    const { role } = req.body;
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or user' });
    }
    const user = await userService.updateRole(req.params.id, role);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admin users cannot be deleted' });
    }
    await userService.remove(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await userService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

module.exports = { getAll, getById, updateRole, remove, getStats };
