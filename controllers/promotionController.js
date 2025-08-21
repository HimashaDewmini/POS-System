const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create a new promotion
const createPromotion = async (req, res) => {
  try {
    const { customerId, type, content, sentAt } = req.body;

    const promotion = await prisma.promotion.create({
      data: {
        customerId,
        type,
        content,
        sentAt: sentAt ? new Date(sentAt) : null,
      },
    });

    res.status(201).json(promotion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create promotion', details: err.message });
  }
};

// Get all promotions
const getPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      include: { customer: true },
    });
    res.json(promotions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch promotions', details: err.message });
  }
};

// Get promotion by ID
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
      include: { customer: true },
    });

    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });

    res.json(promotion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch promotion', details: err.message });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, type, content, sentAt } = req.body;

    const updatedPromotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: {
        customerId,
        type,
        content,
        sentAt: sentAt ? new Date(sentAt) : null,
      },
    });

    res.json(updatedPromotion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update promotion', details: err.message });
  }
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.promotion.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete promotion', details: err.message });
  }
};

// Get promotions by customerId
const getPromotionsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const promotions = await prisma.promotion.findMany({
      where: { customerId: parseInt(customerId) },
      include: { customer: true },
    });

    res.json(promotions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch promotions', details: err.message });
  }
};

module.exports = {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getPromotionsByCustomer,
};
