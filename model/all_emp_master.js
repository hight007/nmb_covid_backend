const { Sequelize, DataTypes } = require("sequelize");
const database = require("../instance/user_instance");

const emp_master = database.define("all_employee_list", {
  employee_number: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  place: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  divisionCode: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  sectionCode: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  processCode: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  employee_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  employee_type: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
});

(async () => {
  await emp_master.sync({ force: false });
})();

module.exports = emp_master;
