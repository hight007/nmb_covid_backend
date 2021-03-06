const express = require("express");
const router = express.Router();
const constant = require("../constant/constant");
const provinces = require("../model/provinces");
const fs = require("fs-extra");

router.get("/distinctProvinces", async (req, res) => {
  try {
    let result = await provinces.sequelize.query(`
    SELECT distinct [pname] , [pcode]
    FROM [Provinces].[dbo].[provinces]
    order by [pname]
    `);
    res.json({ result: result[0], api_result: constant.kResultOk });
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/distinctDistrict/:provinceCode", async (req, res) => {
  try {
    const { provinceCode } = req.params;
    let result = await provinces.sequelize.query(`
    SELECT distinct [aname] , [acode]
    FROM [Provinces].[dbo].[provinces]
    where [pcode] = '${provinceCode}'
    order by [aname]
      `);
    res.json({ result: result[0], api_result: constant.kResultOk });
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/distinctSubDistrict/:districtCode", async (req, res) => {
  try {
    const { districtCode } = req.params;
    let result = await provinces.sequelize.query(`
    SELECT distinct [tname]
    FROM [Provinces].[dbo].[provinces]
    where  [acode] = '${districtCode}'
    order by [tname]
      `);
    res.json({ result: result[0], api_result: constant.kResultOk });
  } catch (error) {
    res.json({ error, api_result: constant.kResultNok });
  }
});

router.get("/thaiProvinces", async (req, res) => {
  let rawdata = await fs.readFileSync('json/thai_provinces.json', 'utf8');
  let thai_provinces = JSON.parse(rawdata);
  thai_provinces.sort(GetSortOrder("name_th"))
  res.json(thai_provinces)
})

function GetSortOrder(prop) {
  return function (a, b) {
    if (a[prop] > b[prop]) {
      return 1;
    } else if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  }
}


module.exports = router;

