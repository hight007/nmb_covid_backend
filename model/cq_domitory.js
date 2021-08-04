//Reference
const { Sequelize, DataTypes } = require("sequelize");

//SQL Connection
const database = require("./../instance/qr_instance");
//Create Table in SQL
//ชื่อตั่วแปร Const ต้องตรงกับข้างล่าง
const dom_table = database.define(
  // table name
  "cq_domitory",
  {
    // column list >>>>>>>
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
    zone: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    domitory: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    room: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    bed: {
      type: Sequelize.STRING,
      primaryKey: true,
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
  await dom_table.sync({ force: false });
})();

module.exports = dom_table;
