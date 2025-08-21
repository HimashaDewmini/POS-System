const express = require('express');
const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale
} = require('../controllers/saleController');

const router = express.Router();

// CRUD routes
router.post('/', createSale);       // Create sale
router.get('/', getSales);          // Get all sales
router.get('/:id', getSaleById);    // Get sale by ID
router.put('/:id', updateSale);     // Update sale
router.delete('/:id', deleteSale);  // Delete sale

module.exports = router;
