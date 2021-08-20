const express = require("express");
const router = express.Router();
const constants = require("../constant/constant");
const json2xls = require("json2xls");
const { QueryTypes } = require("sequelize");
const fs = require("fs");
const { Op } = require("sequelize");
const symptoms = require('../model/symptoms');


formatDate = (date) => {
    return (
        date.getFullYear() +
        "-" +
        (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
        "-" +
        (date.getDate() > 9 ? date.getDate() : "0" + date.getDate())
    );
};

router.post("/symptoms", async (req, res) => {
    try {
        req.body.inputDate = formatDate(new Date());
        let resultCreate = await symptoms.create(req.body);
        console.log("Record success " + req.body.empNumber);
        // console.log(resultCreate);
        res.json({
            type: "create",
            result: resultCreate,
            message: constants.kResultOk,
        });
    } catch (error1) {
        try {
            let resultUpdate = await symptoms.update(req.body, {
                where: {
                    empNumber: req.body.empNumber,
                    inputDate: formatDate(new Date()),
                },
            });
            console.log("Update success " + req.body.empNumber);
            res.json({
                type: "update",
                result: resultUpdate,
                message: constants.kResultOk,
            });
        } catch (error2) {
            console.log("error 2");
            res.json({
                error: error2,
                message: constants.kResultNok,
            });
        }
    }
});

router.get("/symptoms", async (req, res) => {
    try {
        const result = await symptoms.sequelize.query(
            `SELECT [empNumber],
	  b.[employee_type] as 'สถานะพนักงาน',
	  b.[employee_name] as 'ชื่อ - นามสกุล' ,
	  d.[PlantName] as 'โรงงาน',
	  c.[divisionName] as 'ฝ่าย'
      ,[inputDate]
      ,[symptoms]
      ,[livingDetail]
      ,[personLivingWith]
      ,a.[createdAt]
      ,a.[updatedAt]
  FROM [CovidCC].[dbo].[symptoms] a
  join [userMaster].[dbo].[all_employee_lists] b on a.[empNumber] = b.[employee_number] COLLATE Thai_CI_AS
  join [userMaster].[dbo].[divison_masters] c on b.[divisionCode] = c.[divisionCode] COLLATE Thai_CI_AS
  join [userMaster].[dbo].[plant_masters] d on c.[PlantCode] = d.[PlantCode] COLLATE Thai_CI_AS
  where [symptoms] != '' or [personLivingWith] != ''`,
            {
                type: QueryTypes.SELECT,
            }
        );

        var excelFilePath = `files/Doc/Temperature_excel/_symptoms_.xlsx`;

        var xls = await json2xls(result);
        await fs.writeFileSync(excelFilePath, xls, "binary");

        res.download(excelFilePath);
    } catch (error) {
        console.log("error 2");
        res.json({
            error: error2,
            message: constants.kResultNok,
        });
    }
})

module.exports = router;
