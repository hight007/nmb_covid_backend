const { Sequelize, DataTypes } = require("sequelize");
const database = require("../instance/qr_instance");

const home_image = database.define(
    "local_quanrantine",
    {
        // attributes
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        employee_number: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        temperature: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        oxygen: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        pulse: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        fileData: {
            type: Sequelize.DataTypes.BLOB("long"),
            allowNull: true,
        },
        fileType: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    },
    {
        //option
    }
);

(async () => {
    await home_image.sync({ force: false });
})();

module.exports = home_image;
