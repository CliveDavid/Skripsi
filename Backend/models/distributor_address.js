module.exports = (sequelize, DataTypes) => {

    const DistributorAddress = sequelize.define('distributor_address', {
        address_id: {
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
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        addr_details: {
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
        },
        district: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        subdistrict: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        tableName: 'distributor_address'
    });

    return DistributorAddress;
};