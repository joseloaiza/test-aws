"use strict";

const dynamoDb = require("../db");
const { sendResponse } = require("../functions/index");

module.exports.listHeroes = async (event) => {
  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
    };
    const posts = await dynamoDb.scan(params).promise();
    return sendResponse(200, { items: posts.Items });
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not get the heroes list",
    });
  }
};
