const express = require('express');
const {
  createSaleItem,
  getSaleItems,
  getSaleItemById,
  updateSaleItem,
  deleteSaleItem
} = require('../controllers/saleItemController');

const router = express.Router();

router.get('/', getSaleItems);
router.get('/:id', getSaleItemById);
router.post('/', createSaleItem);
router.put('/:id', updateSaleItem);
router.delete('/:id', deleteSaleItem);

module.exports = router;
