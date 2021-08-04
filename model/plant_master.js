const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/user_instance");

const plant = database.define("plant_master", {
  PlantCode: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
      len: {
        args: [2, 2],
        msg: "String length is not in this range (2 digit)",
      },
    },
  },
  PlantName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  updateBy: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
      len: {
        args: [4, 6],
        msg: "String length is not in this range",
      },
    },
  },
});

(async () => {
  await plant.sync({ force: false });
})();

module.exports = plant;
