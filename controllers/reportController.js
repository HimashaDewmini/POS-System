const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

// Create Report
const createReport = async (req, res) => {
  try {
    const { userId, type, startDate, endDate } = req.body;

    // Fetch sales within date range
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        payments: true,
        receipts: true,
      },
    });

    const report = await prisma.report.create({
      data: {
        userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        data: sales, // save sales details as JSON
      },
      include: { user: true, sales: true },
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
};

// Get All Reports
const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: true, sales: true },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
};

// Get Report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
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

// Update Report
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, type, startDate, endDate } = req.body;

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        payments: true,
        receipts: true,
      },
    });

    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        data: sales,
      },
      include: { user: true, sales: true },
    });

    res.json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
};

// Delete Report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report', details: err.message });
  }
};

// Generate Reports by Day/Week/Month
const generateReportByCategory = async (req, res) => {
  try {
    const { type } = req.params; // day | week | month
    let startDate, endDate;

    if (type === 'day') {
      startDate = startOfDay(new Date());
      endDate = endOfDay(new Date());
    } else if (type === 'week') {
      startDate = startOfWeek(new Date());
      endDate = endOfWeek(new Date());
    } else if (type === 'month') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else {
      return res.status(400).json({ error: 'Invalid report type. Use day, week, or month' });
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        payments: true,
        receipts: true,
      },
    });

    res.json({
      type,
      startDate,
      endDate,
      sales,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate categorized report', details: err.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  generateReportByCategory,
};
