const Sequelize = require('sequelize');
const sequelize = require('../config/database');

//#region Import
const Admin = require('./admin')(sequelize, Sequelize.DataTypes);
const Distributor = require('./distributor')(sequelize, Sequelize.DataTypes);
const AdminNotif = require('./admin_notif')(sequelize, Sequelize.DataTypes);
const Company = require('./company')(sequelize, Sequelize.DataTypes);
const Product = require('./product')(sequelize, Sequelize.DataTypes);
const ProductType = require('./product_type')(sequelize, Sequelize.DataTypes);
const BoxType = require('./box_type')(sequelize, Sequelize.DataTypes);
const Order = require('./order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./order_items')(sequelize, Sequelize.DataTypes);
const Price = require('./price')(sequelize, Sequelize.DataTypes);
const Invoice = require('./invoice')(sequelize, Sequelize.DataTypes);
const ShipmentMethod = require('./shipment_method')(sequelize, Sequelize.DataTypes);
//#endregion


//#region Relation (foreign keys) 
Order.belongsTo(Distributor, {
    foreignKey: 'distributor_id'
});

OrderItem.belongsTo(Order, {
    foreignKey: 'order_id'
});
OrderItem.belongsTo(Product, {
    foreignKey: 'product_id'
});

Product.belongsTo(ProductType, {
    foreignKey: 'prod_type_code'
});

Order.hasMany(OrderItem, {
    foreignKey: 'order_id'
});

Invoice.belongsTo(Order, {
    foreignKey: 'order_id'
});

ShipmentMethod.hasMany(Order, {
    foreignKey: 'shipment_code'
});

AdminNotif.belongsTo(Admin, {
    foreignKey: 'admin_id'
});

Price.belongsTo(ProductType, {
    foreignKey: 'prod_type_code'
});
Price.belongsTo(BoxType, {
    foreignKey: 'box_type_code'
});
//#endregion

// sync models with database
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({
            alter: true
        }); // Sync in the order defined by associations
        console.log('Database & tables created!');
    } catch (error) {
        console.error('Unable to sync the database:', error.message || error);
        process.exit(1); // Optionally, exit the process on failure
    }
};

// Call the sync function
syncDatabase();

module.exports = {
    Product,
    ProductType,
    BoxType,
    Order,
    OrderItem,
    Invoice,
    ShipmentMethod,
    Distributor,
    Company,
    Admin,
    AdminNotif,
    Price
};