const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Middleware for JWT authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied, token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = {
      id: user.id,
      email: user.email,
      roleName: user.role ? user.role.name : 'user',
    };

    next();
  } catch (err) {
    console.error('JWT Auth Error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.roleName)) {
    return res.status(403).json({ error: 'Access denied: insufficient permissions' });
  }
  next();
};

// Ownership check for products
const authorizeProductOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (['Admin', 'Manager'].includes(req.user.roleName)) return next();

    const productId = parseInt(id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    return res.status(403).json({ error: 'Access denied: cannot modify this product' });
  } catch (err) {
    console.error('Product Ownership Error:', err.message);
    return res.status(500).json({ error: 'Server error while checking product ownership' });
  }
};

// Ownership / access check for sales
const authorizeSaleAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (['Admin', 'Manager'].includes(req.user.roleName)) return next();

    const saleId = parseInt(id, 10);
    if (isNaN(saleId)) return res.status(400).json({ error: 'Invalid sale ID' });

    const sale = await prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    if (sale.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: cannot access this sale' });
    }

    next();
  } catch (err) {
    console.error('Sale Ownership Error:', err.message);
    return res.status(500).json({ error: 'Server error while checking sale ownership' });
  }
};

// Ownership / access check for payments
const authorizePaymentAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (['Admin'].includes(req.user.roleName)) return next();

    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) return res.status(400).json({ error: 'Invalid payment ID' });

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const sale = await prisma.sale.findUnique({ where: { id: payment.saleId } });
    if (!sale) return res.status(404).json({ error: 'Associated sale not found' });

    if (sale.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: cannot access this payment' });
    }

    next();
  } catch (err) {
    console.error('Payment Access Error:', err.message);
    return res.status(500).json({ error: 'Server error while checking payment access' });
  }
};

// Ownership / access check for receipts
const authorizeReceiptAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (['Admin'].includes(req.user.roleName)) return next();

    const receiptId = parseInt(id, 10);
    if (isNaN(receiptId)) return res.status(400).json({ error: 'Invalid receipt ID' });

    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    const sale = await prisma.sale.findUnique({ where: { id: receipt.saleId } });
    if (!sale) return res.status(404).json({ error: 'Associated sale not found' });

    if (req.user.roleName === 'Cashier' && sale.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: cannot access this receipt' });
    }

    next();
  } catch (err) {
    console.error('Receipt Access Error:', err.message);
    return res.status(500).json({ error: 'Server error while checking receipt access' });
  }
};

// RBAC for Offline Transactions
const authorizeOfflineTransaction = async (req, res, next) => {
  try {
    // Admin and Manager can access all offline transactions
    if (['Admin', 'Manager'].includes(req.user.roleName)) return next();

    // Cashiers cannot access offline transactions
    return res.status(403).json({ error: 'Access denied: insufficient permissions for offline transactions' });
  } catch (err) {
    console.error('Offline Transaction Access Error:', err.message);
    return res.status(500).json({ error: 'Server error while checking offline transaction access' });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeProductOwner,
  authorizeSaleAccess,
  authorizePaymentAccess,
  authorizeReceiptAccess,
  authorizeOfflineTransaction, 
};
