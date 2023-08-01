const Sequelize = require('sequelize');
const sequelize = require('../Util/database');

const ExpenseModel = sequelize.define('Expense', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    amountType: {
        type: Sequelize.STRING,
        defaultValue: 'expense'
    }
});

module.exports = ExpenseModel;