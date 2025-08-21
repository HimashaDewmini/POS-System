const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { users: true },
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.status(200).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch role" });
  }
};

// Create role
const createRole = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Role name is required" });

  try {
    const role = await prisma.role.create({
      data: { name, description },
    });
    res.status(201).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create role" });
  }
};

// Update role
const updateRole = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;

  try {
    const role = await prisma.role.update({
      where: { id },
      data: { name, description },
    });
    res.status(200).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.role.delete({
      where: { id },
    });
    res.json({ message: "Role deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete role" });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
