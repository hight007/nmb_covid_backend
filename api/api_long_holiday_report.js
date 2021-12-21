const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");
const { QueryTypes } = require("sequelize");
const mailer = require("nodemailer");
const fs = require("fs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const json2xls = require("json2xls");
const moment = require("moment");

//models
const activity_master = require('../model/activity_master');
const long_holiday_date = require('../model/long_holiday_date');
const alert_mail = require("./../model/mail_alert_master");
const division_db = require("./../model/division_master");


router.get("/long_holiday_report/:alert_date/:divisionCode", async (req, res) => {
    try {
        const { alert_date, divisionCode } = req.params;
        var divisionCondition = ''
        if (divisionCode !== 'All') {
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

router.get("/long_holiday_missing/:alert_date/:divisionCode", async (req, res) => {
    try {
        const { alert_date, divisionCode } = req.params;
        var divisionCondition = ''
        if (divisionCode !== 'All') {
            divisionCondition = ` and e.[divisionCode] = '${divisionCode}'`
        }

        const long_holiday_date_count = await long_holiday_date.findAll({ where: { alert_date } })

        let result = await activity_master.sequelize.query(`with tableA as (
SELECT a.[employee_number]
	  ,cast(DATEADD(HOUR,7,a.[activity_date]) as date) as [activity_date]
  FROM [CovidCC].[dbo].[activity_transactions] a
  left join [CovidCC].[dbo].[long_holiday_dates] l
  on  cast(DATEADD(HOUR,7,a.[activity_date]) as date) = cast(l.[long_holiday_date] as date)
  where l.alert_date = '${alert_date}'
  group by a.[employee_number] ,cast(DATEADD(HOUR,7,a.[activity_date]) as date)
  ), TableB as (
  select [employee_number] , count([activity_date]) as [activity_date]
  from tableA
  group by [employee_number]
  )
  select 
  isnull(b.activity_date , 0) as [activity date count]
	  ,e.[employee_number]
	  ,e.[employee_name]
	  ,e.[employee_type]
	  ,d.[divisionName]
	  ,e.[sectionCode]
	  ,e.[processCode]
	  ,p.[PlantName]
  from TableB b right join  [userMaster].[dbo].[all_employee_lists] e
  on e.employee_number = b.employee_number COLLATE Thai_CI_AS
  join [userMaster].[dbo].[divison_masters] d 
  on e.[divisionCode] = d.[divisionCode]
  join [userMaster].[dbo].[plant_masters] p 
  on d.[PlantCode] = p.[PlantCode]
where isnull(b.activity_date , 0) < ${long_holiday_date_count.length} ${divisionCondition}`,
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
})

router.get("/alert_long_holiday/:alert_date", async (req, res) => {
    try {
        const { alert_date } = req.params;
        const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
        const long_holiday_date_count = await long_holiday_date.findAll({ where: { alert_date } })
        console.log(long_holiday_date_count.length);

        const alarmDivision = await alert_mail.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('divisionCode')), 'divisionCode'],
            ]
        })
        const testDivision = ['424Z', '424K', '43DM']
        // alarmDivision.length
        for (let index = 0; index < testDivision.length; index++) {
            // const divisionCode = alarmDivision[index].divisionCode;
            const divisionCode = testDivision[index];

            //get email
            var toEmail = await getDivsionMailAlert(divisionCode)

            //get division name
            const divisionName = await division_db.findOne({ where: { divisionCode } })

            //get data by div
            const resultMissing = await activity_master.sequelize.query(`with tableA as (
SELECT a.[employee_number]
	  ,cast(DATEADD(HOUR,7,a.[activity_date]) as date) as [activity_date]
  FROM [CovidCC].[dbo].[activity_transactions] a
  left join [CovidCC].[dbo].[long_holiday_dates] l
  on  cast(DATEADD(HOUR,7,a.[activity_date]) as date) = cast(l.[long_holiday_date] as date)
  where l.alert_date = '${alert_date}'
  group by a.[employee_number] ,cast(DATEADD(HOUR,7,a.[activity_date]) as date)
  ), TableB as (
  select [employee_number] , count([activity_date]) as [activity_date]
  from tableA
  group by [employee_number]
  )
  select 
  isnull(b.activity_date , 0) as [activity date count]
	  ,e.[employee_number]
	  ,e.[employee_name]
	  ,e.[employee_type]
	  ,d.[divisionName]
	  ,e.[sectionCode]
	  ,e.[processCode]
	  ,p.[PlantName]
  from TableB b right join  [userMaster].[dbo].[all_employee_lists] e
  on e.employee_number = b.employee_number COLLATE Thai_CI_AS
  join [userMaster].[dbo].[divison_masters] d 
  on e.[divisionCode] = d.[divisionCode]
  join [userMaster].[dbo].[plant_masters] p 
  on d.[PlantCode] = p.[PlantCode]
where isnull(b.activity_date , 0) < ${long_holiday_date_count.length} and e.[divisionCode] = '${divisionCode}'`,
                {
                    type: QueryTypes.SELECT,
                })

            const resultATK = await activity_master.sequelize.query(`SELECT distinct a.[employee_number]
	  ,e.[employee_name]
	  ,e.[employee_type]
	  ,d.[divisionName]
	  ,e.[sectionCode]
	  ,e.[processCode]
	  ,p.[PlantName]
  FROM [CovidCC].[dbo].[activity_transactions] a
  left join [CovidCC].[dbo].[long_holiday_dates] l
  on  cast(DATEADD(HOUR,7,a.[activity_date]) as date) = cast(l.[long_holiday_date] as date)
  right join  [userMaster].[dbo].[all_employee_lists] e
  on e.employee_number = a.employee_number COLLATE Thai_CI_AS
  join [userMaster].[dbo].[divison_masters] d 
  on e.[divisionCode] = d.[divisionCode]
  join [userMaster].[dbo].[plant_masters] p 
  on d.[PlantCode] = p.[PlantCode]
  where [risk] = 1 and l.alert_date = '${alert_date}' and e.[divisionCode] = '${divisionCode}'`,
                {
                    type: QueryTypes.SELECT,
                })

            //excel
            const excelFilePathMissing = `files/Doc/LongHolidayMissing_${divisionCode}.xlsx`;
            const excelFilePathATK = `files/Doc/LongHolidayATK_${divisionCode}.xlsx`;

            let xlsMissing = await json2xls(resultMissing)
            let xlsATK = await json2xls(resultATK)

            await fs.writeFileSync(excelFilePathMissing, xlsMissing, "binary");
            await fs.writeFileSync(excelFilePathATK, xlsATK, "binary");

            //email
            var smtp = {
                host: "email-smtp.us-east-1.amazonaws.com", //set to your host name or ip
                port: 465, //25, 465, 587 depend on your
                // secure: true, // use SSL
                auth: {
                    user: "AKIA5CPB5AWUSL2F2LPT", //user account
                    pass: "BDBxQl6mPXBgYwlMvYDHKdmKSXpTCAG4oGfrpetO15ib", //user password
                },
            };

            //send email
            var smtpTransport = await mailer.createTransport(smtp);
            var mail = {
                from: "Minebeacovid19_th 📧<micnmb@gmail.com>", //from email (option)
                to: ['hight_007@hotmail.com', 'pensri.k@minebea.co.th'], //to email (require) toEmail[0][0].email
                // bcc: [
                //   "hight_007@hotmail.com",
                //   "tarin.n@minebea.co.th",
                // ],
                // cc: "hight_007@hotmail.com,tarin.n@minebea.co.th",
                subject: `⚠ Long holiday ATK result ${divisionName.divisionName}`, //subject
                html: `
                <h3>Long holiday alarm missing/risk activity (auto alert email)</h3>
                <p>Division : ${divisionName.divisionName}</p>
                <p>man missing : ${resultMissing.length}</p>
                <p>man risk : ${resultATK.length}</p>
                <p>⚠This is auto alarm email , please do not reply</p>`, //email body
                attachments: [
                    {
                        filename:
                            "Missing Long holiday " +
                            moment(alert_date).format('YYYY-MM-DD') + '_' + divisionCode +
                            ".xlsx",
                        content: fs.createReadStream(excelFilePathMissing),
                    },
                    {
                        filename:
                            "need ATK Long holiday " +
                            moment(alert_date).format('YYYY-MM-DD') + '_' + divisionCode +
                            ".xlsx",
                        content: fs.createReadStream(excelFilePathATK),
                    },
                ],
            };

            await smtpTransport.sendMail(mail, function (error, _response) {
                smtpTransport.close();
                if (error) {
                    console.log("error send email : " + error);
                    sendErrorEmailToAdmin(
                        "error send email : " + error,
                        item.divisionCode + " " + item.divisionName
                    );
                } else {
                    //send success
                    console.log(
                        "send email division : " +
                        item.divisionCode +
                        " shift : " +
                        shift +
                        " success"
                    );
                    try {
                        success_alarm.create({
                            divisionCode: item.divisionCode,
                            shift: shift,
                            AlarmDate: dateAlarm,
                            missingCount: dataMissing[0].length,
                            overCount: dataOverTemp[0].length,
                        });
                    } catch (error) {
                        sendErrorEmailToAdmin(
                            "record result error : " + error,
                            item.divisionCode + " " + item.divisionName
                        );
                    }
                }
            });

            await waitFor(300);

            await fs.unlinkSync(excelFilePathMissing)
            await fs.unlinkSync(excelFilePathATK)
        }

        res.json({ alarmDivision })
    } catch (error) {
        console.log(error);
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
})

getDivsionMailAlert = async (divisionCode) => {
    var emails = []
    var result = await alert_mail.sequelize.query(`SELECT [email]
  FROM [CovidCC].[dbo].[alert_mails]
  where [divisionCode] = '${divisionCode}'`,
        {
            type: QueryTypes.SELECT,
        });
    for (let index = 0; index < result.length; index++) {
        const email = result[index].email;
        emails.push(email)
    }
    return emails;
};

module.exports = router;
