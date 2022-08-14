"use strict";

const { sendResponse } = require("../functions/index");
const dynamoDb = require("../dynamoDb");

module.exports.deleteHero = async (event) => {
  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: {
        id: event.pathParameters.id,
      },
    };
    await dynamoDb.delete(params).promise();
    return sendResponse(200, { message: "Hero deleted successfully" });
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not delete the hero",
    });
  }
};
Footer;
