const express = require('express');
const cors = require('cors');

// routers
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const reportRoutes = require('./routes/reportRoutes');
const roleRoutes = require('./routes/roleRoutes');
const saleItemRoutes = require('./routes/saleItemRoutes');
const userRoutes = require('./routes/userRoutes');



const app = express();
const port = 3000;

app.use(cors(
    {
        origin: '*', 
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 
        allowedHeaders: ['Content-Type', 'Authorization'] 
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static file serving
app.use('/uploads', express.static('./uploads'));

// routes
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', saleRoutes);
app.use('/api', customerRoutes);
app.use('/api', receiptRoutes);
app.use('/api', reportRoutes);
app.use('/api', roleRoutes);
app.use('/api', saleItemRoutes);
app.use('/api', userRoutes);

app.listen(port,()=>{
    console.log(`Server running on ${port}`);
})
