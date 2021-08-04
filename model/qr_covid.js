const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const qr_covid = database.define(
  "GetThedatas",
  {
    // attributes
    Update: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    EmpNo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Getdata: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    //option
  }
);

(async () => {
  await qr_covid.sync({ force: false });
})();

module.exports = qr_covid;
