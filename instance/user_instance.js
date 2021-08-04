const Sequelize = require("sequelize");
const sequelize = new Sequelize("userMaster ", "sa", "MICsa@admin", {
  host: "54.255.187.109",
  dialect: "mssql",
  dialectOptions: {
    options: {
      instanceName: "",
    },
  },
});

(async () => {
  await sequelize.authenticate();
})();

module.exports = sequelize;
