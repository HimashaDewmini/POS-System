const express = require('express');
const cors = require('cors');

// routers


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


app.listen(port,()=>{
    console.log(`Server running on ${port}`);
})
