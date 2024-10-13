module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('order', {
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
        order_dt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        shipment_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'shipment_method',
                key: 'shipment_code'
            }
        },
        notes: {
            type: DataTypes.TEXT, 
            allowNull: true
        }
    }, {
        tableName: 'order'
    });

    Order.associate = (models) => {
        Order.hasMany(models.OrderAddress, {
            foreignKey: 'order_id',
            as: 'addresses'
        });
    };

    return Order;
};