const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const body_temperature = database.define(
  "body_temperature",
  {
    // attributes
    body_temperature: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    EmpNo: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    inputDate: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    //option
  }
);

(async () => {
  await body_temperature.sync({ force: false });
})();

module.exports = body_temperature;
