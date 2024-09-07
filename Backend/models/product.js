module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        prod_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        prod_code: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        prod_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        prod_type_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'product_type',
                key: 'prod_type_code'
            }
        },
        descr: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'product'
    });

    return Product;
};