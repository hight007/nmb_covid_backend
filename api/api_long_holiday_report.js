const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");
const { QueryTypes } = require("sequelize"); 

//models
const activity_master = require('../model/activity_master');

router.get("/long_holiday_report/:alert_date/:divisionCode", async (req, res) => {
    try {
        const { alert_date , divisionCode } = req.params;
        var divisionCondition = ''
        if (divisionCode !== 'All'){
            divisionCondition = ` and e.[divisionCode] = '${divisionCode}'`
        }

        let result = await activity_master.sequelize.query(`
SELECT [transaction_id]
      ,a.[employee_number]
	  ,e.[employee_name]
	  ,e.[employee_type]
	  ,d.[divisionName]
      ,e.[sectionCode]
	  ,e.[processCode]
	  ,p.[PlantName]
      ,cast([activity_date] as date) as [activity_date]
      ,[provinces]
      ,a.[place]
      ,[activity]
      ,[risk]
	  ,cast(l.[alert_date] as date) as [alert_date]
      ,a.[createdAt]
      ,a.[updatedAt]
  FROM [CovidCC].[dbo].[activity_transactions] a join [CovidCC].[dbo].[long_holiday_dates] l
  on  cast(DATEADD(HOUR,7,a.[activity_date]) as date) = cast(l.[long_holiday_date] as date)
  join [userMaster].[dbo].[all_employee_lists] e
  on e.employee_number = a.employee_number COLLATE Thai_CI_AS
  join [userMaster].[dbo].[divison_masters] d 
  on e.[divisionCode] = d.[divisionCode]
  join [userMaster].[dbo].[plant_masters] p 
  on d.[PlantCode] = p.[PlantCode]
  where cast(l.[alert_date] as date) = '${alert_date}' ${divisionCondition}`,
            {
                type: QueryTypes.SELECT,
            })
        res.json({
            api_result: constants.kResultOk,
            result,
        });
    } catch (error) {
        console.log(error);
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

router.get("/long_holiday_missing/:alert_date/:divisionCode" , async (req, res) => {
    
})

module.exports = router;
