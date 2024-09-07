module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('company', {
        company_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phn1: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        phn2: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        phn3: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        tableName: 'company'
    });

    return Company;
};