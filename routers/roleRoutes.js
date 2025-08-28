const express = require('express');
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Only Admin can manage roles
router.post('/', authenticateToken, authorizeRoles('Admin'), createRole);
router.get('/', authenticateToken, authorizeRoles('Admin'), getRoles);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), getRoleById);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), updateRole);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteRole);

module.exports = router;
