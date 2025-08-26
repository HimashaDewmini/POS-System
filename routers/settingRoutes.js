const express = require('express');
const {
  createSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting
} = require('../controllers/settingController');

const router = express.Router();

// CRUD
router.post('/', createSetting);
router.get('/', getSettings);
router.get('/:id', getSettingById);
router.put('/:id', updateSetting);
router.delete('/:id', deleteSetting);

module.exports = router;
