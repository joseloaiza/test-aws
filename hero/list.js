"use strict";

const dynamoDb = require("../db");
const { sendResponse } = require("../functions/index");

module.exports.listHeroes = async (event) => {
  try {
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
    };
    const heroes = await dynamoDb.scan(params).promise();
    return sendResponse(200, { items: heroes.Items });
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not get the heroes list",
    });
  }
};
