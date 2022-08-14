"use strict";
const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");
var AWS = require("aws-sdk");
var S3 = new AWS.S3();
var excel = require("excel4node");
const {
  PointInTimeRecoveryDescriptionFilterSensitiveLog,
} = require("@aws-sdk/client-dynamodb");
var workbook = new excel.Workbook();
var worksheet = workbook.addWorksheet("Sheet 1");

module.exports.listHeroesExcel = async (event, context) => {
  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
    };
    var date = new Date();
    const heroes = await dynamoDb.scan(params).promise();
    if (heroes.Count > 0) {
      var items = heroes.Items;
      worksheet
        .cell(1, 1)
        .string("Id")
        .style({ font: { bold: true } });
      worksheet
        .cell(1, 2)
        .string("Name")
        .style({ font: { bold: true } });
      worksheet
        .cell(1, 3)
        .string("Alias")
        .style({ font: { bold: true } });
      worksheet
        .cell(1, 4)
        .string("Company Name")
        .style({ font: { bold: true } });
      worksheet
        .cell(1, 5)
        .string("Company Team")
        .style({ font: { bold: true } });
    }

    items.forEach((item, i) => {
      worksheet.cell(i + 2, 1).string(item.id);
      worksheet.cell(i + 2, 2).string(item.name);
      worksheet.cell(i + 2, 3).string(item.alias);
      worksheet.cell(i + 2, 4).string(item.companyName);
      worksheet.cell(i + 2, 5).string(item.companyTeam);
    });

    const buffer = await workbook.writeToBuffer();
    const filename = `${process.env.EXCEL_FOLDER}/${date}.xlsx`;
    const params_s3 = {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      Body: buffer,
    };

    await S3.upload(params_s3).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Content-type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
      isBase64Encoded: true,
      body: buffer.toString("base64"),
      //await workbook.write(namefile);

      // const file = await S3.getObject(process.env.BUCKET_NAME, namefile).promise();
      // S3.getObject(params, function (err, data) {
      //   if (err) {
      //     console.error(err.code, "-", err.message);
      //     return callback(err);
      //   }

      //   fs.writeFile("/tmp/filename", data.Body, function (err) {
      //     if (err) console.log(err.code, "-", err.message);

      //     return callback(err);
      //   });
      // });

      // workbook.writeToBuffer().then((buffer) => {
      //   var params = {
      //     Bucket: "data-heroes",
      //     Key: `xlsxFolder/${date}.xlsx`,
      //     Body: buffer,
      //     ACL: "public-read",
      //   };
      //   await S3.upload(params).promise();
      // });

      // return sendResponse(200, {
      //   message: "Excel loaded successfully",
      //   context,
      //   event,
      // });
    };
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not loaded heroes excel",
      context,
      event,
    });
  }
};
