const express = require('express');
const app = express();
const port = 3000;

const productRoutes = require('./routes/product');
const distributorRoutes = require('./routes/distributor');
const orderRoutes = require('./routes/orders');
const orderItemRoutes = require('./routes/orderitem');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');
const promotionRoutes = require('./routes/promotion');
const wishlistRoutes = require('./routes/wishlist');

app.use(express.json());

app.use('/product', productRoutes);
app.use('/distributor', distributorRoutes);
app.use('/orders', orderRoutes);
app.use('/orderitem', orderItemRoutes);
app.use('/admin', adminRoutes);
app.use('/notification', notificationRoutes);
app.use('/promotion', promotionRoutes);
app.use('/wishlist', wishlistRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});