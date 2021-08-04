//Reference
const express = require("express");
const router = express.Router();
const Sequelize = require("Sequelize");
//Create constant and link to model
// จะทำงาน แม้ว่ายังไม่มีการกด link ก็ตาม
const dom_table = require("./../model/cq_domitory");

const constant = require("./../constant/constant");
const bcrypt = require("bcryptjs");

router.post("/upload", async (req, res) => {

  try {

    let insert_result = await dom_table.create(req.body); //await คือรอให้ส่ง ข้อมูลก่อนจึงตอบ
    res.json({ result: insert_result, api_result: constant.kResultOk });
  } catch (error) {
    console.log(error);
    res.json({ result: error, api_result: constant.kResultNok });
  }

});

router.get("/check_dup/:zone/:dom/:room", async (req, res) => {
  try {
    const { zone, dom, room } = req.params;

    let result = await dom_table.sequelize.query(
      `SELECT [id],[zone],[domitory],[room],[bed],[createdAt],[updatedAt]
      FROM [CovidCC].[dbo].[cq_domitories] 
      where [zone] = '${zone}' and [domitory] = N'${dom}' and [room] = '${room}' 
      `
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }

});
module.exports = router;