module.exports = (sequelize, DataTypes) => {
    const Price = sequelize.define('price', {
        price_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        box_type_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'box_type',
                key: 'box_type_code'
            }
        },
        prod_type_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'product_type',
                key: 'prod_type_code'
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'price'
    });

    return Price;
};