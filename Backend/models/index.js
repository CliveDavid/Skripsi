const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Product = require('./product')(sequelize, Sequelize);
const Distributor = require('./distributor')(sequelize, Sequelize);
const Order = require('./orders')(sequelize, Sequelize);
const OrderItem = require('./orderitem')(sequelize, Sequelize);
const Admin = require('./admin')(sequelize, Sequelize);
const Notification = require('./notification')(sequelize, Sequelize);
const Promotion = require('./promotion')(sequelize, Sequelize);
const Wishlist = require('./wishlist')(sequelize, Sequelize);

// Define associations here
Distributor.hasMany(Order);
Order.belongsTo(Distributor);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

Distributor.hasMany(Notification);
Notification.belongsTo(Distributor);

Distributor.hasMany(Wishlist);
Wishlist.belongsTo(Distributor);

Product.hasMany(Wishlist);
Wishlist.belongsTo(Product);

module.exports = {
    sequelize,
    Product,
    Distributor,
    Order,
    OrderItem,
    Admin,
    Notification,
    Promotion,
    Wishlist
};