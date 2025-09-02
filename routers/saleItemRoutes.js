const express = require('express');
const {
  createSaleItem,
  getSaleItems,
  getSaleItemById,
  updateSaleItem,
  deleteSaleItem
} = require('../controllers/saleItemController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create (Cashier, Manager, Admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Cashier', 'Manager', 'Admin'),
  createSaleItem
);

// Read (all) – Cashier sees only their own sales' items
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Cashier', 'Manager', 'Admin'),
  getSaleItems
);

// Read (one) – Cashier only if owns the sale
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Cashier', 'Manager', 'Admin'),
  getSaleItemById
);

// Update – Cashier allowed only on their own sales; Manager/Admin unrestricted
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Cashier', 'Manager', 'Admin'),
  updateSaleItem
);

// Delete – Manager/Admin only (policy)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Manager', 'Admin'),
  deleteSaleItem
);

module.exports = router;
