const express = require("express");
const router = express.Router();
const Sequelize = require("Sequelize");
//Create constant and link to model
// จะทำงาน แม้ว่ายังไม่มีการกด link ก็ตาม
const user_table = require("./../model/user");
const constant = require("./../constant/constant");

router.get("/find_emp/:emp_no", async (req, res) => {
  try {
    const { emp_no } = req.params;

    let result = await user_table.sequelize.query(
      `SELECT [employee_number]
      ,[place]
      ,[all_employee_lists].[divisionCode]
      ,[sectionCode]
      ,[processCode]
      ,SUBSTRING([employee_name], 5, len([employee_name])) as [employee_name]
      ,[employee_type]
	  ,[divisionName]
      ,[divison_masters].[PlantCode]
	  ,[PlantName]
  FROM [userMaster].[dbo].[all_employee_lists]
  left join [userMaster].[dbo].[divison_masters] 
  on [userMaster].[dbo].[all_employee_lists].[divisionCode] = [userMaster].[dbo].[divison_masters].[divisionCode]
  left join [userMaster].[dbo].[plant_masters]
  on [userMaster].[dbo].[plant_masters].[PlantCode] = [divison_masters].[PlantCode]
  where [employee_number] = '${emp_no}'`
    );

    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/find_div/:plant", async (req, res) => {
  try {
    const { plant } = req.params;
    var condition_plant;
    if (plant == "All") {
      condition_plant = ` `;
    } else {
      var condition_plant = ` where [plant_masters].[PlantName] = '${plant}'`;
    }
    let result = await user_table.sequelize.query(
      `SELECT  [divisionCode]
    ,[divisionName]
    ,[divison_masters].[PlantCode]
  ,[plant_masters].[PlantName]
FROM [userMaster].[dbo].[divison_masters]

   
left join [userMaster].[dbo].[plant_masters] 
on [divison_masters].[PlantCode] = [plant_masters].[PlantCode]` +
      condition_plant + `order by [divisionName]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/find_div_in_log", async (req, res) => {
  try {
    let result = await user_table.sequelize.query(
      `SELECT distinct [emp_division] FROM [CovidCC].[dbo].[cq_logs] order by [emp_division]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    res.json({ error })
    console.log(error);
  }

});

router.get("/find_place_in_log", async (req, res) => {
  try {
    let result = await user_table.sequelize.query(
      `SELECT distinct [place_name] FROM [CovidCC].[dbo].[cq_logs] order by [place_name]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});
 
router.get("/find_div_in_balance", async (req, res) => {
  try {
    let result = await user_table.sequelize.query(
      `SELECT distinct [emp_division] FROM [CovidCC].[dbo].[cq_balances] order by [emp_division]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/find_place_in_balance", async (req, res) => {
  try {
    let result = await user_table.sequelize.query(
      `SELECT distinct [place_name] FROM [CovidCC].[dbo].[cq_balances] order by [place_name]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/find_dom/:plant", async (req, res) => {
  try {
    const { plant } = req.params;

    let result = await user_table.sequelize.query(
      `SELECT distinct [domitory]    
    FROM [CovidCC].[dbo].[cq_domitories]
    where [zone] = '${plant}'  order by [domitory]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/find_room/:zone/:domitory", async (req, res) => {
  try {
    const { zone, domitory } = req.params;

    let result = await user_table.sequelize.query(
      `SELECT distinct [room]    
    FROM [CovidCC].[dbo].[cq_domitories]
    where [zone] = '${zone}' and [domitory] = N'${domitory}' order by [room]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/find_bed/:zone/:domitory/:room", async (req, res) => {
  try {
    const { zone, domitory, room } = req.params;

    let result = await user_table.sequelize.query(
      `SELECT distinct [bed]    
    FROM [CovidCC].[dbo].[cq_domitories]
    where [zone] = '${zone}' and [domitory] = N'${domitory}' and [room] = '${room}' order by [bed]`
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/check_dup/:zone/:domitory/:room/:bed", async (req, res) => {
  try {
    const { zone, domitory, room, bed } = req.params;

    let result = await user_table.sequelize.query(
      `SELECT distinct [emp_no]  
    FROM [CovidCC].[dbo].[cq_balances]
    where [zone] = '${zone}' and [place_name] = N'${domitory}' and [room_no] = '${room}' and[bed] = '${bed}' `
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/check_by_zone/:zone", async (req, res) => {
  try {
    const { zone } = req.params;
    var condition_zone;
    if (zone == "All") {
      condition_zone = ` `;
    } else {
      var condition_zone = ` where [zone] = '${zone}'`;
    }
    let result = await user_table.sequelize.query(
      `with table1 as(
      SELECT [cq_domitories].[zone]
            ,[cq_domitories].[domitory]
            ,[cq_domitories].[room]
            ,[cq_domitories].[bed]
          ,[cq_balances].[emp_no]
        FROM [CovidCC].[dbo].[cq_domitories]
        left join  [CovidCC].[dbo].[cq_balances]
        on [cq_domitories].[zone] = [cq_balances].[zone]  
        and [cq_domitories].[domitory] = [cq_balances].[place_name]
        and [cq_domitories].[room] = [cq_balances].[room_no]
        and [cq_domitories].[bed] = [cq_balances].[bed]
        )
        , table2 as(
        select [zone],[domitory],count([emp_no]) as [emp],count([bed]) as [bed]
        ,CONVERT(varchar(10), count([emp_no])) +' / ' + CONVERT(varchar(10), count([bed])) as [Usage]
        ,CAST(100.00* count([emp_no])/count([bed]) AS DECIMAL(10, 2) )as [Percentage]
         from table1 group by [zone],[domitory]
        )
       select [zone],[domitory],[emp],[bed],[Usage],[Percentage]
       ,iif([Percentage]<25,'progress-bar bg-primary',iif([Percentage]<50,'progress-bar bg-success',iif([Percentage]<75,'progress-bar bg-warning','progress-bar bg-danger'))) as [Color]
        from table2 `+ condition_zone
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.get("/check_by_dom/:zone/:domitory", async (req, res) => {
  try {
    const { zone, domitory } = req.params;

    let result = await user_table.sequelize.query(
      `SELECT [cq_domitories].[zone]
    ,[cq_domitories].[domitory]
    ,[cq_domitories].[room]
    ,[cq_domitories].[bed]
  ,iif([cq_balances].[emp_no] is null,'',[cq_balances].[emp_no] ) as[emp_no]
  ,iif([emp_name] is null,'',[emp_name] ) as[emp_name]
  ,iif([emp_division]  is null,'',[emp_division]  ) as[emp_division] 
  ,iif([emp_tel]  is null,'',[emp_tel]  ) as[emp_tel] 
  ,iif([other_tel] is null,'',[other_tel] ) as[other_tel]
   ,iif([check_in_date] is null,'',[check_in_date] ) as[check_in_date]
    ,iif([symptom] is null,'',[symptom] ) as[symptom]
   ,iif([congenital_disease] is null,'',[congenital_disease] ) as[congenital_disease]

FROM [CovidCC].[dbo].[cq_domitories]
left join  [CovidCC].[dbo].[cq_balances]
on [cq_domitories].[zone] = [cq_balances].[zone]  
and [cq_domitories].[domitory] = [cq_balances].[place_name]
and [cq_domitories].[room] = [cq_balances].[room_no]
and [cq_domitories].[bed] = [cq_balances].[bed]
where [cq_domitories].[zone] = '${zone}' and [cq_domitories].[domitory] = N'${domitory}'
order by [cq_domitories].[room],[cq_domitories].[bed] `
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

router.patch("/delete_dom/:zone/:domitory", async (req, res) => {

  try {
    const { zone, domitory } = req.params;

    let result = await user_table.sequelize.query(
      `delete FROM [CovidCC].[dbo].[cq_domitories]
where [cq_domitories].[zone] = '${zone}' and [cq_domitories].[domitory] = N'${domitory}'
 `
    );
    res.json({ result: result[0] });
  } catch (error) {
    console.log(error);
    res.json({ error })
  }

});

module.exports = router;
