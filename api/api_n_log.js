//Reference
const express = require("express");
const router = express.Router();
const Sequelize = require("Sequelize");
//Create constant and link to model
// จะทำงาน แม้ว่ายังไม่มีการกด link ก็ตาม
const log_table = require("./../model/cq_log");

const constant = require("./../constant/constant");

router.post("/regist", async (req, res) => {
  try {
    let insert_result = await log_table.create(req.body); //await คือรอให้ส่ง ข้อมูลก่อนจึงตอบ
    res.json({ result: insert_result, api_result: constant.kResultOk });
    // console.log('====================');
    // console.log(insert_result);
  } catch (error) {
    res.json({ result: error, api_result: constant.kResultNok });
  }
});

router.get(
  "/report/:start/:end/:operation/:plant/:division/:place/:symptom/:cd",
  async (req, res) => {
    try {
      console.log('report');
      const { start, end, operation, plant, division, place, symptom, cd } =
        req.params;

      var condition_operation;
      var condition_plant;
      var condition_division;
      var condition_place;
      var condition_symptom;
      var condition_cd;
      if (operation == "All") {
        condition_operation = ` `;
      } else {
        var condition_operation = ` and [cq_logs].[operation] = '${operation}'`;
      }
      if (plant == "All") {
        condition_plant = ` `;
      } else {
        var condition_plant = ` and [cq_logs].[emp_factory] = '${plant}'`;
      }
      if (division == "All") {
        condition_division = ` `;
      } else {
        var condition_division = ` and [cq_logs].[emp_division] = '${division}'`;
      }
      if (place == "All") {
        condition_place = ` `;
      } else {
        var condition_place = ` and [cq_logs].[place_name] = N'${place}'`;
      }
      if (symptom == "All") {
        condition_symptom = ` `;
      } else {
        if (symptom == "Yes") {
          condition_symptom = ` and [cq_logs].[symptom] <> ''`;
        } else {
          condition_symptom = ` and [cq_logs].[symptom] = ''`;
        }
      }
      if (cd == "All") {
        condition_cd = ` `;
      } else {
        if (cd == "Yes") {
          condition_cd = ` and [cq_logs].[congenital_disease] <> ''`;
        } else {
          condition_cd = ` and [cq_logs].[congenital_disease] = ''`;
        }
      }

      let result = await log_table.sequelize.query(
        `SELECT [timestamp],[mfgdate],[time],CONVERT(varchar, CONVERT(TIME(0), [time]))as [time_text],[update_by],[operation],[emp_no],[emp_name],[emp_division],[emp_factory]
        ,[emp_height],[emp_weight],[emp_tel],[emp_process],[other_tel],[room_no],[place_name]
        ,[check_in_date],[symptom],[congenital_disease] 
    FROM [CovidCC].[dbo].[cq_logs] where ([cq_logs].[check_in_date] between '${start}' and '${end}')` +
        condition_operation +
        condition_plant +
        condition_division +
        condition_place +
        condition_symptom +
        condition_cd +
        `order by [timestamp] desc`
      );
      res.json({ result: result[0], api_result: constant.kResultOk });
    } catch (error) {
      console.log(error);
      res.json({ error, api_result: constant.kResultNok });
    }
  }
);

module.exports = router;
