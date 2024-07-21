const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

const app = express();

app.use(bodyParser.json());

const productRoutes = require('./routes/product');
const distributorRoutes = require('./routes/distributor');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');
const promotionRoutes = require('./routes/promotion');
const wishlistRoutes = require('./routes/wishlist');

app.use('/api/products', productRoutes);
app.use('/api/distributors', distributorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/wishlist', wishlistRoutes);

sequelize.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    })
    .catch(err => {
        console.log('Error: ' + err);
    });