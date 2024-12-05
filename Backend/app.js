require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./config/database');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const app = express();
const port = process.env.PORT || 3000;

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

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

// Serve static files from the 'public' folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Session middleware
const adminSessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'admin_sessions'
});

const distributorSessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'distributor_sessions'
});

// Middleware to check the request path and apply the appropriate session
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        session({
            secret: process.env.ADMIN_SESSION_SECRET,
            store: adminSessionStore,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // Set to true if using HTTPS
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            },
            name: 'admin.sid' // Unique name for admin session cookie
        })(req, res, next);
    } else if (req.path.startsWith('/distributor')) {
        session({
            secret: process.env.DISTRIBUTOR_SESSION_SECRET,
            store: distributorSessionStore,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            },
            name: 'distributor.sid'
        })(req, res, next);
    } else {
        next();
    }
});

//#region Session
// Create the session tables if they don't exist
// adminSessionStore.sync();
// distributorSessionStore.sync();
//#endregion

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const productRoutes = require('./routes/productRoutes');
const productTypeRoutes = require('./routes/productTypeRoutes');
const boxTypeRoutes = require('./routes/boxTypeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentMethodRoutes = require('./routes/shipmentMethodRoutes');
const priceRoutes = require('./routes/priceRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const orderAddressRoutes = require('./routes/orderAddressRoutes');
const companyRoutes = require('./routes/companyRoutes');
const supportRoutes = require('./routes/supportRoutes');
const distributorNotifRoutes = require('./routes/distributorNotifRoutes');
const adminNotifRoutes = require('./routes/adminNotifRoutes');
const dashboardRotues = require('./routes/dashboardRoutes')


// Routes
app.use('/admin', adminRoutes);
app.use('/distributor', distributorRoutes);
app.use('/product', productRoutes);
app.use('/productType', productTypeRoutes);
app.use('/boxType', boxTypeRoutes);
app.use('/orders', orderRoutes);
app.use('/shipmentMethods', shipmentMethodRoutes);
app.use('/price', priceRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/orderAddress', orderAddressRoutes);
app.use('/company', companyRoutes);
app.use('/support', supportRoutes);
app.use('/admin-notifications', adminNotifRoutes);
app.use('/distributor-notifications', distributorNotifRoutes);
app.use('/dashboard', dashboardRotues);


// 404 Handler
app.use((req, res, next) => {
    res.status(404).send({
        message: 'Route not found'
    });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        message: 'Something broke!',
        error: err.message
    });
});

// Start the server
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger documentation available at http://localhost:${port}/swagger`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });