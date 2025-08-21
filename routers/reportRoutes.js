const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// CRUD endpoints
router.get('/', reportController.getReports);         // Get all reports
router.get('/:id', reportController.getReportById);  // Get report by ID
router.post('/', reportController.createReport);     // Create report
router.put('/:id', reportController.updateReport);   // Update report
router.delete('/:id', reportController.deleteReport);// Delete report

module.exports = router;
