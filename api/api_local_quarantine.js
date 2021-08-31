const express = require("express");
const router = express.Router();
const constants = require("../constant/constant");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const fs = require("fs");
const formidable = require("formidable");
const { Parser } = require('json2csv');
const moment = require('moment')
const path = require('path');

const LineNotify = require("../util/line");
const notifyBP = new LineNotify(`gslSvum34Qr6Zp90tJgSndeX5q6OLJ7PAijQWYFgZtL`);
const notifyLB = new LineNotify(`9BzZm1jPNghfo8S5SRfNTjBKaGhxZ3poNbFj5HUwkd0`);
// 9BzZm1jPNghfo8S5SRfNTjBKaGhxZ3poNbFj5HUwkd0

//models
const local_quanrantine = require("../model/local_quarantine");
const all_emp_master = require("../model/all_emp_master");

router.post("/record", async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    var notify = notifyBP;

    form.parse(req, async (error, fields, files) => {
      console.log("error : " + JSON.stringify(error));
      console.log("Fields : " + JSON.stringify(fields));
      console.log("Files : " + JSON.stringify(files));
      var {
        employee_number,
        temperature,
        oxygen,
        pulse,
        employee_name,
        telephoneNumber,
        plant,
        divisionName,
      } = fields;

      if (plant == "Lopburi") {
        notify = notifyLB;
      }

      var message =
        "แจ้งเตือน! " +
        employee_number +
        " " +
        employee_name +
        " เบอร์ติดต่อ " +
        telephoneNumber +
        " ฝ่าย " +
        divisionName +
        " โรงงาน " +
        plant +
        " ";
      var abnormal = false;

      if (temperature) {
        temperature = parseFloat(temperature);
        if (temperature > 37.5) {
          message += "มีอุณหภูมิร่างกาย " + temperature + "°C ";
          abnormal = true;
        }
      }
      if (oxygen) {
        oxygen = parseFloat(oxygen);
        if (oxygen < 95) {
          message += "มีค่า Oxygen " + oxygen + "% ";
          abnormal = true;
        }
      }
      if (pulse) {
        pulse = parseFloat(pulse);
        if (pulse < 60) {
          message += "มีค่าชีพจร " + pulse + " ครั้งต่อนาที ";
          abnormal = true;
        }
        if (pulse > 120) {
          message += "มีค่าชีพจร " + pulse + " ครั้งต่อนาที ";
          abnormal = true;
        }
      }
      message += "โปรดรีบดำเนินการช่วยเหลือโดยด่วน!!!";

      if (abnormal) {
        var data = {
          employee_number,
          temperature,
          oxygen,
          pulse,
        };

        if (files.file) {
          data.fileData = await fs.readFileSync(files.file.path);
          data.fileType = files.file.type;
        }

        let result = await local_quanrantine.create(data);

        if (files.file) {
          notify.sendImage(
            "http://54.255.187.109:2009/api/v1/local_quarantine/image/" +
            result.id,
            message
          );
          await fs.unlinkSync(files.file.path);
        } else {
          notify.sendSticker(2024, 446, message);
        }
        // notify.sendSticker(2016, 446 , 'เร็วเข้า!!!');
        res.json({
          id: result.id,
          message: constants.kResultOk,
        });
      } else {
        var data = {
          employee_number,
          temperature,
          oxygen,
          pulse,
        };
        //temporary get image data for ai training
        // if (files.file) {
        //   data.fileData = await fs.readFileSync(files.file.path);
        //   data.fileType = files.file.type;
        // }

        let result = await local_quanrantine.create(data);

        //temporary get image data for ai training
        // if (files.file) {
        //   await fs.unlinkSync(files.file.path);
        // }

        res.json({
          id: result.id,
          message: constants.kResultOk,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    console.log("get img");
    const { id } = req.params;
    let result = await local_quanrantine.findOne({ where: { id } });
    res.type(result.fileType);
    res.end(result.fileData);
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.get('/report', async (req, res) => {
  try {
    const result = await local_quanrantine.findAll({
      where: {
        updatedAt: {
          [Op.gt]: moment().add(-30, 'days')
        }
      },
      attributes: ['id', 'employee_number', 'temperature', 'oxygen', 'pulse', 'updatedAt'],
    })
    const fields = ['id', 'employee_number', 'temperature', 'oxygen', 'pulse', 'updatedAt'];
    const opts = { fields };

    const parser = new Parser(opts);
    const csv = parser.parse(result);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report.csv"
    );
    res.status(200).end(csv);

  } catch (error) {
    console.log(error);
  }
})

router.get('/export_images/', async (req, res) => {
  try {
    console.log("export images");
    const listImageId = await local_quanrantine.findAll({
      where: { fileData: { [Op.ne]: null } },
      attributes: ['id',],
    }
    )

    listImageId.forEach(async item => {
      const id = item.id
      const imagePath = __dirname + './../files/images/machineLearning/img' + id + '.jpeg'
      const result = await local_quanrantine.findOne({ where: { id }, attributes: ['fileData', 'fileType'], });
      var buf = Buffer.from(result.fileData, 'base64');
      await fs.writeFileSync(imagePath, buf)
    });

    res.json({ listImageId, api_result: constants.kResultOk, })
  } catch (error) {
    console.log(error);
    res.json({
      error,
      api_result: constants.kResultNok,
    });
  }

})

module.exports = router;
