const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
  "vaccineSurvey",
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
    isNeedVaccine: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    vaccineStatus: {
      type: Sequelize.STRING,
    },
    firstVaccineDate: {
      type: Sequelize.DATE,
    },
    seccondVaccineDate: {
      type: Sequelize.DATE,
    },
    bookVaccineStatus: {
      type: Sequelize.STRING,
    },
    noBookVaccineReason: {
      type: Sequelize.STRING,
    },
    noNeedVaccineReason: {
      type: Sequelize.STRING,
    },
    "noBookVaccineReason-Comment": {
      type: Sequelize.STRING,
    },
    "noNeedVaccineReason-Comment": {
      type: Sequelize.STRING,
    },
    isAggreeInformation: {
      type: Sequelize.BOOLEAN,
    },
    vaccine1: {
      type: Sequelize.STRING,
    },
    vaccine2: {
      type: Sequelize.STRING,
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
