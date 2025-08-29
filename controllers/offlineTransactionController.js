const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Create Offline Transaction
 * Only Admin, Cashier, Manager can create
 * Validates that `data` field exists in the request body
 */
const createOfflineTransaction = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Transaction data is required and must be a JSON object' });
    }

    const transaction = await prisma.offlineTransaction.create({
      data: { data, synced: false },
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Create Offline Transaction Error:', err.message);
    res.status(500).json({ error: 'Failed to create offline transaction', details: err.message });
  }
};

/**
 * Get all Offline Transactions
 * Admin and Manager can view all
 */
const getOfflineTransactions = async (req, res) => {
  try {
    const transactions = await prisma.offlineTransaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(transactions);
  } catch (err) {
    console.error('Get Offline Transactions Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch offline transactions', details: err.message });
  }
};

/**
 * Get single Offline Transaction by ID
 */
const getOfflineTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.offlineTransaction.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Offline transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Get Offline Transaction By ID Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch offline transaction', details: err.message });
  }
};

/**
 * Update Offline Transaction
 * Admin and Manager can update
 * Can update `data` and `synced` fields
 */
const updateOfflineTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, synced } = req.body;

    if (data && typeof data !== 'object') {
      return res.status(400).json({ error: '`data` field must be a JSON object' });
    }

    const updatedTransaction = await prisma.offlineTransaction.update({
      where: { id: parseInt(id, 10) },
      data: {
        data: data ?? undefined,
        synced: typeof synced === 'boolean' ? synced : undefined,
      },
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error('Update Offline Transaction Error:', err.message);
    res.status(500).json({ error: 'Failed to update offline transaction', details: err.message });
  }
};

/**
 * Delete Offline Transaction
 * Only Admin can delete
 */
const deleteOfflineTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.offlineTransaction.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Offline transaction deleted successfully' });
  } catch (err) {
    console.error('Delete Offline Transaction Error:', err.message);
    res.status(500).json({ error: 'Failed to delete offline transaction', details: err.message });
  }
};

/**
 * Mark Offline Transaction as Synced
 * Admin and Manager can mark synced
 */
const markAsSynced = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.offlineTransaction.update({
      where: { id: parseInt(id, 10) },
      data: { synced: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('Mark Offline Transaction Synced Error:', err.message);
    res.status(500).json({ error: 'Failed to mark offline transaction as synced', details: err.message });
  }
};

module.exports = {
  createOfflineTransaction,
  getOfflineTransactions,
  getOfflineTransactionById,
  updateOfflineTransaction,
  deleteOfflineTransaction,
  markAsSynced,
};
