const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/user_instance");

const table = database.define(
  "order_mask",
  {
    // attributes
    employee_number: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    order_reason: {
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
