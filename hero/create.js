"use strict";
const dynamoDb = require("../db");
const { sendResponse } = require("../functions/index");
const { v4: uuidv4 } = require("uuid");

module.exports.createHero = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body);
  try {
    const { name, alias, specie, companyName, companyTeam } = body;
    const id = uuidv4();
    const TableName = process.env.DYNAMO_TABLE_NAME;
    const params = {
      TableName,
      Item: {
        id,
        name,
        alias,
        specie,
        companyName,
        companyTeam,
      },
      ConditionExpression: "attribute_not_exists(id)",
    };
    await dynamoDb.put(params).promise();
    return sendResponse(200, { message: "Hero created successfully" });
  } catch (e) {
    return sendResponse(500, { message: "Could not create the hero" });
  }
};
