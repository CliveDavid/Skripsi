const bcrypt = require('bcrypt');
const { sequelize, Distributor, DistributorAddress } = require('./models');

const demoName = 'user';
const demoEmail = 'user@example.com';
const demoPassword = 'password';

// Keep password hashes and database details out of command output.
sequelize.options.logging = false;

async function seedDemoAccount() {
    try {
        const localHosts = ['localhost', '127.0.0.1', '::1'];
        if (process.env.NODE_ENV === 'production' || !localHosts.includes(sequelize.config.host)) {
            throw new Error('Demo account setup is only available for a local development database.');
        }

        await sequelize.authenticate();
        const hashedPassword = await bcrypt.hash(demoPassword, 10);

        const created = await sequelize.transaction(async transaction => {
            let distributor = await Distributor.findOne({
                where: { email: demoEmail },
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            const isNew = !distributor;

            if (distributor && distributor.name !== demoName) {
                throw new Error('The demo email belongs to a different named account. No account was changed.');
            }

            if (distributor) {
                await distributor.update({ password: hashedPassword, is_active: true }, { transaction });
            } else {
                distributor = await Distributor.create({
                    name: demoName,
                    email: demoEmail,
                    password: hashedPassword,
                    is_active: true
                }, { transaction });
            }

            await DistributorAddress.findOrCreate({
                where: { distributor_id: distributor.distributor_id },
                defaults: {
                    address: '', addr_details: '', city: '', province: '', zipcode: '',
                    district: '', subdistrict: '', phone: ''
                },
                transaction
            });

            return isNew;
        });

        console.log(created ? 'Created the local dummy distributor.' : 'Reset the local dummy distributor password and activated it.');
        console.log('Sign in at http://localhost:4201/login');
        console.log(`Email: ${demoEmail}`);
        console.log(`Password: ${demoPassword}`);
    } finally {
        await sequelize.close();
    }
}

seedDemoAccount().catch(error => {
    console.error('Demo account setup failed:', error.message);
    process.exitCode = 1;
});
