const express = require('express');
const {
  getAll,
  getAllForAdmin,
  create,
  update,
  remove,
  reorder,
  reset,
  uploadImage,
} = require('../controllers/heroController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const heroUpload = require('../middleware/heroUpload');

const router = express.Router();

router.get('/', getAll);
router.get('/all', authenticate, authorizeRoles('superadmin'), getAllForAdmin);
router.post('/', authenticate, authorizeRoles('superadmin'), create);
router.put('/reorder', authenticate, authorizeRoles('superadmin'), reorder);
router.put('/:id', authenticate, authorizeRoles('superadmin'), update);
router.delete('/:id', authenticate, authorizeRoles('superadmin'), remove);
router.post('/reset', authenticate, authorizeRoles('superadmin'), reset);
router.post('/upload', authenticate, authorizeRoles('superadmin'), heroUpload.single('image'), uploadImage);

module.exports = router;
