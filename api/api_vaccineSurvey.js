const express = require("express");
const constant = require("../constant/constant");
const router = express.Router();
const vaccineSurvey = require("../model/vaccineSurvey");
const all_emp_master = require("./../model/all_emp_master");
const { Op } = require("sequelize");
const json2xls = require("json2xls");
const fs = require("fs");
const { QueryTypes } = require("sequelize");
const moment = require("moment");

router.get("/employee_master/:employee_number", async (req, res) => {
  try {
    const { employee_number } = req.params;
    let result = await all_emp_master.findOne({ where: { employee_number } });
    res.json({ result, api_result: constant.kResultOk });
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.post("/survey", async (req, res) => {
  try {
    let result = await vaccineSurvey.create(req.body);
    res.json({ result, api_result: constant.kResultOk });
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get('/survey' , async (req, res) => {
  try {
    console.log('start vaccine survey');
    const response = await vaccineSurvey.sequelize.query(
      `WITH ranked_messages AS (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY [empNumber] ORDER BY id DESC) AS rn
        FROM [CovidCC].[dbo].[vaccineSurveys]  AS m
      ),
	  sumByEmp as (
	  SELECT count([id]) as [CountSurvey]
      ,[empNumber]
	  FROM [CovidCC].[dbo].[vaccineSurveys]
	  group by [empNumber]
	  )
      SELECT
	  a.[empNumber] as 'รหัสพนักงาน',
	  b.[employee_type] as 'สถานะพนักงาน',
	  b.[employee_name] as 'ชื่อ - นามสกุล' ,
	  d.[PlantName] as 'โรงงาน',
	  c.[divisionName] as 'ฝ่าย',
	  b.[divisionCode],
	  [sectionCode],
      [processCode],
	  e.[CountSurvey] as 'จำนวนที่ทำแบบสอบถาม',
	  iif(a.[isNeedVaccine] = 0 , 'noNeed' ,'need' ) as 'ท่านมีความต้องการฉีดวัคซีนหรือไม่ : ต้องการ',
	  a.[noNeedVaccineReason] as 'ระบุสาเหตุ ไม่ต้องการ',
	  a.[vaccineStatus] as 'สถานะการฉีดวัคซีนของท่าน : ฉีดแล้ว' ,
	  CONVERT(VARCHAR, a.[firstVaccineDate] , 105) as 'ระบุวันที่ฉีดเข็มที่ 1',
	  CONVERT(VARCHAR, a.[seccondVaccineDate] , 105) as 'ระบุวันที่ฉีดเข็มที่ 2' ,
	  a.[bookVaccineStatus] as 'ยังไม่ทราบวันที่ฉีด / รอการยืนยัน',
	  a.[noBookVaccineReason] as 'ระบุสาเหตุ ยังไม่สามารถจองได้',
	  iif(a.[isAggreeInformation] = 0 ,'not agree','agree') as 'ข้าพเจ้ายินยอมให้ข้อมูลกับบริษัทฯ',
	  CONVERT(VARCHAR, a.[updatedAt] AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time' , 120) as 'เวลาที่กรอกข้อมูล',
	  a.vaccine1 as 'วัคซีนเข็มที่หนึ่ง',
	  a.vaccine2 as 'วัคซีนเข็มที่สอง'
	  FROM ranked_messages a
	  join [userMaster].[dbo].[all_employee_lists] b on a.[empNumber] = b.[employee_number] COLLATE Thai_CI_AS
	  join [userMaster].[dbo].[divison_masters] c on b.[divisionCode] = c.[divisionCode] COLLATE Thai_CI_AS
	  join [userMaster].[dbo].[plant_masters] d on c.[PlantCode] = d.[PlantCode] COLLATE Thai_CI_AS
	  join sumByEmp e on a.[empNumber] = e.[empNumber] COLLATE Thai_CI_AS
	  WHERE rn = 1
	  `,
      {
        type: QueryTypes.SELECT,
      }
    );
    var excelFilePath = `files/Doc/vaccine_survey_${moment().format('DDMMYYYY')}.xlsx`;

      var xls = await json2xls(response);
      await fs.writeFileSync(excelFilePath, xls, "binary");

      res.download(excelFilePath);
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
})

router.get('/missing' , async (req, res) => {
  try {
    const response = await vaccineSurvey.sequelize.query(
      `SELECT a.* , [divisionName] , d.[PlantName]
      FROM [userMaster].[dbo].[all_employee_lists] a 
      left join [CovidCC].[dbo].[vaccineSurveys] b on a.[employee_number] = b.[empNumber] COLLATE Thai_CI_AS
      join [userMaster].[dbo].[divison_masters] c on a.[divisionCode] = c.[divisionCode] COLLATE Thai_CI_AS
      join [userMaster].[dbo].[plant_masters] d on c.[PlantCode] = d.[PlantCode] COLLATE Thai_CI_AS
      where b.[id] is null
	  `,
      {
        type: QueryTypes.SELECT,
      }
    );
    var excelFilePath = `files/Doc/missing_vaccine_survey_${moment().format('DDMMYYYY')}.xlsx`;

      var xls = await json2xls(response);
      await fs.writeFileSync(excelFilePath, xls, "binary");

      res.download(excelFilePath);
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
})

module.exports = router;
