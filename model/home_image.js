const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const home_image = database.define(
  "home_image",
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    fileData: {
      type: Sequelize.DataTypes.BLOB("long"),
      allowNull: false,
    },
    fileType: {
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
  await home_image.sync({ force: false });
})();

module.exports = home_image;
