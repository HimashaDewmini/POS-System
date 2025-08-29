require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// -------------------- Middleware --------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files including PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- Routers --------------------
const categoryRoutes = require('./routers/categoryRoutes');
const productRoutes = require('./routers/productRoutes');
const saleRoutes = require('./routers/saleRoutes');
const customerRoutes = require('./routers/customerRoutes');
const receiptRoutes = require('./routers/receiptRoutes');
const reportRoutes = require('./routers/reportRoutes');
const roleRoutes = require('./routers/roleRoutes');
const saleItemRoutes = require('./routers/saleItemRoutes');
const userRoutes = require('./routers/userRoutes');
const promotionRoutes = require('./routers/promotionRoutes'); 
const paymentRoutes = require('./routers/paymentRoutes');
const settingRoutes = require('./routers/settingRoutes');
const offlineTransactionRoutes = require('./routers/offlineTransactionRoutes'); // ✅ Correct middleware used in routes

// Mount routes under /api prefix
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reports', reportRoutes);   // ✅ reports live here
app.use('/api/roles', roleRoutes);
app.use('/api/sale-items', saleItemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/offline-transactions', offlineTransactionRoutes);

// -------------------- Error Handling --------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message || 'Unexpected error'
  });
});

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📊 Reports endpoint available at http://localhost:${port}/api/reports`);
});
