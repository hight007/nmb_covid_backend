const express = require("express");
const router = express.Router();
const CSVToJSON = require("csvtojson");
const path = require("path");
const constants = require("./../constant/constant");

const emp_master = require("./../model/employee_master");
const acc_shift = require("./../model/accual_shift");
const all_emp_master = require("./../model/all_emp_master");

const Client = require("ftp");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");

router.get("/importEmpMasterCSV", async (req, res) => {
  try {
    var filePath = path.resolve(__dirname, "./../files/Doc/Shd_Shift.csv");
    console.log(filePath);
    CSVToJSON()
      .fromFile(filePath)
      .then((data) => {
        delete all;
        emp_master.destroy({
          where: {},
        });
        data.forEach(async (item) => {
          try {
            await emp_master.create({
              employee_number: item.EMP_NO,
              place: item.PLACE,
              divisionCode: item.COMPANY + item.DIVISION,
              sectionCode: item.SECTION,
              processCode: item.PROCESS,
              employee_name: item.EMP_NAME,
              employee_sex: item.SEX,
              schedule_shift: item.SCH_SHIFT,
              bus_line: item.BUS_LINE,
              employee_type: item.EMP_TYPE,
            });
          } catch (error) {
            console.log(error);
          }
        });
        // emp_master.create(listData);
        res.json({
          result: "OK",
          message: constants.kResultOk,
        });
      })
      .catch((err) => {
        res.json({
          error: JSON.stringify(err),
          message: constants.kResultNok,
        });
        console.log(err);
        return;
      });
  } catch (error) {
    res.json({
      error: error,
      message: constants.kResultNok,
    });
  }
});

router.get("/importEmpMasterCSV_FTP", async (req, res) => {
  var hostName = "180.222.148.107";
  var userName = "AWS01";
  var password = "TfDPcCgg";
  var fileName = "Sch_Shift.csv";

  var c = new Client((timeout = 3000000));

  try {
    await c.connect({ host: hostName, user: userName, password: password });
    c.on("ready", function () {
      c.get(fileName, function (err, stream) {
        if (err) {
          res.json({
            error: err,
            message: constants.kResultNok,
          });
          return;
        }
        stream.once("close", function () {
          c.end();
          console.log("finish");
        });
        CSVToJSON()
          .fromStream(stream)
          .subscribe(async function (item) {
            let process_shift = await item.PROCESS_SHIFT;
            if (
              process_shift === "A" ||
              process_shift === "M" ||
              process_shift === "D"
            ) {
              process_shift = await "AMD";
            } else {
              process_shift = await item.PROCESS_SHIFT;
            }
            let data = await {
              employee_number: item.EMP_NO,
              place: item.PLACE,
              divisionCode: item.COMPANY + item.DIVISION,
              sectionCode: item.SECTION,
              processCode: item.PROCESS,
              section_number: item.SECTION_CODE,
              employee_name: item.EMP_NAME,
              employee_sex: item.SEX,
              schedule_shift: item.SCH_SHIFT,
              bus_line: item.BUS_LINE,
              employee_type: item.EMP_TYPE,
              process_shift: process_shift,
            };
            try {
              await emp_master.create(data);
            } catch (error1) {
              try {
                await emp_master.update(data, {
                  where: { employee_number: data.employee_number },
                });
              } catch (error2) {
                console.log("delete error");
              }
            }
          })
          .then(async () => {
            await emp_master.destroy({
              where: {
                updatedAt: {
                  [Op.lte]: moment().add(-2, "hours").toDate(),
                },
              },
            });
          });
        res.json({
          result: "ok",
          message: constants.kResultOk,
        });
      });
    });
  } catch (error) {
    console.log("error : " + error);
    res.json({
      error: error,
      message: constants.kResultNok,
    });
  }
});

router.get("/importActShift_CSV_FTP", async (req, res) => {
  var hostName = "180.222.148.107";
  var userName = "AWS01";
  var password = "TfDPcCgg";
  var fileName = "Act_Shift.csv";

  var c = new Client((timeout = 3000000));

  try {
    await c.connect({ host: hostName, user: userName, password: password });
    c.on("ready", function () {
      c.get(fileName, function (err, stream) {
        if (err) {
          res.json({
            error: err,
            message: constants.kResultNok,
          });
          return;
        }
        stream.once("close", function () {
          c.end();
          console.log("finish");
        });
        CSVToJSON()
          .fromStream(stream)
          .subscribe(async function (item) {
            let itemDate = Date.parse(
              item.Date.substr(0, 4) +
                "-" +
                item.Date.substr(4, 2) +
                "-" +
                item.Date.substr(6, 2)
            );
            let data = {
              EmpNo: item.EMP_NO,
              accual_shift: item.ACT_SHIFT,
              inputDate: itemDate,
            };
            try {
              await acc_shift.create(data);
            } catch (error1) {
              try {
                await acc_shift.update(data, {
                  where: { EmpNo: data.EMP_NO, inputDate: itemDate },
                });
              } catch (error2) {}
            }
          })
          .then(async () => {
            res.json({
              result: "ok",
              message: constants.kResultOk,
            });
          });
      });
    });
  } catch (error) {
    console.log(error);
    res.json({
      error: error,
      message: constants.kResultNok,
    });
  }
});

router.get("/importVaccine_CSV_FTP", async (req, res) => {
  var hostName = "180.222.148.107";
  var userName = "AWS01";
  var password = "TfDPcCgg";
  var fileName = "Vaccine.csv";

  var c = new Client((timeout = 3000000));

  try {
    await c.connect({ host: hostName, user: userName, password: password });
    c.on("ready", function () {
      c.get(fileName, function (err, stream) {
        if (err) {
          res.json({
            error: err,
            message: constants.kResultNok,
          });
          return;
        }
        stream.once("close", function () {
          c.end();
          console.log("finish");
        });
        CSVToJSON()
          .fromStream(stream)
          .subscribe(async function (item) {
            let data = await {
              employee_number: item.EMP_NO,
              place: item.PLACE,
              divisionCode: item.COMPANY + item.DIVISION,
              sectionCode: item.SECTION,
              processCode: item.PROCESS,
              employee_name: item.EMP_NAME,
              employee_type: item.EMP_TYPE,
            };
            try {
              await all_emp_master.create(data);
            } catch (error1) {
              try {
                await all_emp_master.update(data, {
                  where: { employee_number: data.employee_number },
                });
              } catch (error2) {
                console.log(error2);
              }
            }
          })
          .then(async () => {
            res.json({
              result: "ok",
              message: constants.kResultOk,
            });
          });
      });
    });
  } catch (error) {
    console.log(error);
    res.json({
      error: error,
      message: constants.kResultNok,
    });
  }
});

module.exports = router;
