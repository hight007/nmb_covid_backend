//Reference
const express = require("express");
const router = express.Router();
const Sequelize = require("Sequelize");
//Create constant and link to model
// จะทำงาน แม้ว่ายังไม่มีการกด link ก็ตาม
const balance_table = require("./../model/cq_balance");

const constant = require("./../constant/constant");

router.post("/regist", async (req, res) => {
  try {
    let insert_result = await balance_table.create(req.body); //await คือรอให้ส่ง ข้อมูลก่อนจึงตอบ
    res.json({ result: insert_result, api_result: constant.kResultOk });
  } catch (error) {
    res.json({ result: error, api_result: constant.kResultNok });
  }
});

router.get("/check/:emp_no", async (req, res) => {
  try {
    const { emp_no } = req.params;
    let result = await balance_table.sequelize.query(
      `SELECT [id],[timestamp],[mfgdate],[time],[update_by],[emp_no],[emp_name]
      ,[emp_division],[emp_factory],[emp_height],[emp_weight],[emp_tel]
      ,[emp_process],[other_tel],[room_no],[place_name],[check_in_date]
      ,[symptom],[congenital_disease]
      ,[createdAt],[updatedAt]
  FROM [CovidCC].[dbo].[cq_balances]
    where [emp_no] = '${emp_no}'`
    );
    // console.log(result);
    res.json({ result: result[0], api_result: constant.kResultOk });
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.put("/update", async (req, res) => {
  try {
    let result = await balance_table.update(req.body, {
      where: { emp_no: req.body.emp_no },
    });
    res.json({ result, api_result: constant.kResultOk });
  } catch (error) {
    console.log("====");
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

//delete
router.patch("/delete", async (req, res) => {
  try {
    let result = await balance_table.destroy({
      where: { emp_no: req.body.emp_no },
    });
    res.json({ result, api_result: constant.kResultOk });
    //console.log(result);
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
    //console.log(error);
  }
});

router.get("/report/:plant/:division/:place/:symptom/:cd", async (req, res) => {
  try {
    const { plant, division, place, symptom, cd } = req.params;
    var condition_plant;
    var condition_division;
    var condition_place;
    var condition_symptom;
    var condition_cd;

    if (plant == "All") {
      condition_plant = ` `;
    } else {
      var condition_plant = ` and [cq_balances].[emp_factory] = '${plant}'`;
    }
    if (division == "All") {
      condition_division = ` `;
    } else {
      var condition_division = ` and [cq_balances].[emp_division] = '${division}'`;
    }
    if (place == "All") {
      condition_place = ` `;
    } else {
      var condition_place = ` and [cq_balances].[place_name] = N'${place}'`;
    }
    if (symptom == "All") {
      condition_symptom = ` `;
    } else {
      if (symptom == "Yes") {
        condition_symptom = ` and [cq_balances].[symptom] <> ''`;
      } else {
        condition_symptom = ` and [cq_balances].[symptom] = ''`;
      }
    }
    if (cd == "All") {
      condition_cd = ` `;
    } else {
      if (cd == "Yes") {
        condition_cd = ` and [cq_balances].[congenital_disease] <> ''`;
      } else {
        condition_cd = ` and [cq_balances].[congenital_disease] = ''`;
      }
    }

    let result = await balance_table.sequelize.query(
      `SELECT [timestamp],[mfgdate],[time],CONVERT(varchar, CONVERT(TIME(0), [time]))as [time_text],[update_by],[emp_no],[emp_name],[emp_division],[emp_factory]
        ,[emp_height],[emp_weight],[emp_tel],[emp_process],[other_tel],[room_no],[place_name]
        ,[check_in_date],[symptom],[congenital_disease] 
    FROM [CovidCC].[dbo].[cq_balances] where [emp_no] <> '' ` +
      condition_plant +
      condition_division +
      condition_place +
      condition_symptom +
      condition_cd +
      `order by [timestamp] desc`
    );
    // console.log(result);
    res.json({ result: result[0], api_result: constant.kResultOk });
  } catch (error) {
    console.log(error);
    res.json({ error, api_result: constant.kResultNok });
  }
});

module.exports = router;
