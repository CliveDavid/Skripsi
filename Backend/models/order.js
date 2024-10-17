module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('order', {
        order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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
            type: DataTypes.STRING(50), // Pending, Processing, Invoiced, Delivered, Cancelled
            allowNull: false
        },
        total_price: {
            type: DataTypes.DECIMAL(15, 2),
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
        tableName: 'order',
        hooks: {
            beforeValidate: (order) => {
                // Auto-generate order number (e.g., format: ORDER-20240928-001)
                if (!order.order_number) {
                    const date = new Date(order.order_dt);
                    const orderNumber = `ORDER-${date.getFullYear()}${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                    order.order_number = orderNumber;
                }
            },
            afterUpdate: async (order, options) => {
                if (order.changed('status')) {
                    await sequelize.models.order_status_history.create({
                        order_id: order.order_id,
                        status: order.status,
                    }, { transaction: options.transaction });
                }
            }
        }
    });

    Order.associate = (models) => {
        Order.hasMany(models.OrderAddress, {
            foreignKey: 'order_id',
            as: 'addresses'
        });
        Order.hasMany(models.OrderStatusHistory, {
            foreignKey: 'order_id',
            as: 'order_status_histories'
        });
        Order.hasMany(models.OrderItem, {
            foreignKey: 'order_id',
            as: 'order_items'
        });
    };

    return Order;
};