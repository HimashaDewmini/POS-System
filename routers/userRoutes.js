const express = require('express');
const {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    authenticateToken
} = require('../controllers/userController');

const router = express.Router();

// Public Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected CRUD
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;
