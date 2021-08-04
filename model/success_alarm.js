const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const success_alarm = database.define(
  "success_alarm",
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    divisionCode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    shift: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    AlarmDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    missingCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    overCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    //option
  }
);

(async () => {
  await success_alarm.sync({ force: false });
})();

module.exports = success_alarm;
