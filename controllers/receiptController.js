const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Get all receipts
const getReceipts = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: { sale: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(receipts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
};

// Get receipt by ID
const getReceiptById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { sale: true },
    });
    if (!receipt) return res.status(404).json({ error: "Receipt not found" });
    res.status(200).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
};

// Create receipt
const createReceipt = async (req, res) => {
  const { saleId, url, method } = req.body;
  if (!saleId || !method) {
    return res.status(400).json({ error: "Sale ID and method are required" });
  }
  try {
    const receipt = await prisma.receipt.create({
      data: {
        saleId: Number(saleId),
        url: url || null,
        method,
      },
      include: { sale: true },
    });
    res.status(201).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create receipt" });
  }
};

// Update receipt
const updateReceipt = async (req, res) => {
  const id = parseInt(req.params.id);
  const { url, method } = req.body;
  try {
    const receipt = await prisma.receipt.update({
      where: { id },
      data: { url, method },
    });
    res.status(200).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update receipt" });
  }
};

// Delete receipt 
const deleteReceipt = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const receipt = await prisma.receipt.update({
      where: { id },
      data: { status: "inactive" },
    });
    res.json({ message: "Receipt soft-deleted", receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete receipt" });
  }
};

module.exports = {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
};
