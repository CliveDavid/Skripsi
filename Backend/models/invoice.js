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
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        additional_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(15, 2),
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
            beforeValidate: (invoice) => {
                // Auto-generate invoice number (e.g., format: INV-20240928-001)
                if (!invoice.invoice_number) {
                    const date = new Date(invoice.invoice_dt);
                    const invoiceNumber = `INV-${date.getFullYear()}${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                    invoice.invoice_number = invoiceNumber;
                }

                // Set due date to 7 days after invoice date if not provided
                if (!invoice.due_dt) {
                    const dueDate = new Date(invoice.invoice_dt);
                    dueDate.setDate(dueDate.getDate() + 7);
                    invoice.due_dt = dueDate;
                }

                // Calculate total: subtotal - discount + additional_fee
                const discount = invoice.discount || 0;
                const additionalFee = invoice.additional_fee || 0;
                invoice.total = parseFloat(invoice.subtotal) - parseFloat(discount) + parseFloat(additionalFee);
            }
        }
    });

    return Invoice;
};