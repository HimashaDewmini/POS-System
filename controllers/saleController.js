const prisma = require('../prismaClient');

// Create a Sale
const createSale = async (req, res) => {
  const { userId, customerId, total, discount, tax, paymentType, status, items } = req.body;

  if (!userId || !total || !paymentType || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or items' });
  }

  try {
    const sale = await prisma.sale.create({
      data: {
        userId: Number(userId),
        customerId: customerId ? Number(customerId) : null,
        total: Number(total),
        discount: discount ? Number(discount) : 0,
        tax: tax ? Number(tax) : 0,
        paymentType,
        status: status || 'completed',
        items: {
          create: items.map(item => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
      include: { items: true, customer: true, user: true, receipts: true },
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

// Get all Sales
const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { items: true, customer: true, user: true, receipts: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

// Get Sale by ID
const getSaleById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true, customer: true, user: true, receipts: true },
    });

    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.status(200).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
};

// Update Sale
const updateSale = async (req, res) => {
  const id = Number(req.params.id);
  const { total, discount, tax, paymentType, status } = req.body;

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        total: total ? Number(total) : undefined,
        discount: discount ? Number(discount) : undefined,
        tax: tax ? Number(tax) : undefined,
        paymentType,
        status,
      },
    });

    res.status(200).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update sale' });
  }
};

// Delete Sale 
const deleteSale = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.status(200).json({ message: 'Sale cancelled', sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel sale' });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
};
