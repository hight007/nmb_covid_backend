const express = require("express");
const constant = require("../constant/constant");
const router = express.Router();

const { Op } = require("sequelize");
const { QueryTypes } = require("sequelize");
const moment = require("moment");

//models
const rfid = require('../model/rfid');

router.post("/rfid", async (req, res) => {
    try {
        let result = await rfid.create(req.body);
        res.json({ result, api_result: constant.kResultOk });
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok });
    }
});

router.get("/rfid", async (req, res) => {
    try {
        let result = await rfid.findAll();
        res.json({ result, api_result: constant.kResultOk });
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok });
    }
});

router.get("/find/:rfid_", async (req, res) => {
    try {
        const { rfid_ } = req.params
        const result = await rfid.findOne({ where: { rfid: rfid_ } });
        const empNumber = result.empNumber
        res.json({ empNumber, api_result: constant.kResultOk });
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok });
    }
});

module.exports = router;