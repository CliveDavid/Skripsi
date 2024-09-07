const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS Options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes


// Use routes


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

// Sync with database and start server
sequelize.sync({
        alter: true
    })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.log('Error: ' + err);
    });