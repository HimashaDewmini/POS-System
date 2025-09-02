const express = require('express');
const router = express.Router();

const {
  createOfflineTransaction,
  getOfflineTransactions,
  getOfflineTransactionById,
  updateOfflineTransaction,
  deleteOfflineTransaction,
  markAsSynced,
} = require('../controllers/offlineTransactionController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create offline transaction
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Cashier', 'Manager'),
  createOfflineTransaction
);

// Get all offline transactions
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  getOfflineTransactions
);

// Get offline transaction by ID
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  getOfflineTransactionById
);

// Update offline transaction
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  updateOfflineTransaction
);

// Delete offline transaction
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  deleteOfflineTransaction
);

// Mark offline transaction as synced
router.patch(
  '/:id/sync',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  markAsSynced
);

module.exports = router;
