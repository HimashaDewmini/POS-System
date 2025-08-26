const express = require('express');
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

const router = express.Router();

// CRUD routes
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

module.exports = router;
