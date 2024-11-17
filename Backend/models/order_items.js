module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('order_item', {
        order_item_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'order',
                key: 'order_id'
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'product',
                key: 'prod_id'
            }
        },
        box_type_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'box_type',
                key: 'box_type_code'
            }
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_item_price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        }
    }, {
        tableName: 'order_items'
    });

    return OrderItem;
};