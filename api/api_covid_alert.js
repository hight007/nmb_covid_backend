const express = require("express");
const router = express.Router();
const mailer = require("nodemailer");
const constants = require("./../constant/constant");
const axios = require("axios");
const body_temperature = require("../model/body_temperature");
const converter = require("json-2-csv");
const alert_mail = require("./../model/mail_alert_master");
const fs = require("fs");
const path = require("path");
const json2xls = require("json2xls");
const success_alarm = require("./../model/success_alarm");

router.get("/testAxios", async (req, res) => {
  axios
    .get("http://54.255.187.109:2009/api/v1/manage_user/user")
    .then((response) => {
      console.log(`statusCode: ${response.status}`);
      console.log(response.data);
      res.json({
        result: response.data,
      });
    })
    .catch((error) => {
      console.error(error);
      res.json({
        error,
      });
    });
});

router.get("/testErrorMail", async (req, res) => {
  try {
    sendErrorEmailToAdmin("error", "46R6");
    res.json({
      api_result: constants.kResultOk,
    });
  } catch (error) {
    console.error(error);
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.get("/alarmCovid_excel/:shift", async (req, res) => {
  try {
    const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
    const { shift } = req.params;
    const dateAlarm = formatDate(new Date());
    let AlarmDivision = await getAlarmDivision(dateAlarm, shift);
    for (let index = 0; index < AlarmDivision[0].length; index++) {
      let item = AlarmDivision[0][index];
      //Missing alert

      try {
        let toEmail = await getDivsionMailAlert(item.divisionCode);

        var excelFilePathMissing = `files/Doc/Missing_${item.divisionCode}_shift_${shift}.xlsx`;
        var excelFilePathOver = `files/Doc/Over_${item.divisionCode}_shift_${shift}.xlsx`;

        let dataMissing = await getMissingByDiv(
          item.divisionCode,
          dateAlarm,
          shift
        );

        console.log('missing ok');

        let dataOverTemp = await getOverTempByDiv(
          item.divisionCode,
          dateAlarm,
          shift
        );

        let xlsMissing = await json2xls(dataMissing[0]);
        let xlsOver = await json2xls(dataOverTemp[0]);
        // let xlsMissing = await ;
        await fs.writeFileSync(excelFilePathMissing, xlsMissing, "binary");
        await fs.writeFileSync(excelFilePathOver, xlsOver, "binary");

        await waitFor(300);

        // console.log(toEmail);
        var smtp = {
          host: "email-smtp.us-east-1.amazonaws.com", //set to your host name or ip
          port: 465, //25, 465, 587 depend on your
          // secure: true, // use SSL
          auth: {
            user: "AKIA5CPB5AWUSL2F2LPT", //user account
            pass: "BDBxQl6mPXBgYwlMvYDHKdmKSXpTCAG4oGfrpetO15ib", //user password
          },
        };

        // send email
        var smtpTransport = await mailer.createTransport(smtp);
        var mail = {
          from: "Minebeacovid19_th 📧<micnmb@gmail.com>", //from email (option)
          to: toEmail, //to email (require) toEmail[0][0].email
          to: '',
          // bcc: [
          //   "hight_007@hotmail.com",
          //   "tarin.n@minebea.co.th",
          // ],
          // cc: "hight_007@hotmail.com,tarin.n@minebea.co.th",
          subject: `⚠ Covid 19 alarm missing/over temperature (shift : ${shift} ,Divsion : ${item.divisionName})`, //subject
          html: `<h3>⚠ Covid 19 alarm missing/over temperature (auto alert email)</h3>
      <p>Division : ${item.divisionName}</p>
      <p>Shift :${shift}</p>
      <p>Alarm date : ${dateAlarm}</p>
      <p>man missing : ${dataMissing[0].length}</p>
      <p>man over temperature : ${dataOverTemp[0].length}</p>
      <p>⚠This is auto alarm email , please do not reply</p>`, //email body
          attachments: [
            {
              filename:
                "Covid_missing_check_on_" +
                dateAlarm +
                "_shift_" +
                shift +
                ".xlsx",
              content: fs.createReadStream(excelFilePathMissing),
            },
            {
              filename:
                "Covid_over_temperature_check_on_" +
                dateAlarm +
                "_shift_" +
                shift +
                ".xlsx",
              content: fs.createReadStream(excelFilePathOver),
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

        delete file
        await fs.unlink(excelFilePathMissing, function (err) {
          if (err) return console.log(err);
          console.log(
            "file missing deleted successfully , division : " +
              item.divisionCode +
              " , shift : " +
              shift
          );
        });
        await fs.unlink(excelFilePathOver, function (err) {
          if (err) return console.log(err);
          console.log(
            "file over deleted successfully , division : " +
              item.divisionCode +
              " , shift : " +
              shift
          );
        });
      } catch (error) {
        console.log("error : " + error);
        sendErrorEmailToAdmin(
          "error : " + error,
          item.divisionCode + " " + item.divisionName
        );
      }
    }

    res.json({
      message: constants.kResultOk,
    });
  } catch (error) {
    sendErrorEmailToAdmin("error all : " + error, "all" + " " + "all");
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.get("/alarmCovid_test", async (req, res) => {
  try {
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
      to: "nmbtracking_sys_bp@minebea.co.th", //to email (require) toEmail[0][0].email
      bcc: ["hight_007@hotmail.com"],
      // cc: "hight_007@hotmail.com,tarin.n@minebea.co.th",
      subject: `⚠ Covid 19 alarm missing/over temperature (shift : test ,Divsion : test)`, //subject
      html: `<h3>⚠ Covid 19 alarm missing/over temperature (auto alert email)</h3>
      <p>Division : test</p>
      <p>Shift :test</p>
      <p>Alarm date : test</p>
      <p>man missing : test</p>
      <p>man over temperature : test</p>
      <p>⚠This is auto alarm email , please do not reply</p>`, //email body
    };

    await smtpTransport.sendMail(mail, function (error, _response) {
      smtpTransport.close();
      if (error) {
        console.log("error send email : " + error);
      } else {
        console.log("send email test");
      }
    });

    res.json({
      message: constants.kResultOk,
    });
  } catch (error) {
    sendErrorEmailToAdmin("error all : " + error, "all" + " " + "all");
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

getAlarmDivision = (date, shift) => {
  let result = alert_mail.sequelize.query(`  with listmissingCheck as (
    SELECT [EmpNo]
      ,convert(date,[createdAt]) as [UpdateDate]
    FROM [CovidCC].[dbo].[body_temperatures] 
    where convert(date,DATEADD(hh,7,[createdAt]))  = convert(date,'${date}')
    ) 
    , missingDiv as (
    SELECT [divisionCode] 
    FROM [userMaster].[dbo].[employee_lists] A left join listmissingCheck B 
    on A.[employee_number] = B.[EmpNo] COLLATE Thai_CI_AS
    where [EmpNo] is NULL and [process_shift] = '${shift}'
    group by [divisionCode]
    ) 
    , listOverTemp as (
    SELECT [EmpNo]
      ,convert(date,[createdAt]) as [UpdateDate]
    FROM [CovidCC].[dbo].[body_temperatures] 
    where [body_temperature] >= 37.5 and convert(date,DATEADD(hh,7,[createdAt])) = convert(date,'${date}')
    ) 
    , divisionOverTemp as (
      SELECT [divisionCode] 
      FROM [userMaster].[dbo].[employee_lists] A join listOverTemp B 
      on A.[employee_number] = B.[EmpNo] COLLATE Thai_CI_AS
      where [process_shift] = '${shift}'
      group by [divisionCode]
    ) 
	, unionAllAlertDivision as (
    select * from missingDiv union select * from divisionOverTemp
	) 
	select A.[divisionCode],B.[divisionName] from unionAllAlertDivision A join [userMaster].[dbo].[divison_masters] B
	on A.[divisionCode] = B.[divisionCode]`);
  return result;
};

getMissingByDiv = (divisionCode, date, shift) => {
  let result = body_temperature.sequelize.query(`with listTempCheck as (
    SELECT *
      FROM [CovidCC].[dbo].[body_temperatures] 
      where convert(date,DATEADD(hh,7,[createdAt])) = convert(date,'${date}')
      )
      SELECT A.[employee_number] , 
      A.[employee_name] ,
      A.[employee_sex], 
      A.[divisionCode] , 
      A.[sectionCode] as [sectionName] ,
      A.[section_number] as [sectionCode],
      A.[processCode] , 
      A.[schedule_shift] , 
      A.[process_shift],
      A.[employee_type]
      FROM [userMaster].[dbo].[employee_lists] A left join listTempCheck B 
      on A.[employee_number] = B.[EmpNo]   COLLATE Thai_CI_AS 
      where  A.[divisionCode] in( '${divisionCode}') and [EmpNo] is NULL and [process_shift] = '${shift}'`);
  return result;
};

getOverTempByDiv = (divisionCode, date, shift) => {
  let result = body_temperature.sequelize.query(`with listmissingCheck as (
    SELECT [EmpNo] , [body_temperature] , [createdAt]
      ,[updatedAt]
    FROM [CovidCC].[dbo].[body_temperatures] 
    where [body_temperature] >= 37.5 and convert(date,DATEADD(hh,7,[createdAt])) = convert(date,'${date}')
    )
    , missingDiv as (
    SELECT A.[employee_number] 
	  ,[body_temperature] 
	  ,[employee_name] 
	  ,[divisionCode]
      ,[sectionCode]
      ,[processCode]
      ,[employee_sex]
      ,[schedule_shift]
      ,[process_shift]
      ,[employee_type]
	    ,B.[createdAt]
      ,B.[updatedAt]
    FROM [userMaster].[dbo].[employee_lists] A join listmissingCheck B 
    on A.[employee_number] = B.[EmpNo] COLLATE Thai_CI_AS
	where [divisionCode] = '${divisionCode}' and [process_shift] = '${shift}'
    )
	select * from missingDiv`);
  return result;
};

getDivsionMailAlert = (divisionCode) => {
  let result = body_temperature.sequelize.query(`SELECT [email]
  FROM [CovidCC].[dbo].[alert_mails]
  where [divisionCode] = '${divisionCode}'`);
  return result;
};

formatDate = (date) => {
  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
    "-" +
    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate())
  );
};

sendErrorEmailToAdmin = async (MyError, divisionName) => {
  try {
    var smtp = {
      host: "email-smtp.us-east-1.amazonaws.com", //set to your host name or ip
      port: 465, //25, 465, 587 depend on your
      // secure: true, // use SSL
      auth: {
        user: "AKIA5CPB5AWUSL2F2LPT", //user account
        pass: "BDBxQl6mPXBgYwlMvYDHKdmKSXpTCAG4oGfrpetO15ib", //user password
      },
    };

    var smtpTransport = await mailer.createTransport(smtp);
    var mail = {
      from: "admin_error_alarm 📧<micnmb@gmail.com>", //from email (option)
      to: "hight_007@hotmail.com,tarin.n@minebea.co.th", //to email (require) toEmail[0][0].email
      // bcc: ["hight_007@hotmail.com"],
      // cc: "hight_007@hotmail.com,tarin.n@minebea.co.th",
      subject: `⚠ auto email error Divsion : ${divisionName}`, //subject
      html: `<h3>⚠ auto email error Divsion : ${divisionName}</h3>
      <p>${MyError}</p>`, //email body
    };
    await smtpTransport.sendMail(mail, function (error, _response) {
      smtpTransport.close();
      if (error) {
        console.log("error alarm error email : " + error);
      } else {
        console.log("alert error email success");
      }
    });
  } catch (error) {
    console.log("error: " + error);
  }
};

module.exports = router;
