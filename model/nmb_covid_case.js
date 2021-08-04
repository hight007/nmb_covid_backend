const { Sequelize, DataTypes } = require("sequelize");
const database = require("./../instance/qr_instance");

const table = database.define(
    "nmb_covid_case",
    {
        // attributes
        case_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
        },
        report_date: {
            type: Sequelize.DATE,
            allowNull: false,
            primaryKey: true,
        },
        positive_result_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        employee_number: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false,
        },
        employee_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        processCode: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        jobDescription: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        divisionName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        plantName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        telephone_number: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        hospital_or_lab: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        detail: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'alive' // fatality
        },
        fileData_positive_result: {
            type: Sequelize.DataTypes.BLOB("long"),
            allowNull: true,
        },
        fileType_positive_result: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fileData_negative_result: {
            type: Sequelize.DataTypes.BLOB("long"),
            allowNull: true,
        },
        fileType_negative_result: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        PCR_test_result: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'Positive'
        },
        negative_result_count: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        last_negative_result_date: {
            allowNull: true,
            type: Sequelize.DATE,
        },
        cause_type: {
            allowNull: true,
            type: Sequelize.STRING,
        },
        cause_detail: {
            allowNull: true,
            type: Sequelize.STRING,
        },
        treatment_start_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        treatment_end_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        stayHome_start_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        stayHome_end_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        returnToWork_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        updateBy: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
        //option
    }
);

(async () => { 
    await table.sync({ force: false });
})();

module.exports = table;
