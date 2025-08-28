const express = require('express');
const {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getPromotionsByCustomer
} = require('../controllers/promotionController');

const router = express.Router();

// ✅ Order matters: put customer route BEFORE :id
router.post('/', createPromotion);
router.get('/', getPromotions);
router.get('/customer/:customerId', getPromotionsByCustomer);
router.get('/:id', getPromotionById);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

module.exports = router;
