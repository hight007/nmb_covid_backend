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

router.get('/survey/:divisionCode', async (req, res) => {
	try {
		const { divisionCode } = req.params
		var conditionDivisionCode = ''
		if (divisionCode != 'All') {
			conditionDivisionCode = `and b.[divisionCode] = '${divisionCode}'`
		}
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
	  CONVERT(VARCHAR, a.[thirdforthVaccineDate] , 105) as 'ระบุวันที่ฉีดเข็มที่ 3',
	  CONVERT(VARCHAR, a.[fourthVaccineDate] , 105) as 'ระบุวันที่ฉีดเข็มที่ 4' ,
	  a.[bookVaccineStatus] as 'ยังไม่ทราบวันที่ฉีด / รอการยืนยัน',
	  a.[noBookVaccineReason] as 'ระบุสาเหตุ ยังไม่สามารถจองได้',
	  iif(a.[isAggreeInformation] = 0 ,'not agree','agree') as 'ข้าพเจ้ายินยอมให้ข้อมูลกับบริษัทฯ',
	  CONVERT(VARCHAR, a.[updatedAt] AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time' , 120) as 'เวลาที่กรอกข้อมูล',
	  a.vaccine1 as 'วัคซีนเข็มที่หนึ่ง',
	  a.vaccine2 as 'วัคซีนเข็มที่สอง',
	  a.vaccine3 as 'วัคซีนเข็มที่สาม',
	  a.vaccine4 as 'วัคซีนเข็มที่สี่',
	  iif(a.[isNeedVaccine] = 1 and [bookVaccineStatus] is null and a.[noBookVaccineReason] is null,
		iif(a.[firstVaccineDate] < dateadd(HOUR , 0 ,getdate()) , 1 , 0) +
		iif(a.[seccondVaccineDate] < dateadd(HOUR , 0 ,getdate()) , 1 , 0) +
		iif(a.[thirdforthVaccineDate] < dateadd(HOUR , 0 ,getdate()) , 1 , 0) +
		iif(a.[fourthVaccineDate] < dateadd(HOUR , 0 ,getdate()) , 1 , 0),
		0) as [vaccineDose]
	  FROM ranked_messages a
	  join [userMaster].[dbo].[all_employee_lists] b on a.[empNumber] = b.[employee_number] COLLATE Thai_CI_AS
	  join [userMaster].[dbo].[divison_masters] c on b.[divisionCode] = c.[divisionCode] COLLATE Thai_CI_AS
	  join [userMaster].[dbo].[plant_masters] d on c.[PlantCode] = d.[PlantCode] COLLATE Thai_CI_AS
	  join sumByEmp e on a.[empNumber] = e.[empNumber] COLLATE Thai_CI_AS
	  WHERE rn = 1 ${conditionDivisionCode}`,
			{
				type: QueryTypes.SELECT,
			}
		);
		var excelFilePath = `files/Doc/vaccine_survey_${moment().format('DDMMYYYY')}_${divisionCode}.xlsx`;

		var xls = await json2xls(response);
		await fs.writeFileSync(excelFilePath, xls, "binary");

		res.download(excelFilePath);
	} catch (error) {
		console.log(error);
		res.json({ error, api_result: constant.kResultNok });
	}
})

router.get('/report', async (req, res) => {
	try {
		console.log('start vaccine survey');

		const vaccineStatus = await vaccineSurvey.sequelize.query(
			`WITH ranked_messages AS (
		SELECT m.*, ROW_NUMBER() OVER (PARTITION BY [empNumber] ORDER BY id DESC) AS rn
		FROM [CovidCC].[dbo].[vaccineSurveys]  AS m
      ), aaTable as (
			select * from ranked_messages WHERE rn = 1
	  ), bbTable as (
			SELECT count(*) as [Count] ,
			'no record' as [vaccineStatus]
			from aaTable a right join[userMaster].[dbo].[all_employee_lists] b on a.[empNumber] = b.[employee_number] COLLATE Thai_CI_AS
			where a.[empNumber] is null
	  ), ccTable as (
			SELECT
			count([empNumber]) as [Count],
			[vaccineStatus]
			FROM aaTable
			WHERE rn = 1
			group by [vaccineStatus]
	  )
	  select * from ccTable union select * from bbTable
	  `,
			{
				type: QueryTypes.SELECT,
			}
		);

		const vaccineType = await vaccineSurvey.sequelize.query(
			`WITH ranked_messages AS (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY [empNumber] ORDER BY id DESC) AS rn
        FROM [CovidCC].[dbo].[vaccineSurveys]  AS m

      ) , vaccineTable as (
	  SELECT
      [vaccine1] + ' + ' + [vaccine2] as [VaccineType]
	  FROM ranked_messages
	  WHERE rn = 1 and [bookVaccineStatus] is null and [vaccine1] is not null
	  )
      select [VaccineType] , count(*) as [count]
	   from vaccineTable
	   group by [VaccineType]
	   order by count(*) desc
	  `,
			{
				type: QueryTypes.SELECT,
			}
		);

		const vaccineDose = await vaccineSurvey.sequelize.query(`WITH ranked_messages AS(
      SELECT m.*, ROW_NUMBER() OVER(PARTITION BY[empNumber] ORDER BY id DESC) AS rn
        FROM[CovidCC].[dbo].[vaccineSurveys]  AS m
    ), aaTable as (
		select * from ranked_messages WHERE rn = 1
	), aTable as (
        SELECT
		iif(a.[isNeedVaccine] = 1 and[bookVaccineStatus] is null and a.[noBookVaccineReason] is null,
          iif(a.[firstVaccineDate] < dateadd(HOUR, -18, getdate()), 1, 0) +
          iif(a.[seccondVaccineDate] < dateadd(HOUR, -18, getdate()), 1, 0) +
          iif(a.[thirdforthVaccineDate] < dateadd(HOUR, -18, getdate()), 1, 0) +
          iif(a.[fourthVaccineDate] < dateadd(HOUR, -18, getdate()), 1, 0),
			iif(a.[empNumber] is null, -1, 0)) as [vaccineDose],
		  d.[PlantName]
		FROM aaTable a
	    right join[userMaster].[dbo].[all_employee_lists] b on a.[empNumber] = b.[employee_number] COLLATE Thai_CI_AS
		join [userMaster].[dbo].[divison_masters] c on b.[divisionCode] = c.[divisionCode] COLLATE Thai_CI_AS
		join [userMaster].[dbo].[plant_masters] d on c.[PlantCode] = d.[PlantCode] COLLATE Thai_CI_AS
    ) , bTable as (
		select
			[vaccineDose],
			[PlantName],
			count(*) as [Man]  from aTable
		group by [PlantName],[vaccineDose]
	),	cTable as (
		select
			[vaccineDose],
			count(*) as [Man]  from aTable
		group by [vaccineDose]
	),	dTable as (
		select 'Total' as [PlantName] ,
			isnull([-1],0) as [ไม่ลงข้อมูล],
			isnull([0],0) as [ยังไม่ได้ฉีด],
			isnull([1],0) as [ฉีดแล้ว 1 เข็ม],
			isnull([2],0) as [ฉีดแล้ว 2 เข็ม],
			isnull([3],0) as [ฉีดแล้ว 3 เข็ม],
			isnull([4],0) as [ฉีดแล้ว 4 เข็ม],
			isnull([-1],0)+isnull([0],0)+isnull([1],0)+isnull([2],0)+isnull([3],0)+isnull([4],0) as [ทั้งหมด]
		from cTable
		PIVOT (SUM([Man]) FOR [vaccineDose] IN([-1],[0],[1],[2],[3],[4])) AS P
	) , eTable as (
		select [PlantName] ,
			cast(isnull([-1],0) as decimal(10,0)) as [ไม่ลงข้อมูล],
			cast(isnull([0],0) as decimal(10,0)) as [ยังไม่ได้ฉีด],
			cast(isnull([1],0) as decimal(10,0)) as [ฉีดแล้ว 1 เข็ม],
			cast(isnull([2],0) as decimal(10,0)) as [ฉีดแล้ว 2 เข็ม],
			cast(isnull([3],0) as decimal(10,0)) as [ฉีดแล้ว 3 เข็ม],
			cast(isnull([4],0) as decimal(10,0)) as [ฉีดแล้ว 4 เข็ม],
			cast(isnull([-1],0) +
				isnull([0],0)+isnull([1],0) +
				isnull([2],0)+isnull([3],0) +
				isnull([4],0) as decimal(10,0)) as [ทั้งหมด]
		from bTable
		PIVOT (SUM([Man]) FOR [vaccineDose] IN([-1],[0],[1],[2],[3],[4])) AS P
		union all select * from dTable
	)
	select  * ,
		cast(([ไม่ลงข้อมูล]/[ทั้งหมด])*100 as numeric(10,2)) as [%ไม่ลงข้อมูล] ,
		cast(([ยังไม่ได้ฉีด]/[ทั้งหมด])*100 as numeric(10,2)) as [%ยังไม่ได้ฉีด] ,
		cast(([ฉีดแล้ว 1 เข็ม]/[ทั้งหมด])*100 as numeric(10,2)) as [%ฉีดแล้ว 1 เข็ม] ,
		cast(([ฉีดแล้ว 2 เข็ม]/[ทั้งหมด])*100 as numeric(10,2)) as [%ฉีดแล้ว 2 เข็ม] ,
		cast(([ฉีดแล้ว 3 เข็ม]/[ทั้งหมด])*100 as numeric(10,2)) as [%ฉีดแล้ว 3 เข็ม] ,
		cast(([ฉีดแล้ว 4 เข็ม]/[ทั้งหมด])*100 as numeric(10,2)) as [%ฉีดแล้ว 4 เข็ม]
	from eTable
	order by Case [PlantName]
    When 'Total' Then 99
    Else 1 End ,
	(([ฉีดแล้ว 1 เข็ม]/[ทั้งหมด]) + ([ฉีดแล้ว 2 เข็ม]/[ทั้งหมด]) + ([ฉีดแล้ว 3 เข็ม]/[ทั้งหมด]) + ([ฉีดแล้ว 4 เข็ม]/[ทั้งหมด])) desc`,
			{
				type: QueryTypes.SELECT,
			}
		)

		res.json({ vaccineStatus, vaccineType, vaccineDose, api_result: constant.kResultOk })
	} catch (error) {
		console.log(error);
		res.json({ error, api_result: constant.kResultNok });
	}
})

router.get('/missing/:divisionCode', async (req, res) => {
	try {
		const { divisionCode } = req.params
		var conditionDivisionCode = ''
		if (divisionCode != 'All') {
			conditionDivisionCode = `and a.[divisionCode] = '${divisionCode}'`
		}
		const response = await vaccineSurvey.sequelize.query(
			`SELECT a.* , [divisionName] , d.[PlantName]
      FROM [userMaster].[dbo].[all_employee_lists] a 
      left join [CovidCC].[dbo].[vaccineSurveys] b on a.[employee_number] = b.[empNumber] COLLATE Thai_CI_AS
      join [userMaster].[dbo].[divison_masters] c on a.[divisionCode] = c.[divisionCode] COLLATE Thai_CI_AS
      join [userMaster].[dbo].[plant_masters] d on c.[PlantCode] = d.[PlantCode] COLLATE Thai_CI_AS
      where b.[id] is null  ${conditionDivisionCode}`,
			{
				type: QueryTypes.SELECT,
			}
		);
		var excelFilePath = `files/Doc/missing_vaccine_survey_${moment().format('DDMMYYYY')}_${divisionCode}.xlsx`;

		var xls = await json2xls(response);
		await fs.writeFileSync(excelFilePath, xls, "binary");

		res.download(excelFilePath);
	} catch (error) {
		console.log(error);
		res.json({ error, api_result: constant.kResultNok });
	}
})

module.exports = router;
