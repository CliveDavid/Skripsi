module.exports = (sequelize, DataTypes) => {
    const ShipmentMethod = sequelize.define('shipment_method', {
        shipment_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        shipment_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        shipment_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'shipment_method'
    });

    return ShipmentMethod;
};