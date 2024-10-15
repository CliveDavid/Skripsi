module.exports = (sequelize, DataTypes) => {
    const OTP = sequelize.define('otp', {
        otp_id: {
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
        otp: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'otp',
        timestamps: true
    });
    return OTP;
};