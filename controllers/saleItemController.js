const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create SaleItem
const createSaleItem = async (req, res) => {
  try {
    const { saleId, productId, quantity, price } = req.body;

    const saleItem = await prisma.saleItem.create({
      data: { saleId, productId, quantity, price },
      include: { product: true, sale: true },
    });

    res.status(201).json(saleItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create sale item', details: err.message });
  }
};

// Get all SaleItems
const getSaleItems = async (req, res) => {
  try {
    const items = await prisma.saleItem.findMany({
      include: { product: true, sale: true },
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sale items', details: err.message });
  }
};

// Get SaleItem by ID
const getSaleItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.saleItem.findUnique({
      where: { id: parseInt(id) },
      include: { product: true, sale: true },
    });
    if (!item) return res.status(404).json({ error: 'SaleItem not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sale item', details: err.message });
  }
};

// Update SaleItem
const updateSaleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { saleId, productId, quantity, price } = req.body;

    const updatedItem = await prisma.saleItem.update({
      where: { id: parseInt(id) },
      data: { saleId, productId, quantity, price },
      include: { product: true, sale: true },
    });

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update sale item', details: err.message });
  }
};

// Delete SaleItem
const deleteSaleItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.saleItem.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'SaleItem deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete sale item', details: err.message });
  }
};

module.exports = {
  createSaleItem,
  getSaleItems,
  getSaleItemById,
  updateSaleItem,
  deleteSaleItem,
};
