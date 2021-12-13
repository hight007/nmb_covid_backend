const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "long_holiday_date",
    {
        long_holiday_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            primaryKey: true,
        },
        alert_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            // primaryKey: true,
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
