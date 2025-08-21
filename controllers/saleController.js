const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create a new sale
const createSale = async (req, res) => {
  try {
    const { userId, customerId, total, discount, tax, status, items } = req.body;

    const sale = await prisma.sale.create({
      data: {
        userId,
        customerId,
        total,
        discount,
        tax,
        status,
        items: {
          create: items, // items should be an array of { productId, quantity, price }
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create sale', details: err.message });
  }
};

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: true,
        user: true,
        customer: true,
        receipts: true,
        payments: true,
      },
    });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales', details: err.message });
  }
};

// Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        user: true,
        customer: true,
        receipts: true,
        payments: true,
      },
    });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sale', details: err.message });
  }
};

// Update sale (total, discount, tax, status)
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { total, discount, tax, status } = req.body;

    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: { total, discount, tax, status },
    });

    res.json(updatedSale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update sale', details: err.message });
  }
};

// Delete sale
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sale.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete sale', details: err.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
};
