const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");
const moment = require("moment");

//models
const long_holiday_date = require('../model/long_holiday_date');

//long_holiday_date
router.get("/holiday", async (req, res) => {
    try {
        let result = await long_holiday_date.findAll({ order: [["createdAt", "ASC"]], });
        res.json({
            api_result: constants.kResultOk,
            result,
        });
    } catch (error) {
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

router.get("/is_long_holiday/:long_holiday_date", async (req, res) => {
    try {
        const { long_holiday_date } = req.params;
        let result = await long_holiday_date.findAll({ where: { long_holiday_date } });
        if (result.length > 0) {
            result = true
        } else {
            result = false
        }
        res.json({
            api_result: constants.kResultOk,
            result,
        });
    } catch (error) {
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});


router.post("/holiday", async (req, res) => {
    try {
        // encrypt password
        req.body.long_holiday_date = moment(req.body.long_holiday_date).toDate()
        let result = await long_holiday_date.create(req.body);
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        console.log(error);
        res.json({
            error,
            api_result: constants.kResultNok,
        });
    }
});

router.put("/holiday", async (req, res) => {
    try {
        await long_holiday_date.update(req.body, {
            where: { long_holiday_date: req.body.long_holiday_date },
        });

        res.json({
            // result ,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

router.delete("/holiday", async (req, res) => {
    try {
        let result = await long_holiday_date.destroy({
            where: { long_holiday_date: req.body.long_holiday_date },
        });
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

module.exports = router;
