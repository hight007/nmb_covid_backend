const express = require("express");
const router = express.Router();
const constants = require("../constant/constant");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const qr_covid = require("../model/qr_covid");
const { QueryTypes } = require("sequelize");
const moment = require("moment");
const formidable = require("formidable");
const CSVToJSON = require("csvtojson");
const CsvParser = require("json2csv").Parser;

router.get(
  "/empTrackBus/:empNumber&:startDate&:toDate&:busZone",
  async (req, res) => {
    const { empNumber, startDate, toDate, busZone } = req.params;
    if (
      empNumber == null ||
      startDate == null ||
      toDate == null ||
      busZone == null
    ) {
      res.json({
        error: "parameter not complete",
        message: constants.kResultNok,
      });
    } else {
      try {
        let busZoneCommand = "";
        if (busZone != "All") {
          busZoneCommand = "and SUBSTRING([Getdata],2,1) = '" + busZone + "'";
        }
        let result = await qr_covid.sequelize.query(
          `SELECT [EmpNo]
        ,[Update]
        ,[Getdata]
        ,B.[zone_name] as [Bus_Zone]
        ,C.[bus_company_name] as [Bus_Company]
        ,SUBSTRING([Getdata],8,2) as [Province]
        ,SUBSTRING([Getdata],4,4) as [Plate]
        ,SUBSTRING([Getdata],10,3) as [Seat_number]
    FROM [CovidCC].[dbo].[GetThedatas] A left join [CovidCC].[dbo].[bus_zones] B
    on SUBSTRING([Getdata],2,1) = B.[zone_code]
    left join [CovidCC].[dbo].[bus_companies] C
    on SUBSTRING([Getdata],3,1) = C.[bus_company_code]
    where SUBSTRING([Getdata] , 1,1) = 'B' and [EmpNo] = '` +
          empNumber +
          `'
    and ([update] between '` +
          startDate +
          `' and '` +
          toDate +
          `')
            ` +
          busZoneCommand +
          `
    order by [Update] desc`,
          {
            type: QueryTypes.SELECT,
          }
        );
        res.json({
          result,
          message: constants.kResultOk,
        });
      } catch (error) {
        res.json({
          error,
          message: constants.kResultNok,
        });
      }
    }
  }
);

router.get("/TrackBusPlate/:Plate&:startDate&:toDate", async (req, res) => {
  console.log("TrackBusPlate");
  const { Plate, startDate, toDate } = req.params;
  if (Plate == null || startDate == null || toDate == null) {
    res.json({
      error: "parameter not complete",
      message: constants.kResultNok,
    });
  } else {
    try {
      let result = await qr_covid.sequelize.query(
        `SELECT [EmpNo]
        ,[Update]
        ,[Getdata]
        ,B.[zone_name] as [Bus_Zone]
        ,C.[bus_company_name] as [Bus_Company]
        ,SUBSTRING([Getdata],8,2) as [Province]
        ,SUBSTRING([Getdata],4,4) as [Plate]
        ,SUBSTRING([Getdata],10,3) as [Seat_number]
    FROM [CovidCC].[dbo].[GetThedatas] A left join [CovidCC].[dbo].[bus_zones] B
    on SUBSTRING([Getdata],2,1) = B.[zone_code]
    left join [CovidCC].[dbo].[bus_companies] C
    on SUBSTRING([Getdata],3,1) = C.[bus_company_code]
    where SUBSTRING([Getdata] , 1,1) = 'B' and SUBSTRING([Getdata],4,4) = '` +
        Plate +
        `'
    and ([update] between '` +
        startDate +
        `' and '` +
        toDate +
        `')
    order by [Update] desc`,
        {
          type: QueryTypes.SELECT,
        }
      );
      res.json({
        result,
        message: constants.kResultOk,
      });
    } catch (error) {
      res.json({
        error,
        message: constants.kResultNok,
      });
    }
  }
});

router.get("/TrackBusSeat/:infectDate&:EmpNo&:previousDay&:riskTimeMin&:riskTimeMax", async (req, res) => {
  try {
    console.log("TrackBusSeat");
    const { infectDate, EmpNo, previousDay, riskTimeMin, riskTimeMax } = req.params;
    let riskResult = [];
    const InfectedPersonHistory = await qr_covid.sequelize.query(
      `SELECT [EmpNo]
        ,[Update]
        ,[Getdata]
        ,B.[zone_name] as [Bus_Zone]
        ,C.[bus_company_name] as [Bus_Company]
        ,SUBSTRING([Getdata],8,2) as [Province]
        ,SUBSTRING([Getdata],3,5) as [Plate]
        ,SUBSTRING([Getdata],10,3) as [Seat_number]
		,SUBSTRING([Getdata],10,1) as [Seat_column]
    ,SUBSTRING([Getdata],11,2) as [Seat_row]
    FROM [CovidCC].[dbo].[GetThedatas] A left join [CovidCC].[dbo].[bus_zones] B
    on SUBSTRING([Getdata],2,1) = B.[zone_code]
    left join [CovidCC].[dbo].[bus_companies] C
    on SUBSTRING([Getdata],3,1) = C.[bus_company_code]
    where SUBSTRING([Getdata] , 1,1) = 'B'  and
	(CONVERT(DATE, [update]) between DATEADD(day, -${previousDay}, '${infectDate}') and DATEADD(day, 0, '${infectDate}')) and
	[EmpNo] = '${EmpNo}'
	order by [Update] desc`,
      {
        type: QueryTypes.SELECT,
      }
    )
    const contactSeatBusRules = (Seat_column, Seat_row) => {
      switch (Seat_column) {
        case 'A':
          return `or SUBSTRING([Getdata],10,3) = 'B${Seat_row}'`
        case 'B':
          return `or SUBSTRING([Getdata],10,3) = 'A${Seat_row}' or SUBSTRING([Getdata],10,3) = 'C${Seat_row}'`
        case 'C':
          return `or SUBSTRING([Getdata],10,3) = 'B${Seat_row}' or SUBSTRING([Getdata],10,3) = 'D${Seat_row}'`

        default:
          return `or SUBSTRING([Getdata],10,3) = 'C${Seat_row}'`
      }
    }

    for (let i = 0; i < InfectedPersonHistory.length; i++) {
      const item = InfectedPersonHistory[i];
      const riskPerson = await qr_covid.sequelize.query(
        `SELECT [EmpNo]
        ,[Update]
        ,[Getdata]
        ,B.[zone_name] as [Bus_Zone]
        ,C.[bus_company_name] as [Bus_Company]
        ,SUBSTRING([Getdata],8,2) as [Province]
        ,SUBSTRING([Getdata],3,5) as [Plate]
        ,SUBSTRING([Getdata],10,3) as [Seat_number]
		,SUBSTRING([Getdata],10,1) as [Seat_column]
    FROM [CovidCC].[dbo].[GetThedatas] A left join [CovidCC].[dbo].[bus_zones] B
    on SUBSTRING([Getdata],2,1) = B.[zone_code]
    left join [CovidCC].[dbo].[bus_companies] C
    on SUBSTRING([Getdata],3,1) = C.[bus_company_code]
    where SUBSTRING([Getdata] , 1,1) = 'B'  and
	([update] between '${moment(item.Update).utc().add(-parseInt(riskTimeMin), 'hours').format('YYYY-MM-DD HH:mm:ss')}' and '${moment(item.Update).utc().add(parseInt(riskTimeMax), 'hours').format('YYYY-MM-DD HH:mm:ss')}')and
	SUBSTRING([Getdata],3,5) = '${item.Plate}' and SUBSTRING([Getdata],8,2) = '${item.Province}' and
	(SUBSTRING([Getdata],10,3) = '${item.Seat_number}' ${contactSeatBusRules(item.Seat_column, item.Seat_row)} ) and
	[EmpNo] != '${EmpNo}'
	order by [Update] desc`,
        {
          type: QueryTypes.SELECT,
        }

      )
      for (let j = 0; j < riskPerson.length; j++) {
        const element = riskPerson[j];
        riskResult.push(element)
      }
    }

    res.json({ InfectedPersonHistory, riskResult, message: constants.kResultOk })

  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }

});


router.get(
  "/empTrackBreak/:empNumber&:startDate&:toDate&:breakType",
  async (req, res) => {
    const { empNumber, startDate, toDate, breakType } = req.params;
    if (
      empNumber == null ||
      startDate == null ||
      toDate == null ||
      breakType == null
    ) {
      res.json({
        error: "parameter not complete",
        message: constants.kResultNok,
      });
    } else {
      try {
        let breakTypeCommand = "";
        if (breakType != "All") {
          breakTypeCommand =
            "and SUBSTRING([Getdata],1,1) = '" + breakType + "'";
        }
        let result = await qr_covid.sequelize.query(
          `SELECT  [Update]
          ,[EmpNo]
          ,[Getdata]
          ,B.[break_type_name] as [break_type]
          ,C.[PlantName] as [Plant]
          ,D.[break_area_name] as [break_area]
          ,SUBSTRING([Getdata],6,1) as [Table_zone]
          ,SUBSTRING([Getdata],7,3) as [Table_number]
          ,SUBSTRING([Getdata],10,3) as [Seat_number]
     
       FROM [CovidCC].[dbo].[GetThedatas] A left join [CovidCC].[dbo].[break_types] B
       on SUBSTRING([Getdata],1,1) = B.[break_type_code]
       left join [userMaster].[dbo].[plant_masters] C
       on SUBSTRING([Getdata],2,2) = C.[PlantCode] COLLATE Thai_CI_AS
       left join [CovidCC].[dbo].[break_areas] D
       on SUBSTRING([Getdata],4,2) = D.[break_area_code]
     
    where SUBSTRING([Getdata] , 1,1) != 'B' and [EmpNo] = '` +
          empNumber +
          `'
    and ([update] between '` +
          startDate +
          `' and '` +
          toDate +
          `')
            ` +
          breakTypeCommand +
          `
    order by [Update] desc`,
          {
            type: QueryTypes.SELECT,
          }
        );
        res.json({
          result,
          message: constants.kResultOk,
        });
      } catch (error) {
        res.json({
          error,
          message: constants.kResultNok,
        });
      }
    }
  }
);

router.get("/noScanReport/:startDate&:toDate", async (req, res) => {
  const { startDate, toDate } = req.params;
  if (startDate == null || toDate == null) {
    res.json({
      error: "parameter not complete",
      message: constants.kResultNok,
    });
  } else {
    try {
      let result = await qr_covid.sequelize.query(
        `with filterScanData as (
            SELECT [EmpNo]
              FROM [CovidCC].[dbo].[GetThedatas]
              where cast([Update] as date) between '${startDate}' and '${toDate}'
              )
            
            SELECT [employee_number]
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
              FROM [userMaster].[dbo].[employee_lists] A full join filterScanData B
              on A.[employee_number] = B.[EmpNo] COLLATE Thai_CI_AS
              where B.[EmpNo] is null`,
        {
          type: QueryTypes.SELECT,
        }
      );
      // res.json({
      //   result: result,
      //   message: constants.kResultOk,
      // });
      res.xls(
        `NoScanReport_${moment(startDate).format("DDMMYYYY")}-${moment(
          toDate
        ).format("DDMMYYYY")}.xlsx`,
        result
      );
    } catch (error) {
      res.json({
        error,
        message: constants.kResultNok,
      });
    }
  }
});

router.post("/TotalCheckIn", async (req, res) => {
  try {
    const { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `with [Bus_checkIn] as (
      SELECT CONVERT(DATE, [Update]) as [Update]
            ,count([EmpNo]) as [Bus_checkIn]
      
        FROM [CovidCC].[dbo].[GetThedatas]
          where substring([Getdata],1,1) = 'B'
        group by CONVERT(DATE, [Update])
        )
        , [Break_checkIn] as (
        SELECT CONVERT(DATE, [Update]) as [Update]
            ,count([EmpNo]) as [Break_checkIn]
      
        FROM [CovidCC].[dbo].[GetThedatas]
          where substring([Getdata],1,1) != 'B'
        group by CONVERT(DATE, [Update])
        )
        select B.[Update] as [checkIn_date] ,[Bus_checkIn],[Break_checkIn] from [Bus_checkIn] A full join [Break_checkIn] B on A.[Update] = B.[Update]
        where B.[update] between convert(date,'` +
      startDate +
      `') and convert(date,'` +
      toDate +
      `')
        order by A.[Update]  , B.[Update] `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/busCheckIn", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `DECLARE @Columns as VARCHAR(MAX)
    SELECT @Columns = COALESCE(@Columns + ', ','') + QUOTENAME([zone_name])
    FROM
       (SELECT [zone_name]
            FROM [CovidCC].[dbo].[bus_zones]
      ) AS temp
    
      print(@Columns)
    /*EXEC*/
    DECLARE @SQL as VARCHAR(MAX)
    SET @SQL = 'With ActionCount as (
    SELECT convert(date,[Update]) as [Update]
        ,B.[zone_name]
      FROM [CovidCC].[dbo].[GetThedatas] A join [CovidCC].[dbo].[bus_zones] B on
      SUBSTRING(A.[Getdata],2,1) = B.[zone_code]
      where SUBSTRING([Getdata],1,1) = ''B'' and ([update] between convert(date,''` +
      startDate +
      `'') and convert(date,''` +
      toDate +
      `''))
    )
    
    SELECT [Update] as [checkIn_date] , ' + @Columns + '
    FROM ActionCount
     PIVOT (count([zone_name]) FOR [zone_name] IN (' + @Columns + ')) AS P 
     order by [Update]'
    
     exec(@SQL)`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/breakCheckIn", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `DECLARE @Columns as VARCHAR(MAX)
      SELECT @Columns = COALESCE(@Columns + ', ','') + QUOTENAME([break_type_name])
      FROM
         (SELECT [break_type_name]
              FROM [CovidCC].[dbo].[break_types]
        ) AS temp
      
        print(@Columns)
      /*EXEC*/
      DECLARE @SQL as VARCHAR(MAX)
      SET @SQL = 'With ActionCount as (
      SELECT convert(date,[Update]) as [Update]
          ,B.[break_type_name]
        FROM [CovidCC].[dbo].[GetThedatas] A join [CovidCC].[dbo].[break_types] B on
        SUBSTRING(A.[Getdata],1,1) = B.[break_type_code]
        where SUBSTRING([Getdata],1,1) != ''B'' and ([update] between convert(date,''` +
      startDate +
      `'') and convert(date,''` +
      toDate +
      `''))
      )
      
      SELECT [Update] as [checkIn_date] , ' + @Columns + '
      FROM ActionCount
       PIVOT (count([break_type_name]) FOR [break_type_name] IN (' + @Columns + ')) AS P 
       order by [Update]'
      
       exec(@SQL)`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/WebRegister", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `with firstRegist as (
        SELECT   [EmpNo] 
              ,  min(CONVERT(date, [Update])) as [fisrtUpdate]
          FROM [CovidCC].[dbo].[GetThedatas]
          group by [EmpNo] 
		  )
		  , checkManDB as (
		  select [EmpNo]  , [fisrtUpdate] from [firstRegist] A join [userMaster].[dbo].[employee_lists] B
		  on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
		  )
          , countMan as (
          select [fisrtUpdate] , count([EmpNo]) as [Man] from checkManDB
          group by [fisrtUpdate]
          
          ) ,accMan as 
          ( 
            select [fisrtUpdate] ,[Man] as [Registers]  ,SUM([Man]) OVER (order by [fisrtUpdate]) as [AccRegisters] 
            from countMan
          )

          select * from [accMan]
          where [fisrtUpdate] between convert(date,'` +
      startDate +
      `') and convert(date,'` +
      toDate +
      `')
          order by [fisrtUpdate]`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/CountRegisterByPlant", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `DECLARE @Columns as VARCHAR(MAX) , @SumOver as VARCHAR(MAX) ,@SumGroup as VARCHAR(MAX) 

      SELECT @Columns = COALESCE(@Columns + ', ','') + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp1
            
      SELECT @SumOver = COALESCE(@SumOver + ', ','') + 'SUM('+ QUOTENAME([PlantCode]) + ') OVER (order by [checkIn_date]) as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp2
      
      SELECT @SumGroup = COALESCE(@SumGroup + ', ','') + 'SUM('+ QUOTENAME([PlantCode]) + ') as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp3
      
      
      DECLARE @SQL as VARCHAR(MAX)
            SET @SQL = 'with firstRegist as (
      SELECT [EmpNo] ,
        min(CONVERT(date, [Update])) as [fisrtUpdate]
      FROM [CovidCC].[dbo].[GetThedatas]
      where [Update] between convert(date,''` +
      startDate +
      `'') and 
      convert(date,''` +
      toDate +
      `'')
      group by [EmpNo] 
      ) 
      , firstRegistByDiv as (
      select [fisrtUpdate] , 
        B.[divisionCode] ,
        C.[PlantCode]
      from [firstRegist] A join [userMaster].[dbo].[employee_lists] B 
      on A.[EmpNo] = B.[employee_number]  COLLATE Thai_CI_AS
      join [userMaster].[dbo].[divison_masters] C
      on B.[divisionCode] = C.[divisionCode]
      )
      , pivotFirstRegist as (
      SELECT [fisrtUpdate] as [checkIn_date] , '+ @Columns + '
      FROM [firstRegistByDiv]
      PIVOT (count([PlantCode]) FOR [PlantCode] IN ('+ @Columns + ')) AS P 
      )
      ,sumGroupRegister as (
      select [checkIn_date] , ' + @SumGroup + '
      from [pivotFirstRegist]
      group by [checkIn_date]
      )
      select [checkIn_date] , '+ @SumOver + '
      from [sumGroupRegister]
      order by [checkIn_date]'
      
      execute(@SQL)`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/PercentRegisterByPlant", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `DECLARE @Columns as VARCHAR(MAX) ,
      @SumOver as VARCHAR(MAX) ,
      @SumGroup as VARCHAR(MAX) ,
      @ColumnsIsNull as VARCHAR(MAX) ,
      @fomulaByPlant as VARCHAR(MAX) ,
      @sumTotalPlant as VARCHAR(MAX) 
      
      SELECT @Columns = COALESCE(@Columns + ', ','') + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp1
            
      SELECT @SumOver = COALESCE(@SumOver + ', ','') + 'SUM('+ QUOTENAME([PlantCode]) + ') OVER (order by [checkIn_date]) as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp2
      
      SELECT @SumGroup = COALESCE(@SumGroup + ', ','') + 'SUM('+ QUOTENAME([PlantCode]) + ') as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp3
      
      SELECT @ColumnsIsNull = COALESCE(@ColumnsIsNull + ', ','') + 'isnull(' + QUOTENAME([PlantCode]) + ',0) as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp4
      
      SELECT @sumTotalPlant = COALESCE(@sumTotalPlant + '+ ','') + 'isnull(' + QUOTENAME([PlantCode]) + ',0)'
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp5
      
      SELECT @fomulaByPlant = COALESCE(@fomulaByPlant + ', ','') + 
      'CAST(isnull(( CAST(A.' + QUOTENAME([PlantCode]) + 
      'AS FLOAT)/ NULLIF(CAST(B.' + QUOTENAME([PlantCode]) +  
      'AS FLOAT),0)),0) * 100 as DECIMAL(18,2) ) as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp6
      
      DECLARE @SQL as VARCHAR(MAX)
            SET @SQL = 'with firstRegist as (
      SELECT [EmpNo] ,
        min(CONVERT(date, [Update])) as [fisrtUpdate]
      FROM [CovidCC].[dbo].[GetThedatas]
      group by [EmpNo] 
      ) 
      , firstRegistByDiv as (
      select [fisrtUpdate] , 
        B.[divisionCode] ,
        C.[PlantCode]
      from [firstRegist] A join [userMaster].[dbo].[employee_lists] B 
      on A.[EmpNo] = B.[employee_number]  COLLATE Thai_CI_AS
      join [userMaster].[dbo].[divison_masters] C
      on B.[divisionCode] = C.[divisionCode]
      )
      , pivotFirstRegist as (
      SELECT [fisrtUpdate] as [checkIn_date] , '+ @Columns + ' , ' + @sumTotalPlant + ' as [Total]
      FROM [firstRegistByDiv]
      PIVOT (count([PlantCode]) FOR [PlantCode] IN ('+ @Columns + ')) AS P 
      )
      ,sumGroupRegister as (
      select [checkIn_date] , sum([Total]) as [Total] ,' + @SumGroup + '
      from [pivotFirstRegist]
      group by [checkIn_date]
      )
      , manPerPlant as (
      SELECT [PlantCode] ,Count(A.[employee_number]) as [Man]
        FROM [userMaster].[dbo].[employee_lists] A join [userMaster].[dbo].[divison_masters] B
        on A.[divisionCode] = B.[divisionCode]
        group by [PlantCode]
        )
      , manPerPlantPivot as (
        SELECT ''key'' as [key] , '+ @ColumnsIsNull + ' , ' + @sumTotalPlant + ' as [Total]
      FROM [manPerPlant]
      PIVOT (sum([Man]) FOR [PlantCode] IN ('+ @Columns + ')) AS Piv
      )
      , sumOver as (
      select ''key'' as [key], SUM([Total]) OVER (order by [checkIn_date]) as [Total], [checkIn_date] , '+ @SumOver + '
      from [sumGroupRegister]
      )
      
      select [checkIn_date] , ' + @fomulaByPlant + ' , CAST(CAST(A.[Total] as FLOAT )/CAST(B.[Total] as FLOAT) * 100 as DECIMAL(18,2)) as [Total]   from [sumOver] A join [manPerPlantPivot] B
      on A.[key] = B.[key]
      where [checkIn_date] between convert(date,''` +
      startDate +
      `'') and 
      convert(date,''` +
      toDate +
      `'')'
      
      execute(@SQL)`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/PercentRegisterByDivision", async (req, res) => {
  try {
    let { plantCode } = req.body;
    let commandPlantCode = "";
    if (plantCode !== "All") {
      commandPlantCode = `where C.[PlantCode] = '${plantCode}'`;
    }

    let result = await qr_covid.sequelize.query(
      `with firstRegist as (
        SELECT distinct  [EmpNo] 
        FROM [CovidCC].[dbo].[GetThedatas]
        )
        , checkEmp as (
        select A.[EmpNo] , C.[divisionName] , C.[divisionCode]
        from [firstRegist] A join [userMaster].[dbo].[employee_lists] B
        on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
        join [userMaster].[dbo].[divison_masters] C on
        B.[divisionCode] = c.[divisionCode]
        ${commandPlantCode}
        )
        , countMan as (
        select  [divisionCode] ,count([EmpNo]) as [Man] 
        from [checkEmp] 
        group by [divisionCode]
        
        )
        , manPerDiv as (
        SELECT A.[divisionCode] , B.[divisionName] ,Count(A.[employee_number]) as [Man]
        FROM [userMaster].[dbo].[employee_lists] A join [userMaster].[dbo].[divison_masters] B
        on A.[divisionCode] = B.[divisionCode]
        group by A.[divisionCode] ,B.[divisionName]
        ) 
        select
        B.[divisionName],
        CAST(CAST(A.[Man] as FLOAT )/CAST(B.[Man] as FLOAT) * 100 as DECIMAL(18,2)) as [Percentage],
        A.[Man] as [ActualMan] , 
        B.[Man] as [TotalMan] 
        from [countMan] A join [manPerDiv] B
        on A.[divisionCode] = B.[divisionCode]
        order by [Percentage] , [TotalMan] desc`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/BusCheckInPercent", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `DECLARE @Columns as VARCHAR(MAX) ,
      @SumOver as VARCHAR(MAX) ,
      @SumGroup as VARCHAR(MAX) ,
      @ColumnsIsNull as VARCHAR(MAX) ,
      @fomulaByPlant as VARCHAR(MAX) ,
      @sumTotalPlant as VARCHAR(MAX) 
        
      SELECT @Columns = COALESCE(@Columns + ', ','') + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp1
  
    SELECT @ColumnsIsNull = COALESCE(@ColumnsIsNull + ', ','') + 'isnull(' + QUOTENAME([PlantCode]) + ',0) as ' + QUOTENAME([PlantCode])
        FROM
            (SELECT distinct [PlantCode]
                FROM [userMaster].[dbo].[divison_masters]
        ) AS temp4

    SELECT @sumTotalPlant = COALESCE(@sumTotalPlant + '+ ','') + 'isnull(' + QUOTENAME([PlantCode]) + ',0)'
    FROM
        (SELECT distinct [PlantCode]
            FROM [userMaster].[dbo].[divison_masters]
    ) AS temp5

    SELECT @fomulaByPlant = COALESCE(@fomulaByPlant + ', ','') + 
      'CAST(isnull(( CAST(A.' + QUOTENAME([PlantCode]) + 
      'AS FLOAT)/ NULLIF(CAST(B.' + QUOTENAME([PlantCode]) +  
      'AS FLOAT),0)),0) * 100 as DECIMAL(18,2) ) as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
    ) AS temp6
  
    DECLARE @SQL as VARCHAR(MAX)
      SET @SQL = '
    with manCheckIn as (
    SELECT  convert(date,[Update]) as [Record_date]
    ,count(distinct [EmpNo]) as [Man]
    ,C.[PlantCode]
    FROM [CovidCC].[dbo].[GetThedatas] A join [userMaster].[dbo].[employee_lists] B
    on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
    join [userMaster].[dbo].[divison_masters] C
    on B.[divisionCode] = C.[divisionCode]
    where SUBSTRING([getdata],1,1) = ''B'' and [Update] between convert(date,
      ''${startDate}'') and convert(date,''${toDate}'')
    group by convert(date,[Update]) , C.[PlantCode]
    )
    , checkInPerPlant as (
    SELECT [Record_date] , '+ @ColumnsIsNull + ', ' + @sumTotalPlant + ' as [Total]
      FROM [manCheckIn]
      PIVOT (sum([Man]) FOR [PlantCode] IN ('+ @Columns + ')) AS P 
    )
  
    , manPerPlant as (
      SELECT convert(Date,[inputDate]) as [AccShift_Date] ,C.[PlantCode] ,Count(B.[employee_number]) as [Man]
      FROM  [CovidCC].[dbo].[accual_shifts]  A join [userMaster].[dbo].[employee_lists] B
      on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
    join [userMaster].[dbo].[divison_masters] C  
    on B.[divisionCode] = C.[divisionCode] COLLATE Thai_CI_AS
    where [bus_line] != ''999'' and [inputDate] between convert(date,
      ''${startDate}'') and convert(date,''${toDate}'')
      group by [PlantCode] , convert(Date,[inputDate])
    
      )
      , manPerPlantPivot as (
      SELECT [AccShift_Date] ,'+ @Columns + ', ' + @sumTotalPlant + ' as [Total]
      FROM [manPerPlant]
      PIVOT (sum([Man]) FOR [PlantCode] IN ('+ @Columns + ')) AS Piv
      )
  
    select A.[Record_date],'+ @fomulaByPlant + ' , CAST(CAST(A.[Total] as FLOAT )/CAST(B.[Total] as FLOAT) * 100 as DECIMAL(18,2)) as [Total]
    from checkInPerPlant A join manPerPlantPivot B
    on  A.[Record_date] = B.[AccShift_Date] '
  
    exec(@SQL)`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/BreakCheckInPercent", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `DECLARE @Columns as VARCHAR(MAX) ,
      @SumOver as VARCHAR(MAX) ,
      @SumGroup as VARCHAR(MAX) ,
      @ColumnsIsNull as VARCHAR(MAX) ,
      @fomulaByPlant as VARCHAR(MAX) ,
      @sumTotalPlant as VARCHAR(MAX) 
        
      SELECT @Columns = COALESCE(@Columns + ', ','') + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
      ) AS temp1
  
    SELECT @ColumnsIsNull = COALESCE(@ColumnsIsNull + ', ','') + 'isnull(' + QUOTENAME([PlantCode]) + ',0) as ' + QUOTENAME([PlantCode])
        FROM
            (SELECT distinct [PlantCode]
                FROM [userMaster].[dbo].[divison_masters]
        ) AS temp4

    SELECT @sumTotalPlant = COALESCE(@sumTotalPlant + '+ ','') + 'isnull(' + QUOTENAME([PlantCode]) + ',0)'
    FROM
        (SELECT distinct [PlantCode]
            FROM [userMaster].[dbo].[divison_masters]
    ) AS temp5

    SELECT @fomulaByPlant = COALESCE(@fomulaByPlant + ', ','') + 
      'CAST(isnull(( CAST(A.' + QUOTENAME([PlantCode]) + 
      'AS FLOAT)/ NULLIF(CAST(B.' + QUOTENAME([PlantCode]) +  
      'AS FLOAT),0)),0) * 100 as DECIMAL(18,2) ) as ' + QUOTENAME([PlantCode])
      FROM
          (SELECT distinct [PlantCode]
              FROM [userMaster].[dbo].[divison_masters]
    ) AS temp6
  
    DECLARE @SQL as VARCHAR(MAX)
      SET @SQL = '
    with manCheckIn as (
    SELECT  convert(date,[Update]) as [Record_date]
    ,count(distinct [EmpNo]) as [Man]
    ,C.[PlantCode]
    FROM [CovidCC].[dbo].[GetThedatas] A join [userMaster].[dbo].[employee_lists] B
    on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
    join [userMaster].[dbo].[divison_masters] C
    on B.[divisionCode] = C.[divisionCode]
    where SUBSTRING([getdata],1,1) != ''B'' and [Update] between convert(date,
      ''${startDate}'') and convert(date,''${toDate}'')
    group by convert(date,[Update]) , C.[PlantCode]
    )
    , checkInPerPlant as (
    SELECT [Record_date] , '+ @ColumnsIsNull + ', ' + @sumTotalPlant + ' as [Total]
      FROM [manCheckIn]
      PIVOT (sum([Man]) FOR [PlantCode] IN ('+ @Columns + ')) AS P 
    )
  
    , manPerPlant as (
      SELECT convert(Date,[inputDate]) as [AccShift_Date] ,C.[PlantCode] ,Count(B.[employee_number]) as [Man]
      FROM  [CovidCC].[dbo].[accual_shifts]  A join [userMaster].[dbo].[employee_lists] B
      on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
    join [userMaster].[dbo].[divison_masters] C  
    on B.[divisionCode] = C.[divisionCode] COLLATE Thai_CI_AS
    where [inputDate] between convert(date,
      ''${startDate}'') and convert(date,''${toDate}'')
      group by [PlantCode] , convert(Date,[inputDate])
    
      )
      , manPerPlantPivot as (
      SELECT [AccShift_Date] ,'+ @Columns + ', ' + @sumTotalPlant + ' as [Total]
      FROM [manPerPlant]
      PIVOT (sum([Man]) FOR [PlantCode] IN ('+ @Columns + ')) AS Piv
      )
  
    select A.[Record_date],'+ @fomulaByPlant + ' , CAST(CAST(A.[Total] as FLOAT )/CAST(B.[Total] as FLOAT) * 100 as DECIMAL(18,2)) as [Total]
    from checkInPerPlant A join manPerPlantPivot B
    on  A.[Record_date] = B.[AccShift_Date] '
  
    exec(@SQL)`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/CheckInPercent", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `with separateType as (
        SELECT convert(date,[Update]) as [Record_date]
          , A.[EmpNo]
          ,iif(SUBSTRING([getdata],1,1) != 'B' , 'Break' , 'Bus') as [Type]
          FROM [CovidCC].[dbo].[GetThedatas] A join [userMaster].[dbo].[employee_lists] B
          on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
          where convert(date,[Update]) between convert(date,
            '${startDate}') and convert(date,'${toDate}')
          )
          , countCheckInType as (
          select [Record_date] , [Type] ,count(distinct [EmpNo])  as Man
          from [separateType]
          group by [Record_date] , [Type] 
        
          )
          , pivotCheckInType as (
          SELECT [Record_date] , isnull([Bus],0) as [Bus] , isnull([Break],0) as [Break]
          FROM countCheckInType
          PIVOT (sum([Man]) FOR [Type] IN ([Bus] , [Break])) AS Piv
          )
          , busManCount as (
          select convert(date,A.[inputDate]) as [inputDate], count(A.[EmpNo]) as [TotalManBus]
          FROM [CovidCC].[dbo].[accual_shifts] A join [userMaster].[dbo].[employee_lists] B
          on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
          where [bus_line] != '999' and convert(date,[inputDate]) between convert(date,
            '${startDate}') and convert(date,'${toDate}')
          group by convert(date,A.[inputDate]) 
          )
          , breakManCount as (
          select convert(date,A.[inputDate]) as [inputDate], count(distinct A.[EmpNo]) as [TotalManBreak]
          FROM [CovidCC].[dbo].[accual_shifts] A join [userMaster].[dbo].[employee_lists] B
          on A.[EmpNo] = B.[employee_number] COLLATE Thai_CI_AS
          Where convert(date,[inputDate]) between convert(date,
            '${startDate}') and convert(date,'${toDate}')
          group by convert(date,A.[inputDate]) 
          ) 
        
          select 
          [Record_date],
          CAST(CAST(A.[Bus] as FLOAT )/CAST(B.[TotalManBus] as FLOAT) * 100 as DECIMAL(18,2)) as [%Bus],
          CAST(CAST(A.[Break] as FLOAT )/CAST(C.[TotalManBreak] as FLOAT) * 100 as DECIMAL(18,2)) as [%Break]
          from [pivotCheckInType] A join [busManCount] B
          on A.[Record_date] = B.[inputDate] 
          join [breakManCount] C on A.[Record_date] = C.[inputDate]
          order by [Record_date]`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.post("/GroupPlant", async (req, res) => {
  try {
    let { startDate, toDate } = req.body;
    let result = await qr_covid.sequelize.query(
      `SELECT distinct [PlantCode]
      FROM [userMaster].[dbo].[divison_masters]`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.get(
  "/trackBreak/empNo=:empNo&alertDate=:alertDate&previousDay=:previousDay&riskTimeMin=:riskTimeMin&riskTimeMax=:riskTimeMax",
  async (req, res) => {
    try {
      let {
        empNo,
        alertDate,
        riskTimeMin,
        riskTimeMax,
        previousDay,
      } = req.params;
      // let startDate = moment(alertDate).add(-previousDay, "days");
      // let toDate = moment(alertDate).add(1, "days");
      let startDate = moment(alertDate)
        .utc()
        .add(-previousDay, "days")
        .format("YYYY-MM-DD");
      let toDate = moment(alertDate).utc().add(1, "days").format("YYYY-MM-DD");

      let infecteddata = await qr_covid.sequelize.query(`SELECT [Update]
      ,[EmpNo]
      ,[Getdata] as [QR_code]
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
  FROM [CovidCC].[dbo].[GetThedatas] A left join [userMaster].[dbo].[employee_lists] B
  on A.[EmpNo] = B.[employee_number] collate Thai_CI_AS
  where ([Update] between '${startDate}' and '${toDate}') and [EmpNo] = '${empNo}' and ([Getdata] NOT LIKE 'B%')
  order by [Update]`);
      let infectedResult = infecteddata[0];
      // console.log(infectedResult);

      let riskResult = [];

      for (let index in infectedResult) {
        let riskStartTime = moment(infectedResult[index].Update)
          .utc()
          .add(-parseInt(riskTimeMin), "hours")
          .format("YYYY-MM-DD HH:mm:ss");
        let riskToTime = moment(infectedResult[index].Update)
          .utc()
          .add(parseInt(riskTimeMax), "hours")
          .format("YYYY-MM-DD HH:mm:ss");
        console.log(riskStartTime);

        riskdata = await qr_covid.sequelize.query(`SELECT [Update]
        ,[EmpNo]
        ,[Getdata] as [QR_code]
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
    FROM [CovidCC].[dbo].[GetThedatas] A left join [userMaster].[dbo].[employee_lists] B
    on A.[EmpNo] = B.[employee_number] collate Thai_CI_AS
    where ([Update] between '${riskStartTime}' and '${riskToTime}') 
    and [EmpNo] != '${empNo}' and [Getdata] = '${infectedResult[index].QR_code}'
    order by [Update]`);
        // console.log(riskdata);
        riskPeople = riskdata[0];

        if (riskPeople.length > 0) {
          for (let riskIndex in riskPeople) {
            riskResult.push(riskPeople[riskIndex]);
          }
        }
      }

      console.log(empNo);
      console.log(alertDate);
      console.log(riskTimeMin);
      console.log(riskTimeMax);
      console.log(previousDay);

      res.json({
        riskResult,
        infectedResult,
        message: constants.kResultOk,
      });
    } catch (error) {
      console.log(error);
      res.json({
        error,
        message: constants.kResultNok,
      });
    }
  }
);

router.post("/temperatureContinueCheck", async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      console.log("error : " + JSON.stringify(error));
      console.log("Fields : " + JSON.stringify(fields));
      console.log("Files : " + JSON.stringify(files));

      CSVToJSON()
        .fromFile(files.file.path)
        .then(async (jsonObj) => {
          exportJSON = [];

          for (let index = 0; index < jsonObj.length; index++) {
            let leaveDate = moment(
              jsonObj[index].leaveDate.substring(6, 11) +
              "-" +
              jsonObj[index].leaveDate.substring(3, 5) +
              "-" +
              jsonObj[index].leaveDate.substring(0, 2)
            ).format("YYYY-MM-DD");
            let scanResult = await qr_covid.sequelize
              .query(`SELECT count(distinct [inputDate]) as [record]
            FROM [CovidCC].[dbo].[body_temperatures]
            where [EmpNo] = '${jsonObj[index].Emp}' and [inputDate] between '${leaveDate}' and DATEADD(day,13,'${leaveDate}')`);
            exportJSON.push({
              empNumber: jsonObj[index].Emp,
              leaveDate,
              scanResult: scanResult[0][0].record,
            });
          }
          const csvFields = ["empNumber", "leaveDate", "scanResult"];
          const csvParser = new CsvParser({ csvFields });
          const csvData = csvParser.parse(exportJSON);

          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=tutorials.csv"
          );

          res.status(200).end(csvData);
          // res.json({
          //   result: constants.kResultOk,
          //   exportJSON,
          //   error,
          //   fields,
          //   files,
          //   // jsonObj,
          // });
        });
    });
  } catch (error) {
    console.log(error);
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

module.exports = router;
