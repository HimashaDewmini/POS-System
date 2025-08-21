const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create user
const createUser = async (req, res) => {
  const { roleId, firstName, lastName, email, password, pin, phoneNumber } = req.body;

  if (!roleId || !firstName || !email || !password) {
    return res.status(400).json({ error: 'roleId, firstName, email, and password are required' });
  }

  try {
    const user = await prisma.user.create({
      data: { roleId: Number(roleId), firstName, lastName, email, password, pin, phoneNumber, status: 'active' },
      include: { role: true },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const { roleId, firstName, lastName, email, password, pin, phoneNumber, status } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        roleId: roleId ? Number(roleId) : undefined,
        firstName,
        lastName,
        email,
        password,
        pin,
        phoneNumber,
        status,
      },
      include: { role: true },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user 
const deleteUser = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'inactive' },
    });

    res.status(200).json({ message: 'User soft-deleted', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
