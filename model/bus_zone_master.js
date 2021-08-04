const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const bus_zone = database.define(
  "bus_zone",
  {
    // attributes
    zone_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    zone_name: {
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
  await bus_zone.sync({ force: false });
})();

module.exports = bus_zone;
