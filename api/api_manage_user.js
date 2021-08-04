const express = require("express");
const router = express.Router();
const user = require("./../model/user");
const bcrypt = require("bcryptjs");
const constants = require("./../constant/constant");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const mailer = require("nodemailer");

router.get("/user", async (req, res) => {
  try {
    let result = await user.findAll({
      order: [["lastLogOn", "DESC"]],
      attributes: [
        "username",
        "empNumber",
        "levelUser",
        "divisionCode",
        "email",
        "lastLogOn",
        "updatedAt",
        "createdAt",
      ],
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

router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    let result = await user.findOne({
      where: {
        username: username,
      },
    });
    res.json({
      result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      result: JSON.stringify(error),
      message: constants.kResultNok,
    });
  }
});

router.get("/find_user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    let result = await user.findAll({
      where: {
        username: { [Op.like]: "%" + username + "%" },
        empNumber: { [Op.like]: "%" + username + "%" },
      },
      attributes: [
        "username",
        "empNumber",
        "levelUser",
        "divisionCode",
        "email",
        "lastLogOn",
        "updatedAt",
        "createdAt",
      ],
    });
    res.json({
      result: result,
      message: constants.kResultOk,
    });
  } catch (error) {
    res.json({
      result: JSON.stringify(error),
      message: constants.kResultNok,
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    // encrypt password
    req.body.password = bcrypt.hashSync(req.body.password, 8);
    randomKey = makeid(10);
    req.body.randomKey = randomKey;
    let result = await user.create(req.body);

    //send verify email
    try {
      var smtp = {
        host: "smtp.googlemail.com", //set to your host name or ip
        port: 465, //25, 465, 587 depend on your
        // secure: true, // use SSL
        auth: {
          user: "micnmb@gmail.com", //user account
          pass: "mic@admin", //user password
        },
      };

      var smtpTransport = mailer.createTransport(smtp);
      console.log(req.body.email);
      var mail = {
        from: "micnmb@gmail.com", //from email (option)
        to: req.body.email, //to email (require)
        subject: "Please verify your email (NMB AWS API)", //subject
        html:
          `<p>Please click below this link to verify your email</p>
        <a href='http://nmbtracking1.minebea.co.th:2003/verifyEmail/` +
          req.body.username +
          `/` +
          randomKey +
          `'>Click</a> or this link <a href='http://nmbtracking1.minebea.co.th:2003/verifyEmail/` +
          req.body.username +
          `/` +
          randomKey +
          `'>http://nmbtracking1.minebea.co.th:2003/verifyEmail/` +
          req.body.username +
          `/` +
          randomKey +
          `</a>`, //email body
      };

      await smtpTransport.sendMail(mail, function (error, _response) {
        smtpTransport.close();
        if (error) {
          //error handler
          res.json({
            error,
            message: constants.kResultNok,
          });
        } else {
          // res.json({
          //   result: _response,
          //   message: constants.kResultOk,
          // });
        }
      });
    } catch (error) {
      res.json({
        error,
        message: constants.kResultNok,
      });
    }

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

router.put("/user", async (req, res) => {
  try {
    if (req.body.password != null && req.body.password != "") {
      req.body.password = bcrypt.hashSync(req.body.password, 8);
    }

    await user.update(req.body, { where: { username: req.body.username } });

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

router.patch("/user", async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    console.log(username);
    const userData = await user.findOne({ where: { username } });
    const password = await bcrypt.hashSync(newPassword, 8);

    if (bcrypt.compareSync(oldPassword, userData.password)) {
      //Update new password
      let result = await user.update({ password }, { where: { username } });
      res.json({
        api_result: constants.kResultOk,
        result,
      });
    } else {
      res.json({
        api_result: constants.kResultNok,
        error: "Password old password mistake!",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      api_result: constants.kResultNok,
      error,
    });
  }
});

router.delete("/user", async (req, res) => {
  try {
    let result = await user.destroy({
      where: { username: req.body.username },
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

router.get("/verifyEmail/:username&:randomKey", async (req, res) => {
  try {
    console.log("verify");
    const { username, randomKey } = req.params;
    let result = await user.update(
      { levelUser: "user" },
      { where: { username, randomKey } }
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

router.patch("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const newPassword = await makeid(12);
    const password = await bcrypt.hashSync(newPassword, 8);
    await user.update({ password }, { where: { email } });
    let result = await user.findOne({ where: { email } });
    try {
      var smtp = {
        host: "smtp.googlemail.com", //set to your host name or ip
        port: 465, //25, 465, 587 depend on your
        // secure: true, // use SSL
        auth: {
          user: "micnmb@gmail.com", //user account
          pass: "mic@admin", //user password
        },
      };

      var smtpTransport = mailer.createTransport(smtp);
      var mail = {
        from: "micnmb@gmail.com", //from email (option)
        to: result.email, //to email (require)
        subject: "<Forgot password> re-created your new password", //subject
        html: `
        <p>Username : ${result.username}</p>
        <p>new password : ${newPassword}</p>
        <p>Please use this new password to log in again</p>`,
      };

      await smtpTransport.sendMail(mail, function (error, _response) {
        smtpTransport.close();
        if (error) {
          //error handler
          console.log(error);
          res.json({
            error,
            api_result: constants.kResultNok,
          });
        } else {
          res.json({
            api_result: constants.kResultOk,
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.json({
        error,
        api_result: constants.kResultNok,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      error,
      api_result: constants.kResultNok,
    });
  }
});

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
