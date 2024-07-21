const sequelize = require('./config/database');
const {
    Product,
    Distributor,
    Order,
    OrderItem,
    Admin,
    Notification,
    Promotion,
    Wishlist
} = require('./models');

async function syncModels() {
    try {
        await sequelize.sync({
            alter: true
        });
        console.log('Models synchronized with the database.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
        process.exit(1);
    }
}

syncModels();