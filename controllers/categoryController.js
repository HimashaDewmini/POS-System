const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const category = await prisma.category.create({
      data: { name, description, status },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Get all Categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true },
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { products: true },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name, description, status },
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete Category (soft)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { status: 'inactive' },
    });
    res.json({ message: 'Category deleted (soft)', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
