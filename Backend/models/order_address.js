module.exports = (sequelize, DataTypes) => {
    const OrderAddress = sequelize.define('order_address', {
        order_address_id: {
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
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        province: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        zipcode: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        tableName: 'order_address'
    });

    OrderAddress.associate = (models) => {
        OrderAddress.belongsTo(models.Order, {
            foreignKey: 'order_id',
            as: 'order'
        });
    };

    return OrderAddress;
};
