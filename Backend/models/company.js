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
            type: DataTypes.STRING(50),
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true       
        }
    }, {
        tableName: 'company'
    });

    return Company;
};