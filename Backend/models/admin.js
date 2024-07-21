module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('admin', {
        admin_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'admin'
    });
    return Admin;
};