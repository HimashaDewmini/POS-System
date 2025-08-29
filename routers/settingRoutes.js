const express = require('express');
const {
  createSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting
} = require('../controllers/settingController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// -------------------- CRUD routes with role-based access --------------------

// ✅ Only Admin can create a setting
router.post('/', authenticateToken, authorizeRoles('Admin'), createSetting);

// ✅ Admin + Manager can view settings
router.get('/', authenticateToken, authorizeRoles('Admin', 'Manager'), getSettings);
router.get('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), getSettingById);

// ✅ Only Admin can update or delete a setting
router.put('/:id', authenticateToken, authorizeRoles('Admin'), updateSetting);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteSetting);

module.exports = router;
