const express = require('express');
const {
  createOfflineTransaction,
  getOfflineTransactions,
  getOfflineTransactionById,
  updateOfflineTransaction,
  deleteOfflineTransaction,
  markAsSynced
} = require('../controllers/offlineTransactionController');

const router = express.Router();

// CRUD
router.post('/', createOfflineTransaction);
router.get('/', getOfflineTransactions);
router.get('/:id', getOfflineTransactionById);
router.put('/:id', updateOfflineTransaction);
router.delete('/:id', deleteOfflineTransaction);

// Mark as synced
router.patch('/:id/sync', markAsSynced);

module.exports = router;
