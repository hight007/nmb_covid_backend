const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const alert_mail = database.define(
  "alert_mail",
  {
    // attributes
    divisionCode: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      isEmail: true,
      primaryKey: true,
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
  await alert_mail.sync({ force: false });
})();

module.exports = alert_mail;
