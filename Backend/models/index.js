const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// Import models
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

// Relation (foreign keys) 
Order.belongsTo(Distributor, { foreignKey: 'distributor_id' });

OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

OrderItem.belongsTo(BoxType, { foreignKey: 'box_type_code', targetKey: 'box_type_code' });

Product.belongsTo(ProductType, { foreignKey: 'prod_type_code', targetKey: 'prod_type_code' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });

Invoice.belongsTo(Order, { foreignKey: 'order_id' });

ShipmentMethod.hasMany(Order, { foreignKey: 'shipment_code' });

Order.belongsTo(ShipmentMethod, { foreignKey: 'shipment_code', targetKey: 'shipment_code' });

AdminNotif.belongsTo(Admin, { foreignKey: 'admin_id' });

Price.belongsTo(ProductType, { foreignKey: 'prod_type_code' });

Price.belongsTo(BoxType, { foreignKey: 'box_type_code' });

module.exports = {
    sequelize,
    Sequelize,
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