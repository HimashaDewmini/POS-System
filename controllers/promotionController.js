const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Configure your email transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail app password
  },
});

// Create a new promotion
const createPromotion = async (req, res) => {
  try {
    const { customerId, type, content, sentAt } = req.body;

    const customerIdNum = parseInt(customerId, 10);
    if (Number.isNaN(customerIdNum)) {
      return res.status(400).json({ error: 'Invalid customerId' });
    }
    if (!type || !content) {
      return res.status(400).json({ error: 'type and content are required' });
    }

    const promotion = await prisma.promotion.create({
      data: {
        customerId: customerIdNum,
        type,
        content,
        sentAt: sentAt ? new Date(sentAt) : null,
      },
      include: { customer: true },
    });

    // Send email if type is Email and customer has an email
    if (type.toLowerCase() === 'email' && promotion.customer.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: promotion.customer.email,
          subject: 'New Promotion',
          text: content,
        });
        console.log(`Promotion email sent to ${promotion.customer.email}`);
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }
    }

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
    const idNum = parseInt(req.params.id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid promotion ID' });

    const promotion = await prisma.promotion.findUnique({
      where: { id: idNum },
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
    const idNum = parseInt(req.params.id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid promotion ID' });

    const { customerId, type, content, sentAt } = req.body;
    const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
    if (customerId && Number.isNaN(customerIdNum)) {
      return res.status(400).json({ error: 'Invalid customerId' });
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: idNum },
      data: {
        customerId: customerIdNum,
        type,
        content,
        sentAt: sentAt ? new Date(sentAt) : null,
      },
      include: { customer: true },
    });

    res.json(updatedPromotion);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.status(500).json({ error: 'Failed to update promotion', details: err.message });
  }
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid promotion ID' });

    await prisma.promotion.delete({
      where: { id: idNum },
    });

    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    res.status(500).json({ error: 'Failed to delete promotion', details: err.message });
  }
};

// Get promotions by customerId
const getPromotionsByCustomer = async (req, res) => {
  try {
    const customerIdNum = parseInt(req.params.customerId, 10);
    if (Number.isNaN(customerIdNum)) {
      return res.status(400).json({ error: 'Invalid customerId' });
    }

    const promotions = await prisma.promotion.findMany({
      where: { customerId: customerIdNum },
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
