const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create Role
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = await prisma.role.create({
      data: { name, description },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Failed to create role", details: error.message });
  }
};

// Get all Roles
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { users: true }, // also fetch users in each role
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles", details: error.message });
  }
};

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: { users: true },
    });

    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch role", details: error.message });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedRole = await prisma.role.update({
      where: { id: Number(id) },
      data: { name, description },
    });

    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: "Failed to update role", details: error.message });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.role.delete({ where: { id: Number(id) } });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role", details: error.message });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
