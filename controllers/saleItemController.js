const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

//Helper: Recalculate sale total using its items.
//Assumes `sale.tax` and `sale.discount` are absolute values 

async function recalcSaleTotals(tx, saleId) {
  const sale = await tx.sale.findUnique({
    where: { id: saleId },
    include: { items: true },
  });
  if (!sale) return;

  const subtotal = sale.items.reduce((sum, it) => sum + it.quantity * it.price, 0);
  const total = subtotal + (sale.tax || 0) - (sale.discount || 0);

  await tx.sale.update({
    where: { id: saleId },
    data: { total },
  });
}

//Helper: If role is Cashier, ensure they own the sale.

function ensureCashierOwns(reqUser, saleUserId) {
  if (reqUser.roleName === 'Cashier' && reqUser.id !== saleUserId) {
    const err = new Error('Access denied: cannot access items from another user’s sale');
    err.status = 403;
    throw err;
  }
}

// Create SaleItem
const createSaleItem = async (req, res) => {
  try {
    const { saleId, productId, quantity, price } = req.body;

    if (!saleId || !productId || quantity == null || price == null) {
      return res.status(400).json({ error: 'saleId, productId, quantity and price are required' });
    }

    const saleIdNum = parseInt(saleId, 10);
    const productIdNum = parseInt(productId, 10);
    const qtyNum = parseInt(quantity, 10);
    const priceNum = parseFloat(price);

    if (Number.isNaN(saleIdNum) || Number.isNaN(productIdNum) || Number.isNaN(qtyNum) || Number.isNaN(priceNum)) {
      return res.status(400).json({ error: 'Invalid data types for saleId/productId/quantity/price' });
    }
    if (qtyNum <= 0 || priceNum < 0) {
      return res.status(400).json({ error: 'Quantity must be > 0 and price must be >= 0' });
    }

    // Do it all atomically
    const created = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleIdNum } });
      if (!sale) {
        const err = new Error('Sale not found');
        err.status = 404;
        throw err;
      }

      // Ownership check for Cashier
      ensureCashierOwns(req.user, sale.userId);

      const product = await tx.product.findUnique({ where: { id: productIdNum } });
      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
      }

      if (product.stockLevel < qtyNum) {
        const err = new Error('Insufficient stock');
        err.status = 400;
        throw err;
      }

      // Create item
      const saleItem = await tx.saleItem.create({
        data: { saleId: saleIdNum, productId: productIdNum, quantity: qtyNum, price: priceNum },
        include: { product: true, sale: true },
      });

      // Decrement stock
      await tx.product.update({
        where: { id: productIdNum },
        data: { stockLevel: product.stockLevel - qtyNum },
      });

      // Recalc totals
      await recalcSaleTotals(tx, saleIdNum);

      return saleItem;
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Failed to create sale item', details: err.message });
  }
};

// Get all SaleItems
const getSaleItems = async (req, res) => {
  try {
    const whereForCashier =
      req.user.roleName === 'Cashier'
        ? { sale: { userId: req.user.id } }
        : {};

    const items = await prisma.saleItem.findMany({
      where: whereForCashier,
      include: { product: true, sale: true },
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sale items', details: err.message });
  }
};

// Get SaleItem by ID
const getSaleItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid sale item ID' });

    const item = await prisma.saleItem.findUnique({
      where: { id: idNum },
      include: { product: true, sale: true },
    });
    if (!item) return res.status(404).json({ error: 'SaleItem not found' });

    // Cashier ownership check
    ensureCashierOwns(req.user, item.sale.userId);

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Failed to fetch sale item', details: err.message });
  }
};

// Update SaleItem
const updateSaleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid sale item ID' });

    const { saleId, productId, quantity, price } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.saleItem.findUnique({
        where: { id: idNum },
        include: { sale: true, product: true },
      });
      if (!existing) {
        const err = new Error('SaleItem not found');
        err.status = 404;
        throw err;
      }

      // Cashier ownership check
      ensureCashierOwns(req.user, existing.sale.userId);

      // Prepare updates & stock adjustments
      let targetSaleId = existing.saleId;
      let targetProductId = existing.productId;
      let newQty = existing.quantity;
      let newPrice = existing.price;

      if (saleId !== undefined) {
        const saleIdNum = parseInt(saleId, 10);
        if (Number.isNaN(saleIdNum)) {
          const err = new Error('Invalid saleId');
          err.status = 400;
          throw err;
        }
        const targetSale = await tx.sale.findUnique({ where: { id: saleIdNum } });
        if (!targetSale) {
          const err = new Error('Target sale not found');
          err.status = 404;
          throw err;
        }
        // Cashier can only move within their own sales
        ensureCashierOwns(req.user, targetSale.userId);
        targetSaleId = saleIdNum;
      }

      if (productId !== undefined) {
        const productIdNum = parseInt(productId, 10);
        if (Number.isNaN(productIdNum)) {
          const err = new Error('Invalid productId');
          err.status = 400;
          throw err;
        }
        const targetProduct = await tx.product.findUnique({ where: { id: productIdNum } });
        if (!targetProduct) {
          const err = new Error('Target product not found');
          err.status = 404;
          throw err;
        }
        targetProductId = productIdNum;
      }

      if (quantity !== undefined) {
        const qtyNum = parseInt(quantity, 10);
        if (Number.isNaN(qtyNum) || qtyNum <= 0) {
          const err = new Error('Invalid quantity');
          err.status = 400;
          throw err;
        }
        newQty = qtyNum;
      }

      if (price !== undefined) {
        const priceNum = parseFloat(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
          const err = new Error('Invalid price');
          err.status = 400;
          throw err;
        }
        newPrice = priceNum;
      }

      // STOCK ADJUSTMENTS:

      if (targetProductId === existing.productId) {
        const deltaQty = newQty - existing.quantity;
        if (deltaQty !== 0) {
          const prod = await tx.product.findUnique({ where: { id: targetProductId } });
          if (deltaQty > 0 && prod.stockLevel < deltaQty) {
            const err = new Error('Insufficient stock');
            err.status = 400;
            throw err;
          }
          await tx.product.update({
            where: { id: targetProductId },
            data: { stockLevel: prod.stockLevel - deltaQty },
          });
        }
      } else {
        // Return stock to old product
        await tx.product.update({
          where: { id: existing.productId },
          data: { stockLevel: existing.product.stockLevel + existing.quantity },
        });
        // Deduct from new product
        const newProd = await tx.product.findUnique({ where: { id: targetProductId } });
        if (!newProd) {
          const err = new Error('Target product not found');
          err.status = 404;
          throw err;
        }
        if (newProd.stockLevel < newQty) {
          const err = new Error('Insufficient stock for target product');
          err.status = 400;
          throw err;
        }
        await tx.product.update({
          where: { id: targetProductId },
          data: { stockLevel: newProd.stockLevel - newQty },
        });
      }

      const updatedItem = await tx.saleItem.update({
        where: { id: idNum },
        data: {
          saleId: targetSaleId,
          productId: targetProductId,
          quantity: newQty,
          price: newPrice,
        },
        include: { product: true, sale: true },
      });

      // Recalc old sale and/or new sale if changed
      await recalcSaleTotals(tx, existing.saleId);
      if (existing.saleId !== targetSaleId) {
        await recalcSaleTotals(tx, targetSaleId);
      }

      return updatedItem;
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Failed to update sale item', details: err.message });
  }
};

// Delete SaleItem
const deleteSaleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'Invalid sale item ID' });

    await prisma.$transaction(async (tx) => {
      const existing = await tx.saleItem.findUnique({
        where: { id: idNum },
        include: { sale: true, product: true },
      });
      if (!existing) {
        const err = new Error('SaleItem not found');
        err.status = 404;
        throw err;
      }

      // Cashiers are not allowed to delete by default (policy). Managers/Admins only.
      if (req.user.roleName === 'Cashier') {
        const err = new Error('Access denied: insufficient permissions to delete');
        err.status = 403;
        throw err;
      }

      // Restore stock
      await tx.product.update({
        where: { id: existing.productId },
        data: { stockLevel: existing.product.stockLevel + existing.quantity },
      });

      // Delete item
      await tx.saleItem.delete({ where: { id: idNum } });

      // Recalc sale total
      await recalcSaleTotals(tx, existing.saleId);
    });

    res.json({ message: 'SaleItem deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Failed to delete sale item', details: err.message });
  }
};

module.exports = {
  createSaleItem,
  getSaleItems,
  getSaleItemById,
  updateSaleItem,
  deleteSaleItem,
}
