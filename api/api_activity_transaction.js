const express = require("express");
const router = express.Router();
const constants = require("./../constant/constant");

//models
const activity_transaction = require('../model/activity_transaction');

//activity_transaction
router.get("/activity", async (req, res) => {
    try {
        let result = await activity_transaction.findAll({});
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

router.get("/activity_employee_number/:employee_number", async (req, res) => {
    try {
        const { employee_number } = req.params;
        let result = await activity_transaction.findAll({ where: { employee_number } });
        res.json({
            api_result: constants.kResultOk,
            result,
        });
    } catch (error) {
        console.log(error);
        res.json({
            api_result: constants.kResultNok,
            error,
        });
    }
});

router.post("/activity", async (req, res) => {
    try {
        // encrypt password
        console.log(req.body);
        let result = await activity_transaction.create(req.body);
        
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

router.put("/activity", async (req, res) => {
    try {
        await activity_transaction.update(req.body, {
            where: { transaction_id: req.body.transaction_id },
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
        let result = await activity_transaction.destroy({
            where: { transaction_id: req.body.transaction_id },
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
