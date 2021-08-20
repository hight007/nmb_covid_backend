const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "symptoms",
    {
        // attributes
        empNumber: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        inputDate: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        symptoms: {
            type: Sequelize.STRING('MAX'),
            allowNull: false,
        },
        livingDetail: {
            type: Sequelize.STRING('MAX'),
            allowNull: false,
        },
        personLivingWith : {
            type: Sequelize.STRING('MAX'),
            allowNull: true,
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