const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/user_instance");

const table = database.define(
    "rfid",
    {
        // attributes
        rfid: {
            type: Sequelize.STRING,
            primaryKey: true,
            validate: {
                len: {
                    args: [10, 10],
                    msg: "String length is not in this range (10)",
                },
            }
        },
        empNumber: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [4, 20],
                    msg: "String length is not in this range",
                },
            }
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