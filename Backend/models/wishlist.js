module.exports = (sequelize, DataTypes) => {
    const Wishlist = sequelize.define('wishlist', {
        wishlist_id: {
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
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'product',
                key: 'product_id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        tableName: 'wishlist'
    });
    return Wishlist;
};