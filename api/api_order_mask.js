const express = require("express");
const constant = require("../constant/constant");
const router = express.Router();
const employee_master = require("../model/employee_master");
const order_mask = require("../model/order_mask");
const CsvParser = require("json2csv").Parser;
const json2xls = require("json2xls");
const fs = require("fs");
const { QueryTypes } = require("sequelize");

router.get("/employee_master/:employee_number", async (req, res) => {
  try {
    const { employee_number } = req.params;
    let result = await employee_master.findOne({ where: { employee_number } });
    res.json({ result, api_result: constant.kResultOk });
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
  }
});

// router.post("/order_mask", async (req, res) => {
//   try {
//     let result = await order_mask.create(req.body);
//     res.json({ result, api_result: constant.kResultOk });
//   } catch (error) {
//     res.json({ error, api_result: constant.kResultNok });
//   }
// });

router.get("/order_masks", async (req, res) => {
  try {
    let result = await order_mask.sequelize.query(
      `/****** Script for SelectTopNRows command from SSMS  ******/
      SELECT A.[employee_number]
            ,[order_reason]
          ,B.[divisionCode]
          ,isnull([divisionName], 'not found') as [divisionName]
            ,isnull([PlantCode] , 'not found') as [PlantCode]
          ,[employee_name]
          ,[employee_sex]
            ,CONVERT(varchar,A.[createdAt] , 100) as [createdAt]
            ,CONVERT(varchar,A.[updatedAt] , 100) as [updatedAt]
        FROM [userMaster].[dbo].[order_masks] A 
        left join [userMaster].[dbo].[employee_lists] B
        on A.[employee_number] = B.[employee_number] 
        left join [userMaster].[dbo].[divison_masters] C 
        on  B.[divisionCode] = C.[divisionCode]`,
      {
        type: QueryTypes.SELECT,
      }
    );

    var excelFilePath = `files/Doc/OrderMask.xlsx`;
    var xls = json2xls(result);
    await fs.writeFileSync(excelFilePath, xls, "binary");
    res.download(excelFilePath);
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/summary_reason", async (req, res) => {
  try {
    let result = await order_mask.sequelize.query(
      `SELECT
      [order_reason]
       ,count(A.[employee_number]) as [count_reason]
       ,isnull([PlantCode] , 'not found') as [PlantCode]
   FROM [userMaster].[dbo].[order_masks] A 
   left join [userMaster].[dbo].[employee_lists] B
   on A.[employee_number] = B.[employee_number] 
   left join [userMaster].[dbo].[divison_masters] C 
   on  B.[divisionCode] = C.[divisionCode]
   group by [order_reason] ,isnull([PlantCode] , 'not found')
   order by isnull([PlantCode] , 'not found') , count(A.[employee_number]) desc`,
      {
        type: QueryTypes.SELECT,
      }
    );

    var excelFilePath = `files/Doc/summary_reason.xlsx`;
    var xls = json2xls(result);
    await fs.writeFileSync(excelFilePath, xls, "binary");
    res.download(excelFilePath);
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/summary_division", async (req, res) => {
  try {
    let result = await order_mask.sequelize.query(
      `/****** Script for SelectTopNRows command from SSMS  ******/
      SELECT
           isnull([divisionName], 'not found') as [divisionName]
           ,isnull([PlantCode] , 'not found') as [PlantCode]
            ,count(A.[employee_number]) as [count_order]
        FROM [userMaster].[dbo].[order_masks] A 
        left join [userMaster].[dbo].[employee_lists] B
        on A.[employee_number] = B.[employee_number] 
        left join [userMaster].[dbo].[divison_masters] C 
        on  B.[divisionCode] = C.[divisionCode]
        group by isnull([divisionName], 'not found') , isnull([PlantCode] , 'not found') 
        order by isnull([PlantCode] , 'not found'), count(A.[employee_number])  desc`,
      {
        type: QueryTypes.SELECT,
      }
    );

    var excelFilePath = `files/Doc/summary_division.xlsx`;
    var xls = json2xls(result);
    await fs.writeFileSync(excelFilePath, xls, "binary");
    res.download(excelFilePath);
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/sum_order", async (req, res) => {
  try {
    let result = await order_mask.findAll();

    res.json(result.length);
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/find_order_mask/:employee_number", async (req, res) => {
  try {
    const { employee_number } = req.params;
    let result = await order_mask.findOne({ where: { employee_number } });
    res.json({ result, api_result: constant.kResultOk });
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
  }
});

module.exports = router;
