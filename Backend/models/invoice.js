module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('invoice', {
        invoice_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        invoice_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        invoice_dt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        due_dt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'order',
                key: 'order_id'
            }
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        payment_status: {
                type: DataTypes.ENUM('Unpaid', 'Paid', 'Overdue'),
                allowNull: false,
                defaultValue: 'Unpaid'
        }
    }, {
        tableName: 'invoice'
    });

    return Invoice;
};