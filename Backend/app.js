const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const cors = require('cors');

const app = express();
const port = 3000;

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});

app.use(bodyParser.json());
app.use(express.json());

const productRoutes = require('./routes/product');
const distributorRoutes = require('./routes/distributor');
const orderRoutes = require('./routes/orders');
const orderItemRoutes = require('./routes/orderitem');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');
const promotionRoutes = require('./routes/promotion');
const wishlistRoutes = require('./routes/wishlist');

app.use('/product', productRoutes);
app.use('/distributor', distributorRoutes);
app.use('/orders', orderRoutes);
app.use('/orderitem', orderItemRoutes);
app.use('/admin', adminRoutes);
app.use('/notification', notificationRoutes);
app.use('/promotion', promotionRoutes);
app.use('/wishlist', wishlistRoutes);

sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.log('Error: ' + err);
    });