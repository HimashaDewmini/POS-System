const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Get all reports
const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

// Create report
const createReport = async (req, res) => {
  const { userId, type, data } = req.body;
  if (!userId || !type || !data) {
    return res.status(400).json({ error: "userId, type, and data are required" });
  }
  try {
    const report = await prisma.report.create({
      data: {
        userId: Number(userId),
        type,
        data: typeof data === "string" ? JSON.parse(data) : data,
      },
      include: { user: true },
    });
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create report" });
  }
};

// Update report
const updateReport = async (req, res) => {
  const id = parseInt(req.params.id);
  const { type, data } = req.body;
  try {
    const report = await prisma.report.update({
      where: { id },
      data: {
        type: type || undefined,
        data: data ? (typeof data === "string" ? JSON.parse(data) : data) : undefined,
      },
    });
    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update report" });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const report = await prisma.report.delete({
      where: { id },
    });
    res.json({ message: "Report deleted", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete report" });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
};
