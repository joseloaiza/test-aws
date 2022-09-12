"use strict";

const chromium = require("chrome-aws-lambda");
const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");
const PDFKit = require("pdfkit");
const AWS = require("aws-sdk");
const SES = new AWS.SES({ region: process.env.REGION });
const S3 = new AWS.S3();
const validator = require("email-validator");
const nodemailer = require("nodemailer");

module.exports.listHeroesPdf = async (event, context) => {
  try {
    const doc = new PDFKit();
    var date = new Date();
    const mailTo = event.queryStringParameters.mail;
    if (!validator.validate(mailTo)) {
      return sendResponse(200, {
        message: "Enter a valid email address",
      });
    }

    doc.text("text");
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const filename = `${process.env.PDF_FOLDER}/${date}.pdf`;
    const params_s3 = {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      Body: buffers,
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
          filename: `${date}.pdf`,
          content: buffers,
        },
      ],
    };
    const transporter = nodemailer.createTransport({ SES });
    await transporter.sendMail(options);

    return sendResponse(200, { message: "OK" });
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not loaded heroes pdf",
      context,
      event,
    });
  }
};
