module.exports = (sequelize, DataTypes) => {
    const OrderStatusHistory = sequelize.define('order_status_history', {
        id: {
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
        status: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        changed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'order_status_history',
        timestamps: false
    });

    OrderStatusHistory.associate = (models) => {
        OrderStatusHistory.belongsTo(models.Order, {
            foreignKey: 'order_id',
            as: 'order'
        });
    };

    return OrderStatusHistory;
};