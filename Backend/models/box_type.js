module.exports = (sequelize, DataTypes) => {
    const BoxType = sequelize.define('box_type', {
        box_type_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        box_type_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        box_capacity: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'box_type'
    });

    return BoxType;
};