const express = require('express');
const {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt
} = require('../controllers/receiptController');

const {
  authenticateToken,
  authorizeRoles,
  authorizeReceiptAccess 
} = require('../middleware/auth'); 

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new receipt (Admin + Cashier)
router.post('/', authorizeRoles('Admin', 'Cashier'), createReceipt);

// Get all receipts (Admin + Manager + Cashier)
router.get('/', authorizeRoles('Admin', 'Manager', 'Cashier'), getReceipts);

//  Get single receipt (RBAC handled by controller / middleware)
router.get('/:id', authorizeReceiptAccess, getReceiptById);

//  Update receipt (Admin only)
router.put('/:id', authorizeRoles('Admin'), updateReceipt);

//  Soft delete receipt (Admin only)
router.delete('/:id', authorizeRoles('Admin'), deleteReceipt);

module.exports = router;
