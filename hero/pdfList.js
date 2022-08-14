"use strict";
//const chromium = require("chrome-aws-lambda");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-serverless");
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
    await page.setContent("<html><body><p>Test</p></body></html>", {
      waitUntil: "load",
    });

    pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: 40,
        right: 0,
        bottom: 40,
        left: 0,
      },
      headerTemplate: `
          <div style="border-bottom: solid 1px gray; width: 100%; font-size: 11px;
                padding: 5px 5px 0; color: gray; position: relative;">
          </div>`,
      footerTemplate: `
          <div style="border-top: solid 1px gray; width: 100%; font-size: 11px;
              padding: 5px 5px 0; color: gray; position: relative;">
              <div style="position: absolute; right: 20px; top: 2px;">
                <span class="pageNumber"></span>/<span class="totalPages"></span>
              </div>
          </div>
        `,
    });

    return {
      headers: {
        "Content-type": "application/pdf",
        "content-disposition": "attachment; filename=test.pdf",
      },
      statusCode: 200,
      body: pdf.toString("base64"),
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
