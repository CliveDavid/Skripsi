require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

// CORS Options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware
const sessionStore = new SequelizeStore({
    db: sequelize,
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Create the session table if it doesn't exist
sessionStore.sync();

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const productRoutes = require('./routes/productRoutes');
const productTypeRoutes = require('./routes/productTypeRoutes');
const boxTypeRoutes = require('./routes/boxTypeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentMethodRoutes = require('./routes/shipmentMethodRoutes');
const priceRotues = require('./routes/priceRoutes');

// Routes
app.use('/admin', adminRoutes);
app.use('/distributor', distributorRoutes);
app.use('/product', productRoutes);
app.use('/productType', productTypeRoutes);
app.use('/boxType', boxTypeRoutes);
app.use('/orders', orderRoutes);
app.use('/shipmentMethods', shipmentMethodRoutes);
app.use('/price', priceRotues);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).send({ message: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message});
});

// Start the server
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });