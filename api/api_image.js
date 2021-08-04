const express = require("express");
const router = express.Router();
const home_image = require("./../model/home_image");
const constants = require("./../constant/constant");
const imageToBase64 = require("image-to-base64");
const formidable = require("formidable");
const fs = require("fs");

router.get("/home_image", async (req, res) => {
  try {
    let result = await home_image.findAll();

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

router.post("/home_image", async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      console.log("error : " + JSON.stringify(error));
      console.log("Fields : " + JSON.stringify(fields));
      console.log("Files : " + JSON.stringify(files));
      // console.log("Binary : " + base64_encode(files.file.path));
      var data = {
        fileType: files.file.type,
        fileData: await fs.readFileSync(files.file.path),
        updateBy: "Admin",
      };
      let result = await home_image.create(data);
      // fs.unlink(files.image.path);
      res.json({
        // result: JSON.stringify(result),
        message: constants.kResultOk,
      });
    });
  } catch (error) {
    res.json({
      error,
      message: constants.kResultNok,
    });
  }
});

router.delete("/home_image", async (req, res) => {
  try {
    let result = await home_image.destroy({
      where: { id: req.body.id },
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

module.exports = router;
