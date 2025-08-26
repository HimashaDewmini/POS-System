const express = require('express');
const {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt
} = require('../controllers/receiptController');

const router = express.Router();

// CRUD routes
router.post('/', createReceipt);
router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.put('/:id', updateReceipt);
router.delete('/:id', deleteReceipt);

module.exports = router;
