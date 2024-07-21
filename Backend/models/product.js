module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        product_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        product_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        retail_price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        box_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        box_price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        box_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'product'
    });
    return Product;
};