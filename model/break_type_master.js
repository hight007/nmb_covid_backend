const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const break_type = database.define(
  "break_type",
  {
    // attributes
    break_type_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    break_type_name: {
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
  await break_type.sync({ force: false });
})();

module.exports = break_type;
