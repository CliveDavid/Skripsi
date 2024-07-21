const {
    Sequelize
} = require('sequelize');

const sequelize = new Sequelize('SJM', 'postgres', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;