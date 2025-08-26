const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create Offline Transaction
const createOfflineTransaction = async (req, res) => {
  try {
    const transaction = await prisma.offlineTransaction.create({
      data: req.body,
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offline transaction', details: err.message });
  }
};

// Get all Offline Transactions
const getOfflineTransactions = async (req, res) => {
  try {
    const transactions = await prisma.offlineTransaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offline transactions', details: err.message });
  }
};

// Get single Offline Transaction by ID
const getOfflineTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.offlineTransaction.findUnique({
      where: { id: parseInt(id) },
    });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offline transaction', details: err.message });
  }
};

// Update Offline Transaction
const updateOfflineTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTransaction = await prisma.offlineTransaction.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offline transaction', details: err.message });
  }
};

// Delete Offline Transaction
const deleteOfflineTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.offlineTransaction.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Offline transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offline transaction', details: err.message });
  }
};

// Mark Offline Transaction as Synced
const markAsSynced = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.offlineTransaction.update({
      where: { id: parseInt(id) },
      data: { synced: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark transaction as synced', details: err.message });
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
