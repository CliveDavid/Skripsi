module.exports = (sequelize, DataTypes) => {
    const DistributorNotif = sequelize.define('distributor_notif', {
        notif_id: {
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
        header: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'unread'
        }
    }, {
        tableName: 'distributor_notif'
    });
    return DistributorNotif;
};