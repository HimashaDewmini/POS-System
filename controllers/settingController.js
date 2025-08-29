const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Create Setting (only one active setting should exist)
 */
const createSetting = async (req, res) => {
  try {
    const existing = await prisma.setting.findFirst();
    if (existing) {
      return res
        .status(400)
        .json({ error: 'Setting already exists. Please update instead.' });
    }

    const { storeName, logoUrl, address, taxRate, discount, printerType } = req.body;

    if (!storeName) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const setting = await prisma.setting.create({
      data: {
        storeName,
        logoUrl,
        address,
        taxRate: taxRate ?? 0,
        discount: discount ?? 0,
        printerType,
      },
    });

    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create setting', details: err.message });
  }
};

/**
 * Get all settings (for audit/history) OR latest one
 */
const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
};

/**
 * Get setting by ID
 */
const getSettingById = async (req, res) => {
  try {
    const { id } = req.params;
    const setting = await prisma.setting.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch setting', details: err.message });
  }
};

/**
 * Update setting
 */
const updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeName, logoUrl, address, taxRate, discount, printerType } = req.body;

    const updatedSetting = await prisma.setting.update({
      where: { id: parseInt(id, 10) },
      data: {
        storeName,
        logoUrl,
        address,
        taxRate,
        discount,
        printerType,
      },
    });

    res.json(updatedSetting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update setting', details: err.message });
  }
};

/**
 * Delete setting
 */
const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.setting.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Setting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete setting', details: err.message });
  }
};

module.exports = {
  createSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
};
