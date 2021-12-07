const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");

//models
const risk_provinces = require('../model/risk_provinces');

//risk_provinces
router.get("/provinces", async (req, res) => {
    try {
        let result = await risk_provinces.findAll({ order: [["createdAt", "ASC"]]});
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

router.post("/provinces", async (req, res) => {
    try {
        // encrypt password
        let result = await risk_provinces.create(req.body);
        res.json({
            result,
            api_result: constants.kResultOk,
        });
    } catch (error) {
        res.json({
            error,
            api_result: constants.kResultNok,
        });
    }
});

router.put("/provinces", async (req, res) => {
    try {
        await risk_provinces.update(req.body, {
            where: { provinces: req.body.provinces },
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

router.delete("/provinces", async (req, res) => {
    try {
        let result = await risk_provinces.destroy({
            where: { provinces: req.body.provinces },
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
