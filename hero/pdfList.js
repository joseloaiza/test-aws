"use strict";

const chromium = require("chrome-aws-lambda");
const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");
var AWS = require("aws-sdk");
//var S3 = new AWS.S3();
module.exports.listHeroesPdf = async (event, context) => {
  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
    };
    let browser = null;
    let pdf = null;
    var date = new Date();
    //get list or heroes
    const ep = await chromium.executablePath;
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: ep,
      headless: chromium.headless,
    });
    const heroes = await dynamoDb.scan(params).promise();

    const page = await browser.newPage();
    await page.setContent(`<h1>Your awesome PDF report template</h1>`);

    pdf = await page.pdf({
      path: "/tmp/pdfReport.pdf", // TAKE ATTENTION!!
      format: "A4",
      printBackground: true,
      margin: { top: 20, left: 20, right: 20, bottom: 20 },
      displayHeaderFooter: true,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=test.pdf",
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Requested-With",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Done!",
      isBase64Encoded: true,
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
