const express = require('express');
const { 
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const router = express.Router();

// Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// CRUD
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
