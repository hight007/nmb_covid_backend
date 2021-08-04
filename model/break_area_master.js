const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const break_area = database.define(
  "break_area",
  {
    // attributes
    break_area_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    break_area_name: {
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
  await break_area.sync({ force: false });
})();

module.exports = break_area;
