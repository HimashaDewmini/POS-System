const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create a new sale (Cashier/Manager/Admin)
const createSale = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body missing' });
    }

    let { customerId, total = 0, discount = 0, tax = 0, status = 'pending', items = [] } = req.body;

    // userId comes from JWT
    const userId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' });
    }

    // Validate customerId
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (!customer) return res.status(400).json({ error: `Customer ID ${customerId} does not exist` });
      customerId = parseInt(customerId);
    } else {
      customerId = null; // allow null for walk-in sales
    }

    // Validate each productId
    for (let i = 0; i < items.length; i++) {
      const productId = parseInt(items[i].productId);
      if (!productId) return res.status(400).json({ error: `Invalid productId at item index ${i}` });

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(400).json({ error: `Product ID ${productId} does not exist` });

      items[i].productId = productId;
      items[i].quantity = items[i].quantity ? parseInt(items[i].quantity) : 1;
      items[i].price = items[i].price ? parseFloat(items[i].price) : parseFloat(product.price || 0);
    }

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        userId,
        customerId,
        total: parseFloat(total),
        discount: parseFloat(discount),
        tax: parseFloat(tax),
        status,
        items: {
          create: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error('Create Sale Error:', err);
    res.status(500).json({ error: 'Failed to create sale', details: err.message });
  }
};

// Get all sales (Manager/Admin)
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
    console.error('Get Sales Error:', err);
    res.status(500).json({ error: 'Failed to fetch sales', details: err.message });
  }
};

// Get sale by ID (Manager/Admin or owner Cashier)
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Sale ID is required' });

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

    // Ownership check for Cashiers handled by middleware
    res.json(sale);
  } catch (err) {
    console.error('Get Sale By ID Error:', err);
    res.status(500).json({ error: 'Failed to fetch sale', details: err.message });
  }
};

// Update sale (Manager/Admin)
const updateSale = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Request body missing' });

    const { id } = req.params;
    const { total, discount, tax, status } = req.body;

    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: {
        total: total !== undefined ? parseFloat(total) : undefined,
        discount: discount !== undefined ? parseFloat(discount) : undefined,
        tax: tax !== undefined ? parseFloat(tax) : undefined,
        status,
      },
    });

    res.json(updatedSale);
  } catch (err) {
    console.error('Update Sale Error:', err);
    res.status(500).json({ error: 'Failed to update sale', details: err.message });
  }
};

// Delete sale (Admin only)
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Sale ID is required' });

    await prisma.sale.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    console.error('Delete Sale Error:', err);
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
