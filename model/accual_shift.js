const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const accual_shift = database.define(
  "accual_shift",
  {
    // attributes
    accual_shift: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    EmpNo: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    inputDate: {
      type: Sequelize.DATE,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    //option
  }
);

(async () => {
  await accual_shift.sync({ force: false });
})();

module.exports = accual_shift;
