const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");


const table = database.define(
  "province",
  {
    // attributes
    tcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    acode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    aname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pname: {
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
