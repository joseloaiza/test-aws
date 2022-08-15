"use strict";

const chromium = require("chrome-aws-lambda");
const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");
const PDFDocument = require("pdfkit");
const AWS = require("aws-sdk");
//var S3 = new AWS.S3();
module.exports.listHeroesPdf = async (event, context) => {
  try {
    return new Promise((resolve) => {
      const doc = new PDFKit();

      doc.text("text");

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        const response = {
          statusCode: 200,
          headers: {
            "Content-Type": "application/pdf",
          },
          body: pdf.toString("base64"),
          isBase64Encoded: true,
        };
        resolve(response);
      });

      doc.end();
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
