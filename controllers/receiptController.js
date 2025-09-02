const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper to generate receipt PDF
const generateReceiptPDF = async (receiptData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const receiptsDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

    const filePath = path.join(receiptsDir, `receipt_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // PDF content
    doc.fontSize(20).text('Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Receipt ID: ${receiptData.id}`);
    doc.text(`Sale ID: ${receiptData.saleId}`);
    doc.text(`Method: ${receiptData.method}`);
    doc.text(`Amount: ${receiptData.sale.amount || 'N/A'}`);
    doc.text(`Created At: ${new Date().toLocaleString()}`);
    doc.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', (err) => reject(err));
  });
};

//Create Receipt
const createReceipt = async (req, res) => {
  try {
    const { saleId, method } = req.body;
    const user = req.user;

    const sale = await prisma.sale.findUnique({ where: { id: parseInt(saleId) } });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    if (user.roleName === 'Cashier' && sale.userId !== user.id) {
      return res.status(403).json({ error: 'Access denied: Cannot create receipt for this sale' });
    }

    const receipt = await prisma.receipt.create({
      data: { saleId: sale.id, method },
      include: { sale: true },
    });

    const pdfPath = await generateReceiptPDF(receipt);
    const pdfURL = `/uploads/receipts/${path.basename(pdfPath)}`;

    const updatedReceipt = await prisma.receipt.update({
      where: { id: receipt.id },
      data: { url: pdfURL },
      include: { sale: true },
    });

    res.status(201).json(updatedReceipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create receipt', details: err.message });
  }
};

//Get All Receipts
const getReceipts = async (req, res) => {
  try {
    const { saleId, method, startDate, endDate } = req.query;
    const user = req.user;

    let whereClause = {};
    if (saleId) whereClause.saleId = parseInt(saleId);
    if (method) whereClause.method = method;
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (user.roleName === 'Cashier') {
      whereClause.sale = { userId: user.id };
    }

    const receipts = await prisma.receipt.findMany({
      where: whereClause,
      include: { sale: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(receipts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch receipts', details: err.message });
  }
};

//Get Receipt by ID
const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(id) },
      include: { sale: true },
    });
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    if (user.roleName === 'Cashier' && receipt.sale.userId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch receipt', details: err.message });
  }
};

//Update Receipt (Admin only)
const updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, url, status } = req.body;
    const user = req.user;

    if (user.roleName !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Only Admins can update receipts' });
    }

    const updatedReceipt = await prisma.receipt.update({
      where: { id: parseInt(id) },
      data: { method, url, status },
      include: { sale: true },
    });

    res.json(updatedReceipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update receipt', details: err.message });
  }
};

// Soft Delete Receipt (Admin only)
const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (user.roleName !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Only Admins can delete receipts' });
    }

    const deleted = await prisma.receipt.update({
      where: { id: parseInt(id) },
      data: { status: 'inactive' },
    });

    res.json({ message: 'Receipt deactivated successfully', receipt: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete receipt', details: err.message });
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
};


