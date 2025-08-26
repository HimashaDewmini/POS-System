const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Create Payment
const createPayment = async (req, res) => {
  try {
    const { saleId, method, amount, transactionId, status } = req.body;

    const payment = await prisma.payment.create({
      data: { saleId, method, amount, transactionId, status },
      include: { sale: true },
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment', details: err.message });
  }
};

// Get all Payments
const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { sale: true },
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
};

// Get Payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: { sale: true },
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payment', details: err.message });
  }
};

// Update Payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { saleId, method, amount, transactionId, status } = req.body;

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { saleId, method, amount, transactionId, status },
      include: { sale: true },
    });

    res.json(updatedPayment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update payment', details: err.message });
  }
};

// Delete Payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete payment', details: err.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
