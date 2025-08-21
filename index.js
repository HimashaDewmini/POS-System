require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routers
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


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static file serving (for uploads like product images, receipts, etc.)
app.use('/uploads', express.static('./uploads'));



// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/sale-items', saleItemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/promotions', promotionRoutes);

// Default 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Default error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message || 'Unexpected error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
