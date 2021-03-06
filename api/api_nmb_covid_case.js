const express = require("express");
const formidable = require("formidable");
const constant = require("../constant/constant");
const router = express.Router();
const fs = require("fs");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
const { Parser } = require('json2csv');
const json2xls = require("json2xls");

//models
const nmb_covid_case = require("../model/nmb_covid_case")

router.post('/case', async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (error, fields, files) => {
            console.log("error : " + JSON.stringify(error));
            console.log("Fields : " + JSON.stringify(fields));
            console.log("Files : " + JSON.stringify(files));
            const {
                report_date,
                positive_result_date,
                employee_number,
                employee_name,
                processCode,
                jobDescription,
                divisionName,
                plantName,
                telephone_number,
                hospital_or_lab,
                detail,
                // status,
                treatment_start_date,
                // treatment_end_date,
                // stayHome_start_date,
                // stayHome_end_date,
                // returnToWork_date,
                // PCR_test_result,
                cause_type,
                cause_detail,
                updateBy,
            } = fields

            
            console.log('set path successfully');

            // check have this employee_number
            let casesThis_employee_number = await nmb_covid_case.findAll({
                where: { employee_number },
                order: [["updatedAt", "DESC"]],
            })

            const data = {
                report_date,
                positive_result_date,
                employee_number,
                employee_name,
                processCode,
                jobDescription,
                divisionName,
                plantName,
                telephone_number,
                hospital_or_lab,
                detail,
                treatment_start_date,

                cause_type,
                cause_detail,
                updateBy,
            };

            if (files.fileData_positive_result != null) {
                const fileData_positive_result = files.fileData_positive_result.path
                const fileType_positive_result = files.fileData_positive_result.type

                data.fileData_positive_result = await fs.readFileSync(fileData_positive_result)
                data.fileType_positive_result = fileType_positive_result
                // return res.json({ error: employee_number + ' ?????????????????????????????????????????????????????????????????????????????????', api_result: constant.kResultNok })
            }
            if (casesThis_employee_number.length > 0 && casesThis_employee_number[casesThis_employee_number.length - 1].returnToWork_date == null) {
                //check this employee_number have already return to work on last case
                return res.json({ error: employee_number + ' ??????????????????????????????????????????????????????????????????????????????????????????????????????', api_result: constant.kResultNok })
            }

            const result = await nmb_covid_case.create(data);

            // if (files.fileData_positive_result != null) {
            //     await fs.unlinkSync(fileData_positive_result);
            // }

            res.json({ id: result.case_id, api_result: constant.kResultOk })
        });
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/cases', async (req, res) => {
    try {
        let result = await nmb_covid_case.findAll({
            attributes: [
                'case_id',
                'report_date',
                'positive_result_date',
                'employee_number',
                'employee_name',
                'processCode',
                'jobDescription',
                'divisionName',
                'plantName',
                'telephone_number',
                'hospital_or_lab',
                'detail',
                'status',
                'treatment_start_date',
                'treatment_end_date',
                'stayHome_start_date',
                'stayHome_end_date',
                'returnToWork_date',
                'updateBy',
                'last_negative_result_date',
                'negative_result_count',
                'cause_type',
                'cause_detail',
                'PCR_test_result',
            ]
        })
        res.json({
            link_fileData_positive_result: 'http://54.255.187.109:2009/api/v1/nmb_covid_case/fileData_positive_result/<case_id>',
            link_fileData_negative_result: 'http://54.255.187.109:2009/api/v1/nmb_covid_case/fileData_negative_result/<case_id>',
            api_result: constant.kResultOk,
            result,
        })

    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/listDivisionName', async (req, res) => {
    try {
        let result = await nmb_covid_case.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('divisionName')), 'divisionName']],
            order: [["divisionName"]],
        })
        res.json({
            api_result: constant.kResultOk,
            result,
        })

    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/listPlantName', async (req, res) => {
    try {
        let result = await nmb_covid_case.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('plantName')), 'plantName']],
            order: [["plantName"]],
        })
        res.json({
            api_result: constant.kResultOk,
            result,
        })

    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/search/:keywords&:employee_number&:start_report_date&:end_report_date&:divisionName&:plantName', async (req, res) => {
    try {
        const { keywords, employee_number, start_report_date, end_report_date, divisionName, plantName } = req.params
        console.log(keywords, employee_number, start_report_date, end_report_date, divisionName, plantName);

        var where = {
            [Op.and]: [
                {
                    report_date: {
                        [Op.between]: [
                            moment(moment(start_report_date).format('DD-MMM-YYYY')).toDate(),
                            moment(moment(end_report_date).format('DD-MMM-YYYY')).toDate(),
                        ]
                    }
                }
            ]
        }
        if (keywords != 'all') {
            where = {
                [Op.or]: [
                    { employee_number: { [Op.like]: `%${keywords}%` } },
                    { employee_name: { [Op.like]: `%${keywords}%` } },
                    { jobDescription: { [Op.like]: `%${keywords}%` } },
                    { telephone_number: { [Op.like]: `%${keywords}%` } },
                    { hospital_or_lab: { [Op.like]: `%${keywords}%` } },
                    { status: { [Op.like]: `%${keywords}%` } },
                    { detail: { [Op.like]: `%${keywords}%` } },
                ]
            }
        }

        if (divisionName != 'all') {
            where[Op.and].push({ divisionName })
        }
        if (plantName != 'all') {
            where[Op.and].push({ plantName })
        }
        if (employee_number != 'all') {
            // where[Op.and].push({ employee_number })
            where = {
                employee_number
            }
        }
        console.log(employee_number);
        console.log(where);

        let result = await nmb_covid_case.findAll({
            attributes: [
                'case_id',
                'report_date',
                'positive_result_date',
                'employee_number',
                'employee_name',
                'processCode',
                'jobDescription',
                'divisionName',
                'plantName',
                'telephone_number',
                'hospital_or_lab',
                'detail',
                'status',
                'treatment_start_date',
                'treatment_end_date',
                'stayHome_start_date',
                'stayHome_end_date',
                'returnToWork_date',
                'updateBy',
                'last_negative_result_date',
                'negative_result_count',
                'cause_type',
                'cause_detail',
                'PCR_test_result',
            ],
            where
        })
        res.json({
            link_fileData_positive_result: 'http://54.255.187.109:2009/api/v1/nmb_covid_case/fileData_positive_result/<case_id>',
            link_fileData_negative_result: 'http://54.255.187.109:2009/api/v1/nmb_covid_case/fileData_negative_result/<case_id>',
            api_result: constant.kResultOk,
            result,
        })

    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/csv/:keywords&:employee_number&:start_report_date&:end_report_date&:divisionName&:plantName', async (req, res) => {
    try {
        const { keywords, employee_number, start_report_date, end_report_date, divisionName, plantName } = req.params
        console.log(keywords, employee_number, start_report_date, end_report_date, divisionName, plantName);

        var where = {
            [Op.and]: [
                {
                    report_date: {
                        [Op.between]: [
                            moment(moment(start_report_date).format('DD-MMM-YYYY')).toDate(),
                            moment(moment(end_report_date).format('DD-MMM-YYYY')).toDate(),
                        ]
                    }
                }
            ]
        }
        if (keywords != 'all') {
            where[Op.and].push({
                [Op.or]: [
                    { employee_name: { [Op.like]: `%${keywords}%` } },
                    { jobDescription: { [Op.like]: `%${keywords}%` } },
                    { telephone_number: { [Op.like]: `%${keywords}%` } },
                    { hospital_or_lab: { [Op.like]: `%${keywords}%` } },
                    { status: { [Op.like]: `%${keywords}%` } },
                    { detail: { [Op.like]: `%${keywords}%` } },
                ]
            })
        }
        if (employee_number != 'all') {
            where[Op.and].push({ employee_number })
        }
        if (divisionName != 'all') {
            where[Op.and].push({ divisionName })
        }
        if (plantName != 'all') {
            where[Op.and].push({ plantName })
        }

        let result = await nmb_covid_case.findAll({
            attributes: [
                'case_id',
                'report_date',
                'positive_result_date',
                'employee_number',
                'employee_name',
                'processCode',
                'jobDescription',
                'divisionName',
                'plantName',
                'telephone_number',
                'hospital_or_lab',
                'detail',
                'status',
                'treatment_start_date',
                'treatment_end_date',
                'stayHome_start_date',
                'stayHome_end_date',
                'returnToWork_date',
                'updateBy',
                'last_negative_result_date',
                'negative_result_count',
                'cause_type',
                'cause_detail',
                'PCR_test_result',
            ],
            where,
            raw: true,
        })

        var excelFilePath = `files/Doc/covid_case/covid_case_${keywords}_${employee_number}_${moment(start_report_date).format('DD-MMM-YYYY')}_${moment(end_report_date).format('DD-MMM-YYYY')}_${divisionName}_${plantName}.xlsx`;
        var xls = await json2xls(result);
        await fs.writeFileSync(excelFilePath, xls, "binary");
        res.download(excelFilePath);
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/case/:case_id', async (req, res) => {
    try {
        const { case_id } = req.params
        let result = await nmb_covid_case.findOne({
            where: { case_id },
            attributes: [
                'case_id',
                'report_date',
                'positive_result_date',
                'employee_number',
                'employee_name',
                'processCode',
                'jobDescription',
                'divisionName',
                'plantName',
                'telephone_number',
                'hospital_or_lab',
                'detail',
                'status',
                'treatment_start_date',
                'treatment_end_date',
                'stayHome_start_date',
                'stayHome_end_date',
                'returnToWork_date',
                'updateBy',
                'last_negative_result_date',
                'negative_result_count',
                'cause_type',
                'cause_detail',
                'PCR_test_result',
            ]
        })
        res.json({ result, api_result: constant.kResultOk })

    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/report', async (req, res) => {
    try {
        const result = await nmb_covid_case.sequelize.query(`
        SELECT
[plantName],
count([employee_number]) as [totalCases],
count(CASE WHEN CONVERT(date, DATEADD(HOUR, 7, DATEADD(HOUR, 7, [report_date]))) = CONVERT(date, getdate()) THEN 1 END) as [todayCases],
count(CASE WHEN CONVERT(date, DATEADD(HOUR, 7, DATEADD(HOUR, 7, [report_date]))) = CONVERT(date, DATEADD(DAY, -1, getdate())) THEN 1 END) as [yesterdayCases],
count(CASE WHEN ([stayHome_start_date] is null or CONVERT(date,DATEADD(HOUR, 7, [stayHome_start_date])) >= CONVERT(date, getdate())) and ([returnToWork_date]  is null or CONVERT(date,DATEADD(HOUR, 7, [returnToWork_date])) > CONVERT(date, getdate())) and [status] != 'fatality' THEN 1 END) as [hospital],
count(CASE WHEN ([stayHome_start_date] is not null and CONVERT(date,DATEADD(HOUR, 7, [stayHome_start_date])) < CONVERT(date, getdate())) and ([returnToWork_date]  is null or CONVERT(date,DATEADD(HOUR, 7, [returnToWork_date])) >= CONVERT(date,getdate())) and [status] != 'fatality' THEN 1 END) as [home],
count(CASE WHEN ([returnToWork_date]  is not null and CONVERT(date,DATEADD(HOUR, 7, [returnToWork_date])) <= CONVERT(date, getdate())) and [status] != 'fatality' THEN 1 END) as [returnToWork],
count(CASE WHEN [status] = 'fatality' THEN 1 END) as [fatality]
  FROM [CovidCC].[dbo].[nmb_covid_cases]
group by [plantName]
        `, {
            type: QueryTypes.SELECT,
        })

        const timeLineCase = await nmb_covid_case.sequelize.query(`DECLARE @cols AS NVARCHAR(MAX)
,@colsIsnull AS NVARCHAR(MAX)
,@colsSum AS NVARCHAR(MAX)
,@query  AS NVARCHAR(MAX);

SET @cols = STUFF((SELECT ',' + QUOTENAME([plantName])
			FROM [CovidCC].[dbo].[nmb_covid_cases]
			group by [plantName]
            FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)')
        ,1,1,'')

SET @colsIsnull = STUFF((SELECT ', isnull(' + QUOTENAME([plantName])+', 0) as '+QUOTENAME([plantName])
			FROM [CovidCC].[dbo].[nmb_covid_cases]
			group by [plantName]
            FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)')
        ,1,1,'')

SET @colsSum = STUFF((SELECT '+' + QUOTENAME([plantName])
			FROM [CovidCC].[dbo].[nmb_covid_cases]
			group by [plantName]
            FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)')
        ,1,1,'') 

SET @query = '
with a as (
SELECT CONVERT(date, DATEADD(HOUR, 7, DATEADD(HOUR, 7, [report_date]))) as [report_date],
       [plantName],
       COUNT(*) as [Case]
  FROM [CovidCC].[dbo].[nmb_covid_cases]
  group by CONVERT(date, DATEADD(HOUR, 7, DATEADD(HOUR, 7, [report_date]))) , [plantName]
  ), b as (
  select [report_date] , ' + @colsIsnull + ' from a
  PIVOT (SUM([Case]) FOR [plantName] IN (' + @cols + ')) AS P
  )
 select ' + @colsSum + ' as [Total] , *
  from b
  order by [report_date]
'
execute(@query)
        `, {
            type: QueryTypes.SELECT,
        })

        const listTimeLineCase = objectToArray(timeLineCase)

        var chartSeries = []
        for (let i = 0; i < listTimeLineCase.keyList.length; i++) {
            const item = listTimeLineCase.result[listTimeLineCase.keyList[i]];
            if (listTimeLineCase.keyList[i] != 'report_date') {
                if (listTimeLineCase.keyList[i] === 'Total') {
                    // chartSeries.push({
                    //     name: listTimeLineCase.keyList[i],
                    //     data: item,
                    //     type: 'line',
                    // })
                } else {
                    chartSeries.push({
                        name: listTimeLineCase.keyList[i],
                        data: item,
                        type: 'column',
                    })
                }

            }
        }
        chartCategories = listTimeLineCase.result.report_date

        res.json({
            chart_data: { chartSeries, chartCategories },
            api_result: constant.kResultOk,
            timeLineCase,
            result,
        })

    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/fileData_positive_result/:case_id', async (req, res) => {
    try {
        const { case_id } = req.params
        let result = await nmb_covid_case.findOne({
            where: { case_id },
            attributes: ['fileData_positive_result', 'fileType_positive_result']
        })
        res.type(result.fileType_positive_result);
        res.end(result.fileData_positive_result);
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.get('/fileData_negative_result/:case_id', async (req, res) => {
    try {
        const { case_id } = req.params
        let result = await nmb_covid_case.findOne({
            where: { case_id },
            attributes: ['fileData_negative_result', 'fileType_negative_result']
        })
        res.type(result.fileType_negative_result);
        res.end(result.fileData_negative_result);
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.put('/case', async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (error, fields, files) => {
            console.log("error : " + JSON.stringify(error));
            console.log("Fields : " + JSON.stringify(fields));
            console.log("Files : " + JSON.stringify(files));

            const {
                case_id,
                report_date,
                positive_result_date,
                employee_number,
                employee_name,
                processCode,
                jobDescription,
                divisionName,
                plantName,
                telephone_number,
                hospital_or_lab,
                detail,
                status,
                treatment_start_date,
                treatment_end_date,
                stayHome_start_date,
                stayHome_end_date,
                returnToWork_date,
                negative_result_count,
                last_negative_result_date,
                PCR_test_result,
                cause_type,
                cause_detail,
                updateBy,
            } = fields

            var data = {
                report_date,
                positive_result_date,
                employee_number,
                employee_name,
                processCode,
                jobDescription,
                divisionName,
                plantName,
                telephone_number,
                hospital_or_lab,
                detail,
                treatment_start_date,
                status,
                PCR_test_result,
                updateBy,
            };

            if (treatment_end_date !== 'null' && treatment_end_date != null) {
                data.treatment_end_date = treatment_end_date
            }

            if (stayHome_start_date !== 'null' && stayHome_start_date != null) {
                data.stayHome_start_date = stayHome_start_date
            } else {
                data.stayHome_start_date = null
            }

            if (stayHome_end_date !== 'null' && stayHome_end_date != null) {
                data.stayHome_end_date = stayHome_end_date
            } else {
                data.stayHome_end_date = null
            }

            if (returnToWork_date !== 'null' && returnToWork_date != null) {
                data.returnToWork_date = returnToWork_date
            } else {
                data.returnToWork_date = null
            }

            if (negative_result_count !== 'null' && negative_result_count != null) {
                data.negative_result_count = negative_result_count
            }
            if (last_negative_result_date !== 'null' && last_negative_result_date != null) {
                data.last_negative_result_date = last_negative_result_date
            }
            if (cause_type !== 'null' && cause_type != null) {
                data.cause_type = cause_type
            }
            if (cause_detail !== 'null' && cause_detail != null) {
                data.cause_detail = cause_detail
            }

            if (files.fileData_positive_result) {
                const fileData_positive_result = files.fileData_positive_result.path
                const fileType_positive_result = files.fileData_positive_result.type
                data.fileData_positive_result = await fs.readFileSync(fileData_positive_result)
                data.fileType_positive_result = fileType_positive_result
            }
            if (files.fileData_negative_result) {
                const fileData_negative_result = files.fileData_negative_result.path
                const fileType_negative_result = files.fileData_negative_result.type
                data.fileData_negative_result = await fs.readFileSync(fileData_negative_result)
                data.fileType_negative_result = fileType_negative_result
            }

            await nmb_covid_case.update(data, { where: { case_id } })
            res.json({ api_result: constant.kResultOk })
        })
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})

router.delete('/case', async (req, res) => {
    try {
        const { case_id } = req.body
        let result = await nmb_covid_case.destroy({ where: { case_id } })
        res.json({ result, api_result: constant.kResultOk })
    } catch (error) {
        console.log(error);
        res.json({ error, api_result: constant.kResultNok })
    }
})


const objectToArray = (array) => {
    var keyList = Object.keys(array[0])
    var result = {}
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        for (let j = 0; j < keyList.length; j++) {
            const key = keyList[j];
            var temp = []
            if (result[key] != null) {
                temp = result[key]
            }
            temp.push(item[key])
            result[key] = temp
        }

    }
    return { result, keyList }
}

module.exports = router;
