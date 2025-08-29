const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// -------------------- CREATE REPORT (Admin only) --------------------
const createReport = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName !== 'Admin') return res.status(403).json({ error: 'Access denied: Only Admins can create reports' });

    const { userId, type, startDate, endDate } = req.body;

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      include: { items: { include: { product: true } }, customer: true, payments: true, receipts: true },
    });

    const report = await prisma.report.create({
      data: { userId, type, startDate: new Date(startDate), endDate: new Date(endDate), data: sales },
      include: { user: true, sales: true },
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
};

// -------------------- GET ALL REPORTS (Admin + Manager) --------------------
const getReports = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName === 'Cashier') return res.status(403).json({ error: 'Access denied: Cannot view reports' });

    const reports = await prisma.report.findMany({
      include: { user: true, sales: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
};

// -------------------- GET REPORT BY ID (Admin + Manager) --------------------
const getReportById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (user.roleName === 'Cashier') return res.status(403).json({ error: 'Access denied' });

    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, sales: true },
    });

    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report', details: err.message });
  }
};

// -------------------- UPDATE REPORT (Admin only) --------------------
const updateReport = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName !== 'Admin') return res.status(403).json({ error: 'Access denied: Only Admins can update reports' });

    const { id } = req.params;
    const { userId, type, startDate, endDate } = req.body;

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      include: { items: { include: { product: true } }, customer: true, payments: true, receipts: true },
    });

    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { userId, type, startDate: new Date(startDate), endDate: new Date(endDate), data: sales },
      include: { user: true, sales: true },
    });

    res.json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
};

// -------------------- DELETE REPORT (Admin only) --------------------
const deleteReport = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName !== 'Admin') return res.status(403).json({ error: 'Access denied: Only Admins can delete reports' });

    const { id } = req.params;
    await prisma.report.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report', details: err.message });
  }
};

// -------------------- GENERATE REPORT BY DAY/WEEK/MONTH --------------------
const generateReportByCategory = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName === 'Cashier') return res.status(403).json({ error: 'Access denied: Cannot view reports' });

    const { type } = req.params; // day | week | month
    const { productId, userId, customerId } = req.query;

    const now = new Date();
    let startDate, endDate;

    if (type === 'day') { startDate = startOfDay(now); endDate = endOfDay(now); }
    else if (type === 'week') { startDate = startOfWeek(now); endDate = endOfWeek(now); }
    else if (type === 'month') { startDate = startOfMonth(now); endDate = endOfMonth(now); }
    else return res.status(400).json({ error: 'Invalid report type. Use day, week, or month' });

    let whereClause = { createdAt: { gte: startDate, lte: endDate } };
    if (productId) whereClause.items = { some: { productId: parseInt(productId) } };
    if (userId) whereClause.userId = parseInt(userId);
    if (customerId) whereClause.customerId = parseInt(customerId);

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: { items: { include: { product: true } }, customer: true, payments: true, receipts: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ type, startDate, endDate, sales });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate categorized report', details: err.message });
  }
};

// -------------------- EXPORT REPORT (PDF/Excel with charts, by ID) --------------------
const exportReport = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName === 'Cashier') return res.status(403).json({ error: 'Access denied: Cannot export reports' });

    const { id } = req.params;
    const { format } = req.query;

    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: { sales: { include: { items: { include: { product: true } }, customer: true, payments: true, receipts: true } }, user: true },
    });

    if (!report) return res.status(404).json({ error: 'Report not found' });

    return await generateAndSendFile(report, format, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export report', details: err.message });
  }
};

// -------------------- EXPORT REPORT BY CATEGORY (day/week/month) --------------------
const exportReportByCategory = async (req, res) => {
  try {
    const user = req.user;
    if (user.roleName === 'Cashier') return res.status(403).json({ error: 'Access denied: Cannot export reports' });

    const { type } = req.params;
    const { format } = req.query;

    const now = new Date();
    let startDate, endDate;

    if (type === 'day') { startDate = startOfDay(now); endDate = endOfDay(now); }
    else if (type === 'week') { startDate = startOfWeek(now); endDate = endOfWeek(now); }
    else if (type === 'month') { startDate = startOfMonth(now); endDate = endOfMonth(now); }
    else return res.status(400).json({ error: 'Invalid type for export' });

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { items: { include: { product: true } }, customer: true, payments: true, receipts: true },
    });

    const report = {
      id: 0,
      type,
      startDate,
      endDate,
      sales,
      user: { firstName: user.firstName || 'System', lastName: user.lastName || '' }
    };

    return await generateAndSendFile(report, format, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export report by category', details: err.message });
  }
};

// -------------------- COMMON FILE GENERATOR --------------------
async function generateAndSendFile(report, format, res) {
  const fileName = `report_${report.type || report.id}_${Date.now()}`;
  const uploadsDir = path.join(__dirname, '../uploads/reports');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const filePath = path.join(uploadsDir, `${fileName}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(`Report: ${report.type}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Created By: ${report.user.firstName} ${report.user.lastName}`);
    doc.text(`Date Range: ${report.startDate.toDateString()} - ${report.endDate.toDateString()}`);
    doc.moveDown();

    // Chart
    const productTotals = {};
    report.sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productTotals[item.product.name]) productTotals[item.product.name] = 0;
        productTotals[item.product.name] += item.quantity;
      });
    });

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });
    const configuration = {
      type: 'bar',
      data: {
        labels: Object.keys(productTotals),
        datasets: [{
          label: 'Quantity Sold',
          data: Object.values(productTotals),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      },
      options: { plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } },
    };

    const chartBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    doc.addPage();
    doc.image(chartBuffer, { align: 'center', fit: [500, 300] });

    report.sales.forEach(sale => {
      doc.addPage();
      doc.text(`Sale #${sale.id} | Customer: ${sale.customer?.name || 'N/A'} | Total: ${sale.total}`);
      sale.items.forEach(item => doc.text(`  - ${item.product.name} x ${item.quantity} = ${item.price}`));
    });

    doc.end();
    return res.download(filePath);

  } else if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    sheet.columns = [
      { header: 'Sale ID', key: 'saleId', width: 10 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Product', key: 'product', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Total', key: 'total', width: 10 },
    ];

    report.sales.forEach(sale => {
      sale.items.forEach(item => {
        sheet.addRow({
          saleId: sale.id,
          customer: sale.customer?.name || 'N/A',
          product: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: sale.total,
        });
      });
    });

    const filePath = path.join(uploadsDir, `${fileName}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return res.download(filePath);

  } else {
    return res.status(400).json({ error: 'Invalid format. Use pdf or excel' });
  }
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  generateReportByCategory,
  exportReport,
  exportReportByCategory
};
