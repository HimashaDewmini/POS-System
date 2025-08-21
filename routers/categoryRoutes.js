const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/orders', getCategories);
router.get('/orders/:id', getCategoryById);
router.post('/orders', createCategory);
router.put('/orders/:id', updateCategory);
router.delete('/orders/:id', deleteCategory);

module.exports = router;
