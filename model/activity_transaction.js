const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "activity_transaction",
    {
        // attributes
        transaction_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        employee_number: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        activity_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        provinces: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        place: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        activity: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        risk: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    },
    {
        //option
    }
);

(async () => {
    await table.sync({ force: false });
})();

module.exports = table;
