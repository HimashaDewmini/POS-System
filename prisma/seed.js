// prisma/seed.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // 1. Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrator with full access'
    },
  });

  const cashierRole = await prisma.role.create({
    data: {
      name: 'Cashier',
      description: 'Handles sales and transactions'
    },
  });

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'admin@example.com',
      password: 'admin123', // Note: in production, hash the password
      roleId: adminRole.id,
      phoneNumber: '1234567890',
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'cashier@example.com',
      password: 'cashier123',
      roleId: cashierRole.id,
      phoneNumber: '0987654321',
    },
  });

  // 3. Create Categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      description: 'Apparel and garments',
    },
  });

  // 4. Create Products
  const laptopProduct = await prisma.product.create({
    data: {
      sku: 'ELEC-001',
      name: 'Laptop',
      description: 'High performance laptop',
      price: 1500.0,
      stockLevel: 10,
      taxRate: 0.12,
      categoryId: electronicsCategory.id,
    },
  });

  const tshirtProduct = await prisma.product.create({
    data: {
      sku: 'CLO-001',
      name: 'T-Shirt',
      description: 'Cotton t-shirt',
      price: 25.0,
      stockLevel: 50,
      taxRate: 0.08,
      categoryId: clothingCategory.id,
    },
  });

  // 5. Create a Customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phoneNumber: '5551234567',
    },
  });

  // 6. Create a Sale
  const sale = await prisma.sale.create({
    data: {
      userId: cashierUser.id,
      customerId: customer.id,
      total: 1525,
      discount: 0,
      tax: 150,
      paymentType: 'Cash',
      status: 'completed',
      items: {
        create: [
          {
            productId: laptopProduct.id,
            quantity: 1,
            price: laptopProduct.price,
          },
          {
            productId: tshirtProduct.id,
            quantity: 1,
            price: tshirtProduct.price,
          },
        ],
      },
      receipts: {
        create: [
          {
            method: 'Cash',
            url: null,
          },
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
