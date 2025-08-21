const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { sales: true },
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { sales: true },
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// Create customer
const createCustomer = async (req, res) => {
  const { name, email, phoneNumber } = req.body;
  try {
    const customer = await prisma.customer.create({
      data: { name, email, phoneNumber, status: "active" },
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, phoneNumber, status } = req.body;
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, email, phoneNumber, status },
    });
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

// Delete customer (soft delete)
const deleteCustomer = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { status: "inactive" },
    });
    res.json({ message: "Customer soft-deleted", customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
