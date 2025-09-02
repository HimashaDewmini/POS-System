const express = require('express');
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generateReportByCategory,
  exportReport,
  exportReportByCategory
} = require('../controllers/reportController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// CRUD routes 
router.get('/', authenticateToken, authorizeRoles('Admin', 'Manager'), getReports);
router.post('/', authenticateToken, authorizeRoles('Admin'), createReport);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), updateReport);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteReport);

// Generate reports by day/week/month 
router.get('/generate/:type', authenticateToken, authorizeRoles('Admin', 'Manager'), generateReportByCategory);

// Export report by ID (PDF/Excel)
router.get('/export/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), exportReport);

// Export report by Category (day/week/month) 
router.get('/export/category/:type', authenticateToken, authorizeRoles('Admin', 'Manager'), exportReportByCategory);

// GET REPORT BY ID (Admin + Manager)
router.get('/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), getReportById);

module.exports = router;
