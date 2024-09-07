module.exports = (sequelize, DataTypes) => {
    const AdminNotif = sequelize.define('admin_notif', {
        notif_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'admin',
                key: 'admin_id'
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
        tableName: 'admin_notif'
    });
    return AdminNotif;
};