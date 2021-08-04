const express = require("express");
const constant = require("../constant/constant");
const router = express.Router();

const { Op } = require("sequelize");
const json2xls = require("json2xls");
const fs = require("fs");
const { QueryTypes } = require("sequelize");
const moment = require("moment");

//models
const sinopharm = require('../model/sinopharm');

router.post("/sinopharm", async (req, res) => {
    try {
        // console.log(req.body);
        let result = await sinopharm.create(req.body);
        res.json({ result, api_result: constant.kResultOk });
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok });
    }
});

router.get('/sinopharm', async (req, res) => {
    try {
        console.log('start vaccine survey');
        const response = await sinopharm.sequelize.query(
            `WITH ranked_messages AS (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY [empNumber] ORDER BY id DESC) AS rn
        FROM [CovidCC].[dbo].[sinopharms] AS m
		)
		select [empNumber]
      ,[empName]
      ,[divisionName]
      ,[plant]
      ,[isNeedSinopharm]
      ,[province]
      ,[listDiseases]
      ,[isAgree]
      ,[createdAt]
      ,[updatedAt]
		 FROM ranked_messages
		 WHERE rn = 1
	  `,
            {
                type: QueryTypes.SELECT,
            }
        );
        var excelFilePath = `files/Doc/sinopharm_${moment().format('DDMMYYYY')}.xlsx`;

        var xls = await json2xls(response);
        await fs.writeFileSync(excelFilePath, xls, "binary");

        res.download(excelFilePath);
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok });
    }
})

module.exports = router;