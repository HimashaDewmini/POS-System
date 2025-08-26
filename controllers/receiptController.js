const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create Receipt
const createReceipt = async (req, res) => {
  try {
    const { saleId, method, url, status } = req.body;

    const receipt = await prisma.receipt.create({
      data: { saleId, method, url, status },
      include: { sale: true },
    });

    res.status(201).json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create receipt', details: err.message });
  }
};

// Get All Receipts
const getReceipts = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: { sale: true },
    });
    res.json(receipts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch receipts', details: err.message });
  }
};

// Get Receipt by ID
const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(id) },
      include: { sale: true },
    });

    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch receipt', details: err.message });
  }
};

// Update Receipt
const updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { saleId, method, url, status } = req.body;

    const updatedReceipt = await prisma.receipt.update({
      where: { id: parseInt(id) },
      data: { saleId, method, url, status },
      include: { sale: true },
    });

    res.json(updatedReceipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update receipt', details: err.message });
  }
};

// Delete Receipt (hard delete)
const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.receipt.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Receipt deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete receipt', details: err.message });
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
};
