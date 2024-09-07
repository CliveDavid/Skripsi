const sequelize = require('./config/database');
const {
    Product,
    ProductType,
    BoxType,
    Order,
    OrderItem,
    Invoice,
    ShipmentMethod,
    Distributor,
    Company,
    Admin,
    AdminNotif,
    Price
} = require('./models');

async function syncModels() {
    const transaction = await sequelize.transaction(); // Start a transaction

    try {
        // Synchronize the models in order
        await Admin.sync({
            alter: true,
            transaction
        });
        await AdminNotif.sync({
            alter: true,
            transaction
        });
        await Distributor.sync({
            alter: true,
            transaction
        });
        await Company.sync({
            alter: true,
            transaction
        });
        await BoxType.sync({
            alter: true,
            transaction
        });
        await ProductType.sync({
            alter: true,
            transaction
        });
        await Product.sync({
            alter: true,
            transaction
        });
        await ShipmentMethod.sync({
            alter: true,
            transaction
        });
        await Order.sync({
            alter: true,
            transaction
        });
        await OrderItem.sync({
            alter: true,
            transaction
        });
        await Invoice.sync({
            alter: true,
            transaction
        });

        await Price.sync({
            alter: true,
            transaction
        });


        await transaction.commit(); // Commit the transaction if all syncs are successful
        console.log('Models synchronized with the database successfully.');
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        console.error('Error synchronizing models, rolled back changes:', error);
        process.exit(1); // Exit the process in case of an error
    }
}

syncModels();