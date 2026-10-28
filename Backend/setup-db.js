const { sequelize } = require('./models');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

async function setupDatabase() {
    const stores = [];

    try {
        await sequelize.authenticate();

        // Sequelize creates missing application tables in foreign-key order.
        // Do not force or alter tables: existing data and definitions stay intact.
        await sequelize.sync();

        stores.push(new SequelizeStore({
            db: sequelize,
            tableName: 'admin_sessions',
            modelKey: 'AdminSession'
        }));
        stores.push(new SequelizeStore({
            db: sequelize,
            tableName: 'distributor_sessions',
            modelKey: 'DistributorSession'
        }));

        for (const store of stores) {
            await store.sync();
        }

        console.log('Database setup complete: application and session tables are ready.');
        console.log('Existing table definitions were not altered. No accounts or sample data were created.');
    } finally {
        for (const store of stores) {
            store.stopExpiringSessions();
        }
        await sequelize.close();
    }
}

setupDatabase().catch(error => {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
});
