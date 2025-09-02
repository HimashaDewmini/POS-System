const express = require('express');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');

const {
  authenticateToken,
  authorizeRoles,
  authorizePaymentAccess
} = require('../middleware/auth');

// Initialize router
const router = express.Router();

// Create Payment - accessible by Admin & Cashier
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Cashier'),
  createPayment
);

// Get all Payments - accessible by Admin & Manager
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  getPayments
);

// Get Payment by ID - Admin & Manager or owner via payment access
router.get(
  '/:id',
  authenticateToken,
  authorizePaymentAccess, 
  getPaymentById
);

// Update Payment - Admin only
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  updatePayment
);

// Delete Payment - Admin only
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  deletePayment
);

module.exports = router;

