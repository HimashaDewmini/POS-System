const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { sales: true, promotions: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { sales: true, promotions: true },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create a new customer
const createCustomer = async (req, res) => {
  const { name, email, phoneNumber, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phoneNumber,
        status: status || 'active',
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update a customer
const updateCustomer = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, phoneNumber, status } = req.body;

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        status: status || undefined,
      },
    });
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Soft Delete a customer
const deleteCustomer = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Instead of deleting, update status - inactive
    const customer = await prisma.customer.update({
      where: { id },
      data: { status: 'inactive' },
    });

    res.status(200).json({ message: 'Customer soft deleted', customer });
  } catch (error) {
    console.error('Soft Delete Customer Error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};


module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};


