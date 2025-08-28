const express = require('express');
const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale
} = require('../controllers/saleController');

const { authenticateToken, authorizeRoles, authorizeSaleAccess } = require('../middleware/auth');

const router = express.Router();

// Cashier, Manager, Admin → create sale
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Cashier', 'Manager', 'Admin'),
  createSale
);

// Manager, Admin → view all sales
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Manager', 'Admin'),
  getSales
);

// Manager, Admin, Cashier → view a specific sale
// Cashiers can only access their own sales
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Manager', 'Admin', 'Cashier'),
  authorizeSaleAccess,
  getSaleById
);

// Manager, Admin → update sale
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Manager', 'Admin'),
  updateSale
);

// Admin only → delete sale
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  deleteSale
);

module.exports = router;
