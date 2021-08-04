const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bus_zone = require("./../model/bus_zone_master");
const bus_company = require("./../model/bus_company_master");
const break_area = require("./../model/break_area_master");
const break_type = require("./../model/break_type_master");
const alert_mail = require("./../model/mail_alert_master");

//bus zone
router.get("/bus_zone", async (req, res) => {
  try {
    let result = await bus_zone.findAll({
      order: [["updatedAt", "DESC"]],
    });
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

router.post("/bus_zone", async (req, res) => {
  try {
    let result = await bus_zone.create(req.body);
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

router.put("/bus_zone", async (req, res) => {
  try {
    await bus_zone.update(req.body, {
      where: { zone_code: req.body.zone_code },
    });

    res.json({
      // result ,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.delete("/bus_zone", async (req, res) => {
  try {
    let result = await bus_zone.destroy({
      where: { zone_code: req.body.zone_code },
    });
    res.json({
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

//bus company
router.get("/bus_company", async (req, res) => {
  try {
    let result = await bus_company.findAll({
      order: [["updatedAt", "DESC"]],
    });
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

router.post("/bus_company", async (req, res) => {
  try {
    let result = await bus_company.create(req.body);
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

router.put("/bus_company", async (req, res) => {
  try {
    await bus_company.update(req.body, {
      where: { bus_company_code: req.body.bus_company_code },
    });

    res.json({
      // result ,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.delete("/bus_company", async (req, res) => {
  try {
    let result = await bus_company.destroy({
      where: { bus_company_code: req.body.bus_company_code },
    });
    res.json({
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

//Break area
router.get("/break_area", async (req, res) => {
  try {
    let result = await break_area.findAll({
      order: [["updatedAt", "DESC"]],
    });
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

router.post("/break_area", async (req, res) => {
  try {
    let result = await break_area.create(req.body);
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

router.put("/break_area", async (req, res) => {
  try {
    await break_area.update(req.body, {
      where: { break_area_code: req.body.break_area_code },
    });

    res.json({
      // result ,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.delete("/break_area", async (req, res) => {
  try {
    let result = await break_area.destroy({
      where: { break_area_code: req.body.break_area_code },
    });
    res.json({
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.get("/break_area/keyword/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    let result = await break_area.findAll({
      where: {
        [Op.or]: [
          { break_area_code: { [Op.like]: `%${keyword}%` } },
          { break_area_name: { [Op.like]: `%${keyword}%` } },
          { updateBy: { [Op.like]: `%${keyword}%` } },
        ],
      },
      order: [["updatedAt", "DESC"]],
    });
    res.json({
      message: constants.kResultOk,
      result,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

//Break type
router.get("/break_type", async (req, res) => {
  try {
    let result = await break_type.findAll({
      order: [["updatedAt", "DESC"]],
    });
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

router.post("/break_type", async (req, res) => {
  try {
    let result = await break_type.create(req.body);
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

router.put("/break_type", async (req, res) => {
  try {
    await break_type.update(req.body, {
      where: { break_type_code: req.body.break_type_code },
    });

    res.json({
      // result ,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.delete("/break_type", async (req, res) => {
  try {
    let result = await break_type.destroy({
      where: { break_type_code: req.body.break_type_code },
    });
    res.json({
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

//Break type
router.get("/alert_mail", async (req, res) => {
  try {
    let result = await alert_mail.findAll({
      order: [["updatedAt", "DESC"]],
    });
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

router.post("/alert_mail", async (req, res) => {
  try {
    let result = await alert_mail.create(req.body);
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

router.put("/alert_mail", async (req, res) => {
  try {
    let result = await break_type.alert_mail(req.body, {
      where: { email: req.body.email, divisionCode: req.body.divisionCode },
    });

    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.delete("/alert_mail", async (req, res) => {
  try {
    let result = await alert_mail.destroy({
      where: { email: req.body.email, divisionCode: req.body.divisionCode },
    });
    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

router.get("/alert_mail/keyword/:keyword", async (req, res) => {
  try {
    console.log("Keyword")
    const { keyword } = req.params;
    let result = await alert_mail.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${keyword}%` } },
          { divisionCode: { [Op.like]: `%${keyword}%` } },
          { updateBy: { [Op.like]: `%${keyword}%` } },
        ],
      },
      order: [["updatedAt", "DESC"]],
    });
    res.json({
      message: constants.kResultOk,
      result,
    });
  } catch (error) {
    res.json({
      message: constants.kResultNok,
      error,
    });
  }
});

module.exports = router;
