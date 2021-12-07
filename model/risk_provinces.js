const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "risk_provinces",
    {
        // attributes
        provinces: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        risk: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        updater: {
            type: Sequelize.STRING,
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
