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
            allowNull: true
        },
        additional_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
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
        tableName: 'invoice',
        hooks: {
            beforeCreate: (invoice) => {
                // Auto-generate invoice number (e.g., format: INV-20240928-001)
                const date = new Date();
                const invoiceNumber = `INV-${date.getFullYear()}${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`;
                invoice.invoice_number = invoiceNumber;

                // Set due date to 7 days after invoice date
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7);
                invoice.due_dt = dueDate;

                // Calculate total: subtotal + tax + additional_fee
                const tax = invoice.tax || 0;
                const additionalFee = invoice.additional_fee || 0;
                invoice.total = parseFloat(invoice.subtotal) + parseFloat(tax) + parseFloat(additionalFee);
            }
        }
    });

    return Invoice;
};
