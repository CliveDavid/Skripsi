module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('notification', {
        distributor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'distributor',
                key: 'distributor_id'
            }
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
        tableName: 'notification'
    });
    return Notification;
};