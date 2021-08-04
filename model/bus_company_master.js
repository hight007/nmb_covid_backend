const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const bus_company = database.define(
  "bus_company",
  {
    // attributes
    bus_company_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    bus_company_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    updateBy: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    //option
  }
);

(async () => {
  await bus_company.sync({ force: false });
})();

module.exports = bus_company;
