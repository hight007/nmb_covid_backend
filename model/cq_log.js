//Reference
const { Sequelize, DataTypes } = require("sequelize");

//SQL Connection
const database = require("./../instance/qr_instance");
//Create Table in SQL
//ชื่อตั่วแปร Const ต้องตรงกับข้างล่าง
const log_table = database.define(
  // table name
  "cq_log",
  {
    // column list >>>>>>>
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    timestamp: {
      type: Sequelize.DATE,
    },
    mfgdate: {
      type: Sequelize.DATEONLY,
    },
    time: {
      type: Sequelize.TIME,
    },
    update_by: {
      type: Sequelize.STRING,
    },
    operation: {
      type: Sequelize.STRING,
    },
    emp_no: {
      type: Sequelize.STRING,
      
    },
    emp_name: {
      type: Sequelize.STRING,
    },
    emp_division: {
      type: Sequelize.STRING,
    },
    emp_factory: {
      type: Sequelize.STRING,
    },
    zone: {
      type: Sequelize.STRING,
    },
    emp_height: {
      type: Sequelize.INTEGER,
    },
    emp_weight: {
      type: Sequelize.INTEGER,
    },
    emp_tel: {
      type: Sequelize.STRING,
    },
    emp_process: {
      type: Sequelize.STRING,
    },
    other_tel: {
      type: Sequelize.STRING,
    },
    place_name: {
      type: Sequelize.STRING,
    },
    room_no: {
      type: Sequelize.STRING,
    },
    bed: {
      type: Sequelize.STRING,
    },
    check_in_date: {
      type: Sequelize.STRING,
    },
    symptom: {
      type: Sequelize.STRING,
    },
    congenital_disease: {
      type: Sequelize.STRING,
    },
  },
  {
    //option
    // do not delete
  }
);

//True : Delete then Create
//False : Only Check then Create

//ชื่อตั่วแปร await,module.exports  ต้องตรงกับข้างบน
(async () => {
  await log_table.sync({ force: false });
})();

module.exports = log_table;
