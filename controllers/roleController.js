const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create Role
const createRole = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing" });
    }

    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Role name is required" });
    }

    const role = await prisma.role.create({
      data: { name: name.trim(), description: description?.trim() || "" },
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
      include: { users: true },
    });
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles", details: error.message });
  }
};

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Role ID is required" });

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: { users: true },
    });

    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Failed to fetch role", details: error.message });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Role ID is required" });

    if (!req.body) return res.status(400).json({ error: "Request body missing" });

    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Role name is required" });
    }

    const updatedRole = await prisma.role.update({
      where: { id: Number(id) },
      data: { name: name.trim(), description: description?.trim() || "" },
    });

    res.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Failed to update role", details: error.message });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Role ID is required" });

    await prisma.role.delete({ where: { id: Number(id) } });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
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
