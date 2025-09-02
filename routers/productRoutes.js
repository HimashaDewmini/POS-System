const express = require('express');
const multer = require('multer');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/productController');

const { authenticateToken, authorizeRoles, authorizeProductOwner } = require('../middleware/auth');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'), 
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Admins and Managers can create products
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  upload.array('images', 5),
  createProduct
);

// Admins and Managers can update/delete only if they own the product or have role permissions
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  authorizeProductOwner, 
  upload.array('images', 5),
  updateProduct
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  authorizeProductOwner, 
  deleteProduct
);

// All roles (Admin, Manager, Cashier) can view products
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  getProducts
);

router.get(
  '/category/:categoryId',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  getProductsByCategory
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  getProductById
);

module.exports = router;
