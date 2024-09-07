module.exports = (sequelize, DataTypes) => {
    const ProductType = sequelize.define('product_type', {
        prod_type_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        prod_type_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'product_type'
    });

    return ProductType;
};