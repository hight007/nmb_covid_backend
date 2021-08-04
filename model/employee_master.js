const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/user_instance");

const emp_master = database.define("employee_list", {
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
  section_number: {
    type: Sequelize.STRING,
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
  employee_sex: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  schedule_shift: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  process_shift: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Required",
      },
    },
  },
  bus_line: {
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
