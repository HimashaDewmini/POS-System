const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Create product
const createProduct = async (req, res) => {
  const { sku, categoryId, name, description, price, stockLevel, taxRate } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        sku,
        categoryId: Number(categoryId),
        name,
        description,
        price: Number(price),
        stockLevel: stockLevel ? Number(stockLevel) : 0,
        taxRate: taxRate ? Number(taxRate) : null,
        status: "active",
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  const { sku, categoryId, name, description, price, stockLevel, taxRate, status } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        categoryId: categoryId ? Number(categoryId) : undefined,
        name,
        description,
        price: price ? Number(price) : undefined,
        stockLevel: stockLevel ? Number(stockLevel) : undefined,
        taxRate: taxRate ? Number(taxRate) : undefined,
        status,
      },
    });
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { status: "inactive" },
    });
    res.json({ message: "Product soft-deleted", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
