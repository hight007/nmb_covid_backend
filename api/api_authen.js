const express = require("express");
const router = express.Router();
const user = require("./../model/user");
const bcrypt = require("bcryptjs");
const constants = require("./../constant/constant");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //test
  let result = await user.findOne({ where: { username: username } });
  if (result != null) {
    if (
      result.levelUser == "user" ||
      result.levelUser == "power" ||
      result.levelUser == "admin"
    ) {
      if (bcrypt.compareSync(password, result.password)) {
        res.json({
          result,
          message: constants.kResultOk,
        });
      } else {
        res.json({
          result: "Incorrect password",
          message: constants.kResultNok,
        });
      }
    } else {
      res.json({
        result: "permission not allow ,Please verify you account",
        message: constants.kResultNok,
      });
    }
  } else {
    res.json({
      result: "Incorrect username",
      message: constants.kResultNok,
    });
  }
});

module.exports = router;
