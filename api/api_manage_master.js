const express = require("express");
const router = express.Router();
const division = require("./../model/division_master");
const user = require("./../model/user");
const plant = require("./../model/plant_master");

const constants = require("./../constant/constant");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.get("/user", async (req, res) => {
  try {
    user.belongsTo(division, { foreignKey: "divisionCode" });
    let result = await user.findAll({
      include: [
        {
          model: division,
        },
      ],
      order: [["lastLogOn", "DESC"]],
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

//Division
router.get("/division", async (req, res) => {
  try {
    let result = await division.findAll({
      order: [["divisionName"]],
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

router.get("/division/keyword/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    let result = await division.findAll({
      where: {
        [Op.or]: [
          { divisionCode: { [Op.like]: `%${keyword}%` } },
          { divisionName: { [Op.like]: `%${keyword}%` } },
          { PlantCode: { [Op.like]: `%${keyword}%` } },
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

router.post("/division", async (req, res) => {
  try {
    // encrypt password
    let result = await division.create(req.body);
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

router.put("/division", async (req, res) => {
  try {
    await division.update(req.body, {
      where: { divisionCode: req.body.divisionCode },
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

router.delete("/division", async (req, res) => {
  try {
    let result = await division.destroy({
      where: { divisionCode: req.body.divisionCode },
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

//Plant
router.get("/plant", async (req, res) => {
  try {
    let result = await plant.findAll({
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

router.get("/plant/keyword/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    let result = await plant.findAll({
      where: {
        [Op.or]: [
          { PlantCode: { [Op.like]: `%${keyword}%` } },
          { PlantName: { [Op.like]: `%${keyword}%` } },
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

router.post("/plant", async (req, res) => {
  try {
    // encrypt password
    let result = await plant.create(req.body);
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

router.put("/plant", async (req, res) => {
  try {
    await plant.update(req.body, {
      where: { PlantCode: req.body.PlantCode },
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

router.delete("/plant", async (req, res) => {
  try {
    let result = await plant.destroy({
      where: { PlantCode: req.body.PlantCode },
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

module.exports = router;
