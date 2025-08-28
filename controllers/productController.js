const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const path = require('path');

// Create a new product
const createProduct = async (req, res) => {
  try {
    // Only Admin or Manager can create
    if (!['Admin', 'Manager'].includes(req.user.roleName)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    const { sku = '', categoryId, name = '', description = '', price = 0, stockLevel = 0, taxRate = 0, status = 'active' } = req.body;

    // Handle uploaded images (from multer)
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`); // store relative path
    }

    const product = await prisma.product.create({
      data: {
        sku,
        categoryId: categoryId ? parseInt(categoryId) : null,
        name,
        description,
        price: parseFloat(price),
        stockLevel: parseInt(stockLevel),
        taxRate: parseFloat(taxRate),
        images: JSON.stringify(imagePaths),
        status,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const parsed = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.images = product.images ? JSON.parse(product.images) : [];

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    // Only Admin or Manager can update
    if (!['Admin', 'Manager'].includes(req.user.roleName)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    const { id } = req.params;
    const { sku, categoryId, name, description, price, stockLevel, taxRate, status } = req.body;

    let imagePaths;
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        sku,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stockLevel: stockLevel ? parseInt(stockLevel) : undefined,
        taxRate: taxRate ? parseFloat(taxRate) : undefined,
        images: imagePaths ? JSON.stringify(imagePaths) : undefined,
        status,
      },
    });

    updatedProduct.images = updatedProduct.images ? JSON.parse(updatedProduct.images) : [];

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    // Only Admin or Manager can delete
    if (!['Admin', 'Manager'].includes(req.user.roleName)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await prisma.product.findMany({
      where: { categoryId: parseInt(categoryId) },
      include: { category: true },
    });

    const parsed = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
