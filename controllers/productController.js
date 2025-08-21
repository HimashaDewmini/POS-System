const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { sku, categoryId, name, description, price, stockLevel, taxRate, images, status } = req.body;

    const product = await prisma.product.create({
      data: {
        sku,
        categoryId,
        name,
        description,
        price: parseFloat(price),
        stockLevel: stockLevel ? parseInt(stockLevel) : 0,
        taxRate: taxRate ? parseFloat(taxRate) : 0,
        images: JSON.stringify(images || []), // store array as JSON
        status: status || 'active',
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
    res.json(products);
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

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, categoryId, name, description, price, stockLevel, taxRate, images, status } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        sku,
        categoryId,
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stockLevel: stockLevel ? parseInt(stockLevel) : undefined,
        taxRate: taxRate ? parseFloat(taxRate) : undefined,
        images: images ? JSON.stringify(images) : undefined,
        status,
      },
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
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

    res.json(products);
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
