const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "sinopharm",
    {
        // attributes
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        empNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        empName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        divisionName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        plant: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isNeedSinopharm: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        province: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        listDiseases: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        isAgree: {
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