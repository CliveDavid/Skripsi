module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('orders', {
        order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        distributor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'distributor',
                key: 'distributor_id'
            }
        },
        order_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        total_price: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'orders'
    });
    return Order;
};