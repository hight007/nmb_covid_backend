const express = require("express");
const router = express.Router();
const constants = require("../constant/constant");
const body_temperature = require("../model/body_temperature");
const constant = require("../constant/constant");
const { QueryTypes } = require("sequelize");
const converter = require("json-2-csv");
const json2xls = require("json2xls");
const fs = require("fs");
const fsExtra = require("fs-extra");
const emp_master = require("./../model/employee_master");
const { Op } = require("sequelize");

formatDate = (date) => {
  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
    "-" +
    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate())
  );
};

router.post("/body_temperature", async (req, res) => {
  try {
    req.body.inputDate = formatDate(new Date());
    let resultCreate = await body_temperature.create(req.body);
    console.log("Record success " + req.body.EmpNo);
    // console.log(resultCreate);
    res.json({
      type: "create",
      result: resultCreate,
      message: constant.kResultOk,
    });
  } catch (error1) {
    try {
      let resultUpdate = await body_temperature.update(req.body, {
        where: {
          EmpNo: req.body.EmpNo,
          inputDate: formatDate(new Date()),
        },
      });
      console.log("Update success " + req.body.EmpNo);
      res.json({
        type: "update",
        result: resultUpdate,
        message: constant.kResultOk,
      });
    } catch (error2) {
      console.log("error 2");
      res.json({
        error: error2,
        message: constant.kResultNok,
      });
    }
  }
});

//Excel
router.get(
  "/body_temperature_ex/:empNo/:divisionCode/:startDate/:toDate",
  async (req, res) => {
    try {
      const { empNo, divisionCode, startDate, toDate } = req.params;
      var empFilter = "";
      var divisionFilter = "";
      if (empNo !== "All" && empNo !== null) {
        empFilter = ` and [EmpNo] = '${empNo}'`;
      }

      if (divisionCode !== "All" && divisionCode !== null) {
        divisionFilter = ` and B.[divisionCode] = '${divisionCode}'`;
      }

      let result = await body_temperature.sequelize.query(
        `SELECT [EmpNo]
      ,[body_temperature]
      ,CONVERT(date, DATEADD(hh,7,A.[updatedAt])) as [RecordDate]
      ,CONVERT(varchar, DATEADD(hh,7,A.[updatedAt]), 108) as [RecordTime]
      ,B.[divisionCode]
      ,C.[divisionName]
        ,[sectionCode]
        ,[processCode]
        ,[employee_name]
        ,[employee_sex]
        ,[schedule_shift]
        ,[process_shift]
        
    FROM [CovidCC].[dbo].[body_temperatures] A join [userMaster].[dbo].[employee_lists] B
    on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
    join [userMaster].[dbo].[divison_masters] C on
    B.[divisionCode] = C.[divisionCode]
    where convert(date,DATEADD(hh,7,A.[updatedAt])) between convert(date,'${startDate}') and convert(date,'${toDate}')
    ` +
          empFilter +
          divisionFilter +
          `order by   A.[updatedAt] desc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      var excelFilePath = `files/Doc/Temperature_excel/body_temperature_ex_${empNo}_${divisionCode}_${startDate}_${toDate}.xlsx`;

      var xls = await json2xls(result);
      await fs.writeFileSync(excelFilePath, xls, "binary");

      res.download(excelFilePath);
      // fs.unlinkSync(excelFilePath);
    } catch (error) {
      res.json({
        error,
        message: constant.kResultNok,
      });
    }
  }
);

router.get(
  "/body_temperature_missing_ex/:divisionCode/:startDate/:toDate",
  async (req, res) => {
    try {
      const { divisionCode, startDate, toDate } = req.params;

      var divisionFilter = "";
      if (divisionCode !== "All" && divisionCode !== null) {
        divisionFilter = `and A.[divisionCode] = '${divisionCode}'`;
      }

      let result = await body_temperature.sequelize.query(
        `with listTempCheck as (
          SELECT *
            FROM [CovidCC].[dbo].[body_temperatures] 
            where convert(date,DATEADD(hh,7,[createdAt])) between convert(date,'${startDate}') and convert(date,'${toDate}')
            )
            SELECT A.[employee_number] , 
            A.[employee_name] ,
            A.[employee_sex], 
            A.[divisionCode] , 
            C.[divisionName] ,
            A.[sectionCode] ,
            A.[processCode] , 
            A.[schedule_shift] , 
            A.[process_shift],
            A.[employee_type]
            FROM [userMaster].[dbo].[employee_lists] A left join listTempCheck B 
            on A.[employee_number] = B.[EmpNo]   COLLATE Thai_CI_AS 
            join [userMaster].[dbo].[divison_masters] C on
		        A.[divisionCode] = C.[divisionCode]
            where  [EmpNo] is NULL ${divisionFilter}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      var excelFilePath = `files/Doc/Temperature_excel/body_temperature_missing_ex_${divisionCode}_${startDate}_${toDate}.xlsx`;

      var xls = await json2xls(result);
      await fs.writeFileSync(excelFilePath, xls, "binary");

      res.download(excelFilePath);
      // fs.unlinkSync(excelFilePath);
    } catch (error) {
      res.json({
        error,
        message: constant.kResultNok,
      });
    }
  }
);

router.get(
  "/body_temperature_over_ex/:divisionCode/:startDate/:toDate",
  async (req, res) => {
    try {
      const { divisionCode, startDate, toDate } = req.params;

      var divisionFilter = "";
      if (divisionCode !== "All" && divisionCode !== null) {
        divisionFilter = `and A.[divisionCode] = '${divisionCode}'`;
      }

      let result = await body_temperature.sequelize.query(
        `with listmissingCheck as (
          SELECT [EmpNo] 
          , [body_temperature] 
          , [createdAt]
          ,[updatedAt]
          FROM [CovidCC].[dbo].[body_temperatures] 
          where [body_temperature] >= 37.5 and convert(date,DATEADD(hh,7,[createdAt])) between convert(date,'${startDate}') and convert(date,'${toDate}')
          )
          , missingDiv as (
          SELECT A.[employee_number] 
          ,[body_temperature] 
          ,[employee_name] 
          ,A.[divisionCode]
          ,C.[divisionName]
            ,[sectionCode]
            ,[processCode]
            ,[employee_sex]
            ,[schedule_shift]
            ,[process_shift]
            ,[bus_line]
            ,[employee_type]
          ,B.[createdAt]
            ,B.[updatedAt]
          FROM [userMaster].[dbo].[employee_lists] A join listmissingCheck B 
          on A.[employee_number] = B.[EmpNo] COLLATE Thai_CI_AS
          join [userMaster].[dbo].[divison_masters] C on
		      A.[divisionCode] = C.[divisionCode]
        where A.[employee_number] is not null ${divisionFilter}
          )
        select * from missingDiv`,
        {
          type: QueryTypes.SELECT,
        }
      );

      var excelFilePath = `files/Doc/Temperature_excel/body_temperature_over_ex_${divisionCode}_${startDate}_${toDate}.xlsx`;

      var xls = await json2xls(result);
      await fs.writeFileSync(excelFilePath, xls, "binary");

      res.download(excelFilePath);
      // fs.unlinkSync(excelFilePath);
    } catch (error) {
      res.json({
        error,
        message: constant.kResultNok,
      });
    }
  }
);

router.get("/rawData/:startDate/:toDate", async (req, res) => {
  try {
    const { startDate, toDate } = req.params;
    const response = await body_temperature.sequelize.query(
      `SELECT [body_temperature]
      ,[EmpNo]
      ,[inputDate]
      ,[createdAt]
      ,[updatedAt]
  FROM [CovidCC].[dbo].[body_temperatures]
  where convert(date,DATEADD(hh,7,[createdAt])) between convert(date,'${startDate}') and convert(date,'${toDate}')`,
      {
        type: QueryTypes.SELECT,
      }
    );

    var excelFilePath = `files/Doc/Temperature_excel/Raw_temperature_ex_${startDate}_${toDate}.xlsx`;

    var xls = await json2xls(response);
    await fs.writeFileSync(excelFilePath, xls, "binary");

    res.download(excelFilePath);
    // res.json({ response });
  } catch (error) {
    console.log(error);
    res.json({ error, message: constant.kResultNok });
  }
});

router.get("/all_manpower_ex", async (req, res) => {
  try {
    // const { divisionCode, startDate, toDate } = req.params;

    let result = await emp_master.sequelize.query(
      `SELECT [employee_number]
      ,[place]
      ,[divisionCode]
      ,[sectionCode]
      ,[processCode]
      ,[employee_name]
      ,[employee_sex]
      ,[schedule_shift]
      ,[process_shift]
      ,[bus_line]
      ,[employee_type]
      ,[createdAt]
      ,[updatedAt]
  FROM [userMaster].[dbo].[employee_lists]`,
      {
        type: QueryTypes.SELECT,
      }
    );
    let DateNow = formatDate(new Date());

    var excelFilePath = `files/Doc/Temperature_excel/all_manpower_ex_${DateNow}.xlsx`;

    var xls = await json2xls(result);
    await fs.writeFileSync(excelFilePath, xls, "binary");

    res.download(excelFilePath);
    // fs.unlinkSync(excelFilePath);
    // res.json({
    //   result: result,
    //   DateNow,
    //   message: constant.kResultOk,
    // });
  } catch (error) {
    res.json({
      error,
      message: constant.kResultNok,
    });
  }
});

//remove all file in dir
router.delete("/clearTemperatureFile", async (req, res) => {
  try {
    var fileDir = "files/Doc/Temperature_excel/";
    fsExtra.emptyDirSync(fileDir);
    res.json({
      message: constant.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constant.kResultNok,
    });
  }
});

module.exports = router;
