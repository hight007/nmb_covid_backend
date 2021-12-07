const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "activity_master",
    {
        // attributes
        activity: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        risk: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
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
