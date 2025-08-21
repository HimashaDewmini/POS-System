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

// routes
router.post('/', createPromotion);                       
router.get('/', getPromotions);                        
router.get('/:id', getPromotionById);                   
router.put('/:id', updatePromotion);                    
router.delete('/:id', deletePromotion); 

router.get('/customer/:customerId', getPromotionsByCustomer);

module.exports = router;
