const express = require('express');
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', authenticateToken, authorizeRoles('Admin', 'Manager'), getUsers);
router.get('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), getUserById);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteUser); 

module.exports = router;
