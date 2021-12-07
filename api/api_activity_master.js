const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");

//models
const activity_master = require('../model/activity_master');

//activity_master
router.get("/activity", async (req, res) => {
    try {
        let result = await activity_master.findAll({});
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

router.post("/activity", async (req, res) => {
    try {
        // encrypt password
        let result = await activity_master.create(req.body);
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

router.put("/activity", async (req, res) => {
    try {
        await activity_master.update(req.body, {
            where: { activity: req.body.activity },
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

router.delete("/activity", async (req, res) => {
    try {
        let result = await activity_master.destroy({
            where: { activity: req.body.activity },
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
