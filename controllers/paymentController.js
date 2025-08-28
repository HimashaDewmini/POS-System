const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Middleware helper for role check
const checkRole = (roles, userRole) => roles.includes(userRole);

// Create Payment
const createPayment = async (req, res) => {
  try {
    const userRole = req.user.roleName; // assume JWT middleware sets req.user
    if (!checkRole(['Cashier', 'Admin'], userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let { saleId, method, amount, transactionId, status } = req.body;

    if (!saleId || !method || !amount || !status) {
      return res.status(400).json({ error: 'saleId, method, amount, and status are required' });
    }

    const saleIdNum = parseInt(saleId, 10);
    if (Number.isNaN(saleIdNum)) return res.status(400).json({ error: 'Invalid saleId' });

    const sale = await prisma.sale.findUnique({ where: { id: saleIdNum } });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const payment = await prisma.payment.create({
      data: { saleId: saleIdNum, method, amount, transactionId, status },
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
    const userRole = req.user.roleName;
    if (!checkRole(['Admin', 'Manager'], userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payments = await prisma.payment.findMany({ include: { sale: true } });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
};

// Get Payment by ID
const getPaymentById = async (req, res) => {
  try {
    const userRole = req.user.roleName;
    if (!checkRole(['Admin', 'Manager'], userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const idNum = parseInt(req.params.id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid payment ID' });

    const payment = await prisma.payment.findUnique({ where: { id: idNum }, include: { sale: true } });
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
    const userRole = req.user.roleName;
    if (!checkRole(['Admin'], userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const idNum = parseInt(req.params.id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid payment ID' });

    let { saleId, method, amount, transactionId, status } = req.body;
    const saleIdNum = saleId ? parseInt(saleId, 10) : undefined;
    if (saleId && Number.isNaN(saleIdNum)) return res.status(400).json({ error: 'Invalid saleId' });

    if (saleIdNum) {
      const sale = await prisma.sale.findUnique({ where: { id: saleIdNum } });
      if (!sale) return res.status(404).json({ error: 'Sale not found' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: idNum },
      data: { saleId: saleIdNum, method, amount, transactionId, status },
      include: { sale: true },
    });

    res.json(updatedPayment);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Payment not found' });
    res.status(500).json({ error: 'Failed to update payment', details: err.message });
  }
};

// Delete Payment
const deletePayment = async (req, res) => {
  try {
    const userRole = req.user.roleName;
    if (!checkRole(['Admin'], userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const idNum = parseInt(req.params.id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid payment ID' });

    await prisma.payment.delete({ where: { id: idNum } });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Payment not found' });
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
