const prisma = require('../prismaClient');

// Create a SaleItem
const createSaleItem = async (req, res) => {
  const { saleId, productId, quantity, price } = req.body;

  if (!saleId || !productId || !quantity || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const item = await prisma.saleItem.create({
      data: {
        saleId: Number(saleId),
        productId: Number(productId),
        quantity: Number(quantity),
        price: Number(price),
      },
      include: { product: true, sale: true },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create sale item' });
  }
};

// Get all SaleItems
const getSaleItems = async (req, res) => {
  try {
    const items = await prisma.saleItem.findMany({
      include: { product: true, sale: true },
      orderBy: { id: 'desc' },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sale items' });
  }
};

// Get SaleItem by ID
const getSaleItemById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const item = await prisma.saleItem.findUnique({
      where: { id },
      include: { product: true, sale: true },
    });

    if (!item) return res.status(404).json({ error: 'Sale item not found' });
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sale item' });
  }
};

// Update SaleItem
const updateSaleItem = async (req, res) => {
  const id = Number(req.params.id);
  const { quantity, price } = req.body;

  try {
    const item = await prisma.saleItem.update({
      where: { id },
      data: {
        quantity: quantity ? Number(quantity) : undefined,
        price: price ? Number(price) : undefined,
      },
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update sale item' });
  }
};

// Delete SaleItem 
const deleteSaleItem = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const item = await prisma.saleItem.update({
      where: { id },
      data: { quantity: 0 },
    });

    res.status(200).json({ message: 'Sale item soft-deleted', item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete sale item' });
  }
};

module.exports = {
  createSaleItem,
  getSaleItems,
  getSaleItemById,
  updateSaleItem,
  deleteSaleItem,
};
