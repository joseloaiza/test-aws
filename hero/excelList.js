"use strict";
const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");
const fs = require("fs");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const SES = new AWS.SES({ region: process.env.REGION });
const validator = require("email-validator");
var excel = require("excel4node");
var workbook = new excel.Workbook();
var worksheet = workbook.addWorksheet("Sheet 1");

module.exports.listHeroesExcel = async (event, context) => {
  try {
    const mailTo = event.queryStringParameters.mail;
    if (!validator.validate(mailTo)) {
      return sendResponse(200, {
        message: "Enter a valid email address",
      });
    }
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
    };
    var date = new Date();
    //get list or heroes
    const heroes = await dynamoDb.scan(params).promise();
    //create new worksheet
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
      worksheet.cell(i + 2, 2).string(item.Heroname);
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
    //save the information in S3
    await S3.upload(params_s3).promise();
    const options = {
      from: "joseloaiza815@gmail.com",
      subject: "Hero Report",
      to: mailTo,
      text: "prueba reporte hero",
      html: `<div>${"Report Hero"}</div>`,
      attachments: [
        {
          filename: `${date}.xlsx`,
          content: buffer,
        },
      ],
    };
    const transporter = nodemailer.createTransport({ SES });
    await transporter.sendMail(options);

    return sendResponse(200, {
      message: "File upload successfully heroes excel in S3 and send email",
    });
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not loaded heroes excel",
      context,
      event,
    });
  }
};
